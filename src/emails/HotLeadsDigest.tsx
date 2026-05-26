import * as React from "react";
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Text,
    Heading,
    Hr,
} from "@react-email/components";

// To avoid TypeScript issues, use 'any' if the types from your generated Prisma client aren't exported exactly.
// In reality, this would match your HotLead schema.
interface HotLead {
    name: string;
    email: string;
    score: number;
    summary: string;
}

interface HotLeadsDigestProps {
    webinarTitle: string;
    hotLeads: HotLead[];
    convertedLeads: HotLead[];
    totalAttendees: number;
    pipelineValue: number;
    currency: string;
}

export const HotLeadsDigest: React.FC<Readonly<HotLeadsDigestProps>> = ({
    webinarTitle = "Your Recent Webinar",
    hotLeads = [],
    convertedLeads = [],
    totalAttendees = 0,
    pipelineValue = 0,
    currency = "INR",
}) => {
    return (
        <Html>
            <Head />
            <Preview>Spotlight: Webinar Report for {webinarTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Webinar Debrief Report 🚨</Heading>

                    {/* Metrics Section */}
                    <Section style={metricsGrid}>
                        <table width="100%" style={{ marginBottom: '20px' }}>
                            <tr>
                                <td style={metricCard}>
                                    <Text style={metricValue}>{totalAttendees}</Text>
                                    <Text style={metricLabel}>Attendees</Text>
                                </td>
                                <td style={metricCard}>
                                    <Text style={metricValue}>{hotLeads.length}</Text>
                                    <Text style={metricLabel}>Hot Leads</Text>
                                </td>
                                <td style={metricCard}>
                                    <Text style={metricValue}>{convertedLeads.length}</Text>
                                    <Text style={metricLabel}>Converted</Text>
                                </td>
                            </tr>
                        </table>
                        <Section style={pipelineValueCard}>
                            <Text style={pipelineLabel}>Total Pipeline Value</Text>
                            <Heading style={pipelineAmount}>
                                {currency} {pipelineValue.toLocaleString()}
                            </Heading>
                        </Section>
                    </Section>

                    <Hr style={hr} />

                    {/* Converted Section */}
                    {convertedLeads.length > 0 && (
                        <>
                            <Heading style={h2}>🎉 Converted Students</Heading>
                            <Section style={tableContainer}>
                                <table width="100%" cellPadding="10" cellSpacing="0" border={1} style={table}>
                                    <thead>
                                        <tr style={th}>
                                            <th style={{ width: '30%' }}>Name</th>
                                            <th>AI Debrief Summary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {convertedLeads.map((lead, idx) => (
                                            <tr key={idx} style={trConverted}>
                                                <td>
                                                    <strong>{lead.name}</strong>
                                                    <br />
                                                    <span style={emailText}>{lead.email}</span>
                                                </td>
                                                <td>{lead.summary}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Section>
                            <Hr style={hr} />
                        </>
                    )}

                    {/* Hot Leads Section */}
                    <Heading style={h2}>🔥 Hot Prospective Leads</Heading>
                    {hotLeads.length > 0 ? (
                        <Section style={tableContainer}>
                            <table width="100%" cellPadding="10" cellSpacing="0" border={1} style={table}>
                                <thead>
                                    <tr style={th}>
                                        <th style={{ width: '30%' }}>Name</th>
                                        <th>Score</th>
                                        <th>AI Debrief Summary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hotLeads.map((lead, idx) => (
                                        <tr key={idx} style={idx % 2 === 0 ? trEven : trOdd}>
                                            <td>
                                                <strong>{lead.name}</strong>
                                                <br />
                                                <span style={emailText}>{lead.email}</span>
                                            </td>
                                            <td style={scoreBadgeCell}>
                                                <span style={scoreBadge}>{lead.score}/10</span>
                                            </td>
                                            <td>{lead.summary}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Section>
                    ) : (
                        <Text style={text}>No high-scoring prospective leads were found in this session.</Text>
                    )}

                    <Hr style={hr} />
                    <Text style={footer}>
                        Log into your Spotlight Dashboard to see the full priority pipeline and attendee details.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default HotLeadsDigest;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
};

const h1 = {
    color: "#18181b",
    fontSize: "24px",
    fontWeight: "bold",
    padding: "0 48px",
    margin: "40px 0 20px",
};

const h2 = {
    color: "#18181b",
    fontSize: "18px",
    fontWeight: "bold",
    padding: "0 48px",
    margin: "24px 0 12px",
};

const metricsGrid = {
    padding: "0 48px",
    marginBottom: "20px",
};

const metricCard = {
    textAlign: "center" as const,
    padding: "10px",
    backgroundColor: "#f4f4f5",
    borderRadius: "8px",
    width: "33%",
};

const metricValue = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#18181b",
    margin: "0",
};

const metricLabel = {
    fontSize: "12px",
    color: "#71717a",
    margin: "0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
};

const pipelineValueCard = {
    backgroundColor: "#18181b",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center" as const,
    marginTop: "20px",
};

const pipelineLabel = {
    color: "#71717a",
    fontSize: "14px",
    margin: "0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
};

const pipelineAmount = {
    color: "#10b981", // Emerald-500
    fontSize: "32px",
    margin: "8px 0 0",
    fontWeight: "bold",
};

const text = {
    color: "#3f3f46",
    fontSize: "16px",
    lineHeight: "26px",
    padding: "0 48px",
};

const emailText = {
    fontSize: "12px",
    color: "#71717a",
};

const hr = {
    borderColor: "#e4e4e7",
    margin: "20px 0",
};

const tableContainer = {
    padding: "0 48px",
};

const table = {
    borderCollapse: "collapse" as const,
    borderColor: "#e4e4e7",
    width: "100%",
};

const th = {
    backgroundColor: "#f4f4f5",
    textAlign: "left" as const,
    fontSize: "12px",
    color: "#71717a",
    textTransform: "uppercase" as const,
    padding: "12px",
};

const trEven = {
    backgroundColor: "#ffffff",
    fontSize: "14px",
};

const trOdd = {
    backgroundColor: "#fafafa",
    fontSize: "14px",
};

const trConverted = {
    backgroundColor: "#f0fdf4", // emerald-50
    fontSize: "14px",
};

const scoreBadgeCell = {
    textAlign: "center" as const,
    padding: "12px",
};

const scoreBadge = {
    backgroundColor: "#18181b",
    color: "white",
    padding: "4px 10px",
    borderRadius: "99px",
    fontWeight: "bold",
    fontSize: "11px",
    fontFamily: "monospace",
};

const footer = {
    color: "#a1a1aa",
    fontSize: "12px",
    padding: "0 48px",
    textAlign: "center" as const,
};
