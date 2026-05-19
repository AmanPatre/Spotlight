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
    for (const type of Object.values(AttendedTypeEnum)) {
      if (
        type === AttendedTypeEnum.ADDED_TO_CART &&
        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      if (
        type === AttendedTypeEnum.BREAKOUT_ROOM &&
        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      const countItem = attendanceCounts.find((item) => {
        if (
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          type === AttendedTypeEnum.BREAKOUT_ROOM &&
          item.attendedType === AttendedTypeEnum.ADDED_TO_CART
        ) {
          return true;
        }

        return item.attendedType === type;
      });

      result[type] = {
        count: countItem ? countItem._count.attendedType : 0,
        users: [],
      };
    }

    if (options.inlcudeUsers) {
      for (const type of Object.values(AttendedTypeEnum)) {
        if (
          (type === AttendedTypeEnum.ADDED_TO_CART &&
            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL) ||
          (type === AttendedTypeEnum.BREAKOUT_ROOM &&
            webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL)
        ) {
          continue;
        }

        const queryType =
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
            type === AttendedTypeEnum.BREAKOUT_ROOM
            ? AttendedTypeEnum.ADDED_TO_CART
            : type;

        if (result[type].count > 0) {
          const attendances = await prismaClient.attendance.findMany({
            where: {
              webinarId,
              attendedType: queryType,
            },
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

