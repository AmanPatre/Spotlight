import { inngest } from "./client";
import { prismaClient } from "../lib/prismaClient";
import { Resend } from "resend";
import { HotLeadsDigest } from "../emails/HotLeadsDigest";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const processWebinarEnd = inngest.createFunction(
    {
        id: "process-webinar-end",
        name: "Process Webinar End",
        triggers: [{ event: "app/webinar.ended" }]
    },
    async ({ event, step }) => {
        const { webinarId, presenterEmail } = event.data;



        // Step 2: Fetch all attendees who went to the breakout room
        const breakoutAttendances = await step.run("fetch-breakout-attendees", async () => {
            return prismaClient.attendance.findMany({
                where: {
                    webinarId,
                    attendedType: "FOLLOW_UP",
                },
                include: {
                    user: true, // Attendee info
                    webinar: true,
                },
            });
        });

        // Step 2.5: Now wait 5 minutes for VAPI calls to sync/complete before scoring
        // (Moved here so we don't wait if there are no attendees)
        await step.sleep("wait-for-calls-sync", "5m");

        if (!breakoutAttendances || breakoutAttendances.length === 0) {
            return { message: "No breakout attendees found." };
        }

        const webinar = breakoutAttendances[0].webinar;

        const hotLeads: { name: string; email: string; score: number; summary: string }[] = [];

        // Step 3: Loop through attendees to score leads
        // Note: step.run allows us to track each scoring individually and retry them safely if they fail
        for (const attendance of breakoutAttendances) {
            const result = await step.run(`score-lead-${attendance.id}`, async () => {
                try {
                    // Normally you'd fetch the specific VAPI transcript here using an integration 
                    // For now, we mock the transcript string assuming it's fetched from VAPI's /call endpoint.
                    // In a production scenario: 
                    // const vapiCall = await fetch(`https://api.vapi.ai/call/${attendance.user.id}`, ...);
                    const mockTranscript = `The attendee ${attendance.user.name} said: "This is exactly what I need! How do I pay right now? I'm ready to get started immediately."`;

                    // Ensure Google API Key is available
                    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                        console.warn("GOOGLE_GENERATIVE_AI_API_KEY missing");
                        return null;
                    }

                    // Use Gemini to score the lead
                    const { object } = await generateObject({
                        model: google("gemini-2.0-flash"),
                        schema: z.object({
                            summary: z.string().describe("A 1-2 sentence high-level summary of the call."),
                            score: z.number().min(1).max(10).describe("A rating from 1-10 on how hot this lead is, based on buying/intent signals."),
                        }),
                        prompt: `
              Analyze the following sales call transcript between an AI sales agent and an attendee named ${attendance.user.name}.
              Give a 1-10 lead score based on their intent to purchase or book a meeting. 8-10 means immediate high buying intent. 
              Also, write a 1-2 sentence debrief summary of their concerns/interest.
              
              Transcript:
              ${mockTranscript}
            `,
                    });

                    const isHotLead = object.score >= 3;

                    // Save the debrief in our Postgres DB
                    await prismaClient.callDebrief.upsert({
                        where: { attendanceId: attendance.id },
                        update: {
                            score: object.score,
                            summary: object.summary,
                            isHotLead
                        },
                        create: {
                            attendanceId: attendance.id,
                            score: object.score,
                            summary: object.summary,
                            isHotLead
                        }
                    });

                    return {
                        name: attendance.user.name,
                        email: attendance.user.email,
                        score: object.score,
                        summary: object.summary,
                        isHotLead
                    };
                } catch (error) {
                    console.error("Scoring failed for", attendance.id, error);
                    return null; // Skip if it explicitly fails
                }
            });

            if (result && result.isHotLead) {
                hotLeads.push({
                    name: result.name,
                    email: result.email,
                    score: result.score,
                    summary: result.summary,
                });
            }
        }

        // Step 4: Dispatch the summary email if we have hot leads
        if (hotLeads.length > 0 && presenterEmail) {
            await step.run("send-hot-leads-digest", async () => {
                try {
                    await resend.emails.send({
                        from: "Spotlight Notifications <onboarding@resend.dev>", // Default for Resend sandbox
                        to: [presenterEmail],
                        subject: `🚨 Hot Leads Available: ${webinar.title}`,
                        react: HotLeadsDigest({
                            webinarTitle: webinar.title,
                            hotLeads,
                            totalAttendees: breakoutAttendances.length,
                        }) as React.ReactElement,
                    });
                } catch (error) {
                    console.error("Resend error:", error);
                    throw error; // Let Inngest retry this step if Resend fails
                }
            });
        }

        return {
            message: "Webinar processed successfully.",
            totalProcessed: breakoutAttendances.length,
            hotLeadsCount: hotLeads.length
        };
    },
);
