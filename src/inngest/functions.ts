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



        // Step 2: Fetch all attendees who were in the webinar (not just registered)
        const breakoutAttendances = await step.run("fetch-active-attendees", async () => {
            return prismaClient.attendance.findMany({
                where: {
                    webinarId,
                    attendedType: { in: ["ATTENDED", "ADDED_TO_CART", "BREAKOUT_ROOM", "FOLLOW_UP", "CONVERTED"] },
                },
                include: {
                    user: true,
                    webinar: true,
                },
            });
        });

        if (!breakoutAttendances || breakoutAttendances.length === 0) {
            return { message: "No active attendees found." };
        }

        const webinar = breakoutAttendances[0].webinar;
        const isBookCall = webinar.ctaType === "BOOK_A_CALL";

        // Step 2.5: Only wait for calls if it's a Book a Call session (AI based)
        if (isBookCall) {
            await step.sleep("wait-for-calls-sync", "5m");
        }

        const webinarPrice = webinar.price || 0;
        const currency = webinar.currency || "INR";

        // Calculate actual live duration
        const liveDurationSeconds = Math.max(
            ((new Date().getTime() - new Date(webinar.startTime).getTime()) / 1000),
            (webinar.duration || 60) * 60
        );
        // If the webinar was shorter than scheduled, use the actual time it was live
        const effectiveDuration = Math.min(liveDurationSeconds, (webinar.duration || 60) * 60);
        const thresholdSeconds = effectiveDuration * 0.7; // 70% of actual live time (Lowered for reliability)

        const hotLeads: { name: string; email: string; score: number; summary: string }[] = [];
        const convertedLeads: { name: string; email: string; score: number; summary: string }[] = [];

        // Step 3: Loop through attendees to score leads
        for (const attendance of breakoutAttendances) {
            const isBuyNow = webinar.ctaType === "BUY_NOW";
            const isBookACall = webinar.ctaType === "BOOK_A_CALL";
            const isConverter = attendance.attendedType === "CONVERTED";
            const isCartAbandoned = attendance.attendedType === "ADDED_TO_CART";
            const clickedBookCall = isBookACall && (attendance.attendedType === "BREAKOUT_ROOM" || attendance.attendedType === "FOLLOW_UP");
            const stayedUntilEnd = (attendance.watchTime || 0) >= thresholdSeconds;

            console.log(`Scoring ${attendance.user.name}: watchTime=${attendance.watchTime}, threshold=${thresholdSeconds}, status=${attendance.attendedType}`);

            const result = await step.run(`score-lead-${attendance.id}`, async () => {
                try {
                    let score = 2;
                    let summary = "Cold Lead: Left early and did not interact.";
                    let isHotLead = false;

                    // 1. Prioritize Conversion (Universal)
                    if (isConverter) {
                        score = 10;
                        summary = "Converted: Payment verified successfully.";
                    }
                    // 2. Scoring Logic for BUY_NOW
                    else if (isBuyNow) {
                        if (isCartAbandoned) {
                            score = 8;
                            summary = "Hot Lead (Cart Abandoned): Clicked 'Buy Now' but did not complete payment.";
                        } else if (stayedUntilEnd) {
                            score = 5;
                            summary = "Warm Lead: Stayed until the very end of the webinar.";
                        }
                    }
                    // 3. Scoring Logic for BOOK_A_CALL
                    else if (isBookACall) {
                        // Try AI Score first if they joined breakout (Status: BREAKOUT_ROOM or FOLLOW_UP)
                        let aiScoreResult = null;
                        const joinedBreakout = attendance.attendedType === "BREAKOUT_ROOM" || attendance.attendedType === "FOLLOW_UP";

                        if (joinedBreakout) {
                            try {
                                console.log(`Starting AI Scoring for ${attendance.user.name}...`);
                                if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                                    console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is not defined in environment.");
                                }

                                const mockTranscript = `The attendee ${attendance.user.name} joined the breakout room but the full transcript is unavailable. They showed interest in booking a call.`;
                                let vapiTranscript = null;

                                // Fetch from Vapi
                                if (process.env.VAPI_API_KEY && webinar.aiAgentId) {
                                    try {
                                        const response = await fetch(`https://api.vapi.ai/call?assistantId=${webinar.aiAgentId}&limit=50`, {
                                            headers: { "Authorization": `Bearer ${process.env.VAPI_API_KEY}` }
                                        });
                                        const data = await response.json();
                                        const calls = Array.isArray(data) ? data : (data.results || []);
                                        const myCall = calls.find((c: { assistantOverrides?: { metadata?: { webinarId?: string; attendeeId?: string } } }) =>
                                            c.assistantOverrides?.metadata?.webinarId === webinarId &&
                                            c.assistantOverrides?.metadata?.attendeeId === attendance.attendeeId
                                        );
                                        vapiTranscript = myCall?.transcript || null;
                                        if (vapiTranscript) console.log(`Found Vapi transcript for ${attendance.user.name}`);
                                    } catch (e) { console.error("Vapi fetch error", e); }
                                }

                                const finalTranscript = vapiTranscript || mockTranscript;

                                if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                                    const { object } = await generateObject({
                                        model: google("gemini-2.0-flash"),
                                        schema: z.object({
                                            summary: z.string(),
                                            score: z.number().min(1).max(10),
                                        }),
                                        prompt: `Analyze this sales call for ${attendance.user.name}. 
                                        Webinar Type: ${webinar.ctaType}
                                        Product: ${webinar.productTitle}
                                        Price: ${webinar.price}
                                        Transcript: ${finalTranscript}
                                        
                                        If the transcript is generic, focus on the fact that they spent time in a 1-on-1 breakout session.
                                        Provide a 1-2 sentence summary of their interest and a score from 1-10.`,
                                    });
                                    aiScoreResult = object;
                                    console.log(`Success: AI Score for ${attendance.user.name} = ${object.score}`);
                                }
                            } catch (e) {
                                console.error(`AI Scoring failed for ${attendance.user.name}:`, e);
                            }
                        }

                        if (aiScoreResult) {
                            score = aiScoreResult.score;
                            summary = aiScoreResult.summary;
                        } else if (clickedBookCall) {
                            score = 8;
                            summary = "High Intent: Clicked 'Book a Call' but did not complete the AI session.";
                        } else if (stayedUntilEnd) {
                            score = 5;
                            summary = "Warm Lead: Stayed until the very last minute.";
                        }
                    }
                    // 4. Default Fallback for anyone else who stayed long enough
                    else if (stayedUntilEnd) {
                        score = 5;
                        summary = "Warm Lead: Stayed until the end of the session.";
                    }

                    isHotLead = score >= 6;

                    await prismaClient.callDebrief.upsert({
                        where: { attendanceId: attendance.id },
                        update: { score, summary, isHotLead },
                        create: { attendanceId: attendance.id, score, summary, isHotLead }
                    });

                    return {
                        name: attendance.user.name,
                        email: attendance.user.email,
                        score,
                        summary,
                        isHotLead,
                        isConverted: isConverter
                    };
                } catch (error) {
                    console.error("Scoring failed for", attendance.id, error);
                    return null;
                }
            });

            if (result) {
                const leadData = {
                    name: result.name,
                    email: result.email,
                    score: result.score,
                    summary: result.summary,
                };

                if (result.isConverted) {
                    convertedLeads.push(leadData);
                } else if (result.isHotLead) {
                    hotLeads.push(leadData);
                }
            }
        }

        const pipelineValue = convertedLeads.length * webinarPrice;

        // Step 3.5: Generate an overall webinar summary from all individual attendee summaries
        await step.run("generate-webinar-summary", async () => {
            // Collect all non-null summaries from the debrief records for this webinar
            const debriefs = await prismaClient.callDebrief.findMany({
                where: {
                    attendance: { webinarId }
                },
                select: { summary: true, score: true }
            });

            if (debriefs.length === 0) return;

            const summaryList = debriefs
                .filter(d => d.summary)
                .map((d, i) => `Attendee ${i + 1} (Score ${d.score}/10): ${d.summary}`)
                .join("\n\n");

            const { object } = await generateObject({
                model: google("gemini-2.0-flash"),
                schema: z.object({ overallSummary: z.string() }),
                prompt: `You are a sales analytics assistant. Below are the individual AI-scored summaries from a webinar's breakout room sessions:

${summaryList}

Based on these responses, write a concise 2-3 sentence overall summary of how the audience responded to the webinar. Describe the general sentiment, conversion potential, and any notable patterns. Do not name specific individuals.`,
            });

            await prismaClient.webinar.update({
                where: { id: webinarId },
                data: { summary: object.overallSummary }
            });
        });

        // Step 4: Dispatch the summary email if we have hot leads
        if (presenterEmail) {
            await step.run("send-hot-leads-digest", async () => {
                try {
                    await resend.emails.send({
                        from: "Spotlight Notifications <onboarding@resend.dev>", // Default for Resend sandbox
                        to: [presenterEmail],
                        subject: `📊 Webinar Report: ${webinar.title}`,
                        react: HotLeadsDigest({
                            webinarTitle: webinar.title,
                            hotLeads,
                            convertedLeads,
                            totalAttendees: breakoutAttendances.length,
                            pipelineValue,
                            currency,
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
            hotLeadsCount: hotLeads.length,
            convertedCount: convertedLeads.length,
            revenue: pipelineValue
        };
    },
);
