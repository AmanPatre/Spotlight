"use server";

import { WebinarFormState } from "@/store/useWebinarStore";
import { onAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { WebinarStatusEnum } from "@prisma/client";
import { getVapiAssistantById } from "./vapi";
import { inngest } from "@/inngest/client";

function combineDateTime(
  date: Date,
  timeStr: string,
): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");

  const hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr || "0", 10);

  // Input date is normalized to UTC midnight, and time is in 24h IST (UTC+5:30).
  // Reconstruct the full IST datetime as UTC by subtracting 5h30m (330 minutes).
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Create a UTC timestamp representing the IST time
  const istAsUtcMs =
    Date.UTC(year, month, day, hours, minutes, 0, 0) - 330 * 60 * 1000;

  return new Date(istAsUtcMs);
}

export const createWebinar = async (formData: WebinarFormState) => {
  try {
    const user = await onAuthenticateUser();

    if (!user.user) {
      return { status: 401, message: "Unauthorized" };
    }

    //TODO: Check if user has a subscription

    const presenterId = user.user.id;

    console.log("Form Data:", formData, presenterId);

    if (!formData.basicInfo.webinarName) {
      return { status: 404, message: "Webinar name is required" };
    }

    if (!formData.basicInfo.date) {
      return { status: 404, message: "Webinar date is required" };
    }

    if (!formData.basicInfo.time) {
      return { status: 404, message: "Webinar time is required" };
    }

    if (!formData.basicInfo.description) {
      return { status: 404, message: "Webinar description is required" };
    }
    const combinedDateTime = combineDateTime(
      formData.basicInfo.date,
      formData.basicInfo.time,
    );

    const now = new Date();

    if (combinedDateTime < now) {
      return {
        status: 400,
        message: "Webinar date and time cannot be in the past",
      };
    }

    const webinar = await prismaClient.webinar.create({
      data: {
        title: formData.basicInfo.webinarName,
        description: formData.basicInfo.description || "",
        startTime: combinedDateTime,
        tags: formData.cta.tags || [],
        ctaLabel: formData.cta.ctaLabel,
        ctaType: formData.cta.ctaType,
        aiAgentId: formData.cta.aiAgent || null,
        priceId: formData.cta.priceId || null,
        lockChat: formData.additionalInfo.lockChat || false,
        couponCode: formData.additionalInfo.couponEnabled
          ? formData.additionalInfo.couponCode
          : null,
        couponEnabled: formData.additionalInfo.couponEnabled || false,
        presenterId: presenterId,
        productTitle: formData.productInfo.productTitle,
        price: formData.productInfo.price,
        currency: formData.productInfo.currency,
        originalPrice: formData.productInfo.originalPrice,
      },
    });

    revalidatePath("/");

    return {
      status: 200,
      message: "Webinar created Successfully",
      webinarId: webinar.id,
      webinarLink: `/webinar/${webinar.id}`,
      managementLink: `/webinars/${webinar.id}`,
    }
  } catch (error) {
    console.error("Error creating webinar", error);
    return {
      status: 500,
      message: "Failed to create webinar. Please try again"
    };
  }
};

export const getWebinarByPresenterId = async (
  presenterId: string
) => {
  try {
    const webinars = await prismaClient.webinar.findMany({
      where: { presenterId },

      include: {
        presenter: {
          select: {
            name: true,
            stripeConnectId: true,
            id: true,
          },
        },
      },
    })

    return webinars
  } catch (error) {
    console.error("error getting webinars", error)
    return []
  }
}
export const getWebinarById = async (webinarId: string) => {
  noStore();
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      include: {
        presenter: {
          select: { name: true, stripeConnectId: true, id: true },
        },
      },
    });

    if (!webinar) {
      console.log("Webinar NOT found in database for ID:", webinarId);
      return null;
    }

    if (webinar.aiAgentId) {
      const vapiRes = await getVapiAssistantById(webinar.aiAgentId);
      if (vapiRes.success && vapiRes.assistant) {
        return {
          ...webinar,
          aiAgentName: vapiRes.assistant.name || "Untitled Agent",
        };
      }
    }

    return { ...webinar, aiAgentName: null };
  } catch (error) {
    console.error("Error fetching webinar for ID:", webinarId, error);
    return null;
  }
};

export const updateWebinarStatus = async (
  webinarId: string,
  status: WebinarStatusEnum
) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) return { status: 401, message: "Unauthorized" };

    const updateData: { webinarStatus: WebinarStatusEnum; endTime?: Date } = {
      webinarStatus: status
    };

    if (status === WebinarStatusEnum.ENDED) {
      updateData.endTime = new Date();
    }

    await prismaClient.webinar.update({
      where: { id: webinarId },
      data: updateData,
    });

    let inngestMsg = "Not triggered";
    if (status === "ENDED") {
      try {
        const sendResult = await inngest.send({
          name: "app/webinar.ended",
          data: {
            webinarId,
            presenterEmail: user.user.email,
          },
        });
        inngestMsg = "Sent ID: " + (sendResult.ids?.[0] || "success");
      } catch (error: unknown) {
        inngestMsg = "Error: " + (error instanceof Error ? error.message : String(error));
      }
    }

    revalidatePath(`/webinars/${webinarId}`);
    revalidatePath(`/webinar/${webinarId}`);
    return {
      status: 200,
      message: "Status updated",
      debug: inngestMsg
    };
  } catch (error: unknown) {
    return { status: 500, message: "Prisma or Server Error: " + (error instanceof Error ? error.message : String(error)) };
  }
};

/**
 * PHASE 3: Public Attendee Flow
 * Get just the status of a webinar (for polling)
 */
export const getWebinarStatus = async (webinarId: string) => {
  noStore();
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      select: { webinarStatus: true },
    });
    return webinar?.webinarStatus || null;
  } catch (error) {
    console.error("Error fetching webinar status", error);
    return null;
  }
};



