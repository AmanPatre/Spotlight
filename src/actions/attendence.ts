"use server";

import { AttendedTypeEnum, CtaTypeEnum } from "@/generated/prisma/enums";
import { prismaClient } from "@/lib/prismaClient";
import { AttendanceData } from "@/lib/type";
import { revalidatePath } from "next/cache";

// we are geting the webinar info here

export const getWebinarAttendence = async (
  webinarId: string,
  options: {
    inlcudeUsers?: boolean;
    userLimit?: number;
  } = { inlcudeUsers: true, userLimit: 100 },
) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      select: {
        id: true,
        ctaType: true,
        tags: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!webinar) {
      return {
        success: false,
        status: 404,
        error: "Webinar not  found",
      };
    }

    const attendanceCounts = await prismaClient.attendance.groupBy({
      by: ["attendedType"],
      where: {
        webinarId,
      },
      _count: {
        attendedType: true,
      },
    });
    const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<
      AttendedTypeEnum,
      AttendanceData
    >;

    let totalRegisteredCount = 0;
    let totalAttendedCount = 0;

    for (const countItem of attendanceCounts) {
      totalRegisteredCount += countItem._count.attendedType;
      if (countItem.attendedType !== AttendedTypeEnum.REGISTERED) {
        totalAttendedCount += countItem._count.attendedType;
      }
    }

    for (const type of Object.values(AttendedTypeEnum)) {
      if (
        type === AttendedTypeEnum.ADDED_TO_CART &&
        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      if (
        (type === AttendedTypeEnum.BREAKOUT_ROOM || type === AttendedTypeEnum.FOLLOW_UP) &&
        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      let count = 0;

      if (type === AttendedTypeEnum.REGISTERED) {
        count = totalRegisteredCount;
      } else if (type === AttendedTypeEnum.ATTENDED) {
        count = totalAttendedCount;
      } else {
        const countItem = attendanceCounts.find(
          (item) => item.attendedType === type
        );
        count = countItem ? countItem._count.attendedType : 0;
      }

      result[type] = {
        count,
        users: [],
      };
    }

    if (options.inlcudeUsers) {
      for (const type of Object.values(AttendedTypeEnum)) {
        if (
          (type === AttendedTypeEnum.ADDED_TO_CART &&
            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL) ||
          ((type === AttendedTypeEnum.BREAKOUT_ROOM || type === AttendedTypeEnum.FOLLOW_UP) &&
            webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL)
        ) {
          continue;
        }

        if (result[type].count > 0) {
          let whereClause: any = { webinarId };

          if (type === AttendedTypeEnum.REGISTERED) {
            // No additional filter, we want everyone
          } else if (type === AttendedTypeEnum.ATTENDED) {
            whereClause.attendedType = { not: AttendedTypeEnum.REGISTERED };
          } else {
            whereClause.attendedType = type;
          }

          const attendances = await prismaClient.attendance.findMany({
            where: whereClause,
            include: {
              user: true,
            },
            take: options.userLimit, // limit the number of users returned
            orderBy: {
              joinedAt: "desc", // Most recent first
            },
          });

          result[type].users = attendances.map((attendance) => attendance.user);
        }
      }
    }

    return {
      success: true,
      data: result,
      ctaType: webinar.ctaType,
      webinarTags: webinar.tags || [],
    };
  } catch (error) {
    console.error("Failed to fetch attendance data ", error);
    return {
      success: false,
      error: "Failed to fetch the attendence data",
    };
  }
};

/**
 * PHASE 3: Public Attendee Flow
 * Register a new attendee or update an existing one by email
 */
export const registerAttendee = async (
  webinarId: string,
  name: string,
  email: string
) => {
  try {
    // 1. Upsert Attendee by email
    const attendee = await prismaClient.attendee.upsert({
      where: { email },
      create: { email, name },
      update: {}, // Don't implicitly update names for all past webinars if they reuse their email
    });

    // 2. Upsert Attendance record as REGISTERED
    await prismaClient.attendance.upsert({
      where: {
        attendeeId_webinarId: {
          attendeeId: attendee.id,
          webinarId,
        },
      },
      create: {
        attendeeId: attendee.id,
        webinarId,
        attendedType: AttendedTypeEnum.REGISTERED,
      },
      update: {}, // Don't overwrite if already exists
    });

    return { success: true, attendeeId: attendee.id };
  } catch (error) {
    console.error("Error registering attendee", error);
    return { success: false, message: "Failed to register" };
  }
};

/**
 * PHASE 3: Update an attendee's status (e.g. from REGISTERED to ATTENDED)
 */
