"use server";

import { prismaClient } from "@/lib/prismaClient";
import { onAuthenticateUser } from "./auth";
import { getVapiAssistants } from "./vapi";
import { AttendedTypeEnum, WebinarStatusEnum } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

export const getHomeDashboardData = async () => {
    try {
        const auth = await onAuthenticateUser();
        if (!auth.user) return { success: false, data: null };

        // 1. Fetch Basic Metrics
        const webinars = await prismaClient.webinar.findMany({
            where: { presenterId: auth.user.id },
            select: {
                id: true,
                price: true,
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
                        OR: [
                            { CallDebrief: { isNot: null } },
                            { attendedType: AttendedTypeEnum.CONVERTED }
                        ]
                    },
                    select: {
                        attendedType: true,
                        CallDebrief: {
                            select: {
                                isHotLead: true,
                                score: true,
                            }
                        }
                    }
                }
            }
        });

        const totalAttendees = webinars.reduce((sum, w) => sum + w._count.attendances, 0);

        const pipelineValue = webinars.reduce((sum, w) => {
            const convertedCount = w.attendances.filter(a => a.attendedType === AttendedTypeEnum.CONVERTED).length;
            return sum + (convertedCount * (w.price || 0));
        }, 0);

        // 2. Fetch Active Agents
        const vapi = await getVapiAssistants();
        const activeAgents = vapi.success && vapi.assistants ? vapi.assistants.length : 0;

        // 3. Upcoming Streams
        const upcoming = await prismaClient.webinar.findMany({
            where: {
                presenterId: auth.user.id,
                startTime: { gte: new Date() },
                webinarStatus: { not: WebinarStatusEnum.ENDED }
            },
            include: {
                presenter: { select: { name: true } },
                _count: { select: { attendances: true } }
            },
            orderBy: { startTime: "asc" },
            take: 5
        });

        // 4. Recent Debriefs (Ended webinars with AI data)
        const recentDebriefs = await prismaClient.webinar.findMany({
            where: {
                presenterId: auth.user.id,
                webinarStatus: WebinarStatusEnum.ENDED,
                attendances: {
                    some: { CallDebrief: { isNot: null } }
                }
            },
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        attendances: {
                            where: { attendedType: { not: AttendedTypeEnum.REGISTERED } }
                        }
                    }
                },
                attendances: {
                    where: { CallDebrief: { isNot: null } },
                    select: {
                        CallDebrief: { select: { isHotLead: true } }
                    }
                }
            },
            orderBy: { updatedAt: "desc" },
            take: 5
        });

        const processedDebriefs = recentDebriefs.map(rd => {
            const attendees = rd._count.attendances;
            const hotLeads = rd.attendances.filter(a => a.CallDebrief?.isHotLead).length;
            const conversion = attendees > 0 ? (hotLeads / attendees) * 100 : 0;

            return {
                id: rd.id,
                title: rd.title,
                status: "Analyzed",
                conversion: conversion.toFixed(1) + "%"
            };
        });

        return {
            success: true,
            data: {
                metrics: {
                    totalAttendees,
                    activeAgents,
                    pipelineValue: formatCurrency(pipelineValue)
                },
                upcoming: upcoming.map(u => ({
                    title: u.title,
                    host: u.presenter.name,
                    time: u.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                    reg: u._count.attendances.toLocaleString()
                })),
                debriefs: processedDebriefs
            }
        };
    } catch (error) {
        console.error("Error fetching home dashboard data", error);
        return { success: false, data: null };
    }
};