export const updateAttendanceStatus = async (
  webinarId: string,
  attendeeId: string,
  status: AttendedTypeEnum
) => {
  try {
    const enumOrder: Record<AttendedTypeEnum, number> = {
      [AttendedTypeEnum.REGISTERED]: 0,
      [AttendedTypeEnum.ATTENDED]: 1,
      [AttendedTypeEnum.ADDED_TO_CART]: 2,
      [AttendedTypeEnum.BREAKOUT_ROOM]: 3,
      [AttendedTypeEnum.FOLLOW_UP]: 4,
      [AttendedTypeEnum.CONVERTED]: 5,
    };

    const currentAttendance = await prismaClient.attendance.findUnique({
      where: { attendeeId_webinarId: { attendeeId, webinarId } },
      select: { attendedType: true }
    });

    if (
      currentAttendance &&
      enumOrder[status] <= enumOrder[currentAttendance.attendedType]
    ) {
      // Don't downgrade or do unnecessary update
      return { success: true };
    }

    await prismaClient.attendance.update({
      where: {
        attendeeId_webinarId: {
          attendeeId,
          webinarId,
        },
      },
      data: {
        attendedType: status,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating attendance status", error);
    return { success: false };
  }
};

import { onAuthenticateUser } from "./auth";

/**
 * PHASE 5: Fetch all leads across all webinars for a user
 */
export const getAllLeads = async () => {
  try {
    const auth = await onAuthenticateUser();
    if (!auth.user) {
      return { success: false, leads: [] };
    }

    const attendances = await prismaClient.attendance.findMany({
      where: {
        webinar: { presenterId: auth.user.id },
      },
      include: {
        user: true,
        webinar: {
          select: { title: true, tags: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, leads: attendances };
  } catch (error) {
    console.error("Error fetching all leads", error);
    return { success: false, leads: [] };
  }
};

/**
 * PHASE 5: Fetch broad overview of all webinars for the leads dashboard
 */
export const getWebinarLeadsOverview = async () => {
  try {
    const auth = await onAuthenticateUser();
    if (!auth.user) return { success: false, webinars: [] };

    const webinars = await prismaClient.webinar.findMany({
      where: { presenterId: auth.user.id },
      select: {
        id: true,
        title: true,
        webinarStatus: true,
        startTime: true,
        _count: {
          select: {
            attendances: {
              where: {
                attendedType: { not: AttendedTypeEnum.REGISTERED }
              }
            }
          }
        },
        attendances: {
          where: {
            CallDebrief: { isNot: null }
          },
          select: {
            CallDebrief: {
              select: {
                isHotLead: true,
                summary: true,
                score: true,
              }
            }
          }
        }
      },
      orderBy: { startTime: "desc" }
    });

    const processedWebinars = webinars.map(w => {
      const hotLeadsCount = w.attendances.filter(a => a.CallDebrief?.isHotLead).length;
      // Get a representative summary from the highest scoring lead if available
      const bestDebrief = w.attendances.sort((a, b) => (b.CallDebrief?.score || 0) - (a.CallDebrief?.score || 0))[0]?.CallDebrief;

      return {
        id: w.id,
        title: w.title,
        status: w.webinarStatus,
        date: w.startTime,
        totalAttendees: w._count.attendances,
        hotLeads: hotLeadsCount,
        summary: bestDebrief?.summary || "No AI briefing available yet.",
        pipelineValue: hotLeadsCount * 15000, // Mock value calculation for demo
      };
    });

    return { success: true, webinars: processedWebinars };
  } catch (error) {
    console.error("Error fetching webinar leads overview", error);
    return { success: false, webinars: [] };
  }
};

/**
 * PHASE 5: Fetch detailed leads for a specific webinar
 */
export const getWebinarLeadsDetail = async (webinarId: string) => {
  try {
    const auth = await onAuthenticateUser();
    if (!auth.user) return { success: false, leads: null };

    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId, presenterId: auth.user.id },
      select: { title: true, startTime: true, tags: true }
    });

    if (!webinar) return { success: false, leads: null };

    const attendances = await prismaClient.attendance.findMany({
      where: { webinarId },
      include: {
        user: true,
        CallDebrief: true,
      },
      orderBy: {
        joinedAt: "desc"
      }
    });

    return {
      success: true,
      webinar,
      leads: attendances
    };
  } catch (error) {
    console.error("Error fetching webinar leads detail", error);
    return { success: false, leads: null };
  }
};

export const getAttendeeStatus = async (
  webinarId: string,
  attendeeId: string
) => {
  try {
    const attendance = await prismaClient.attendance.findUnique({
      where: {
        attendeeId_webinarId: {
          attendeeId,
          webinarId,
        },
      },
      select: {
        attendedType: true,
      },
    });

    return { success: true, attendedType: attendance?.attendedType || null };
  } catch (error) {
    console.error("Error fetching attendee status", error);
    return { success: false };
  }
};

