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
    totalAttendees: number;
}

export const HotLeadsDigest: React.FC<Readonly<HotLeadsDigestProps>> = ({
    webinarTitle = "Your Recent Webinar",
    hotLeads = [],
    totalAttendees = 0,
}) => {
    return (
        <Html>
            <Head />
            <Preview>Spotlight: Hot Leads Alert for {webinarTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Webinar Debrief Report 🚨</Heading>
                    <Text style={text}>
                        Your webinar <strong>{webinarTitle}</strong> has concluded. Out of{" "}
                        {totalAttendees} attendees, our AI agents have identified{" "}
                        <strong>{hotLeads.length} HOT LEADS</strong> (Score 8+).
                    </Text>

                    <Hr style={hr} />

                    {hotLeads.length > 0 ? (
                        <Section style={tableContainer}>
                            <table width="100%" cellPadding="10" cellSpacing="0" border={1} style={table}>
                                <thead>
                                    <tr style={th}>
                                        <th>Name</th>
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
                        <Text style={text}>No high-scoring leads were found in this session.</Text>
                    )}

                    <Hr style={hr} />
                    <Text style={footer}>
                        Log into your Spotlight Dashboard to see the full priority pipeline and low-tier leads.
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
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    padding: "0 48px",
    margin: "40px 0",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "26px",
    padding: "0 48px",
};

const emailText = {
    fontSize: "12px",
    color: "#666",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const tableContainer = {
    padding: "0 24px",
};

const table = {
    borderCollapse: "collapse" as const,
    borderColor: "#ddd",
    width: "100%",
};

const th = {
    backgroundColor: "#f4f4f5",
    textAlign: "left" as const,
    fontSize: "14px",
};

const trEven = {
    backgroundColor: "#ffffff",
    fontSize: "14px",
};

const trOdd = {
    backgroundColor: "#fafafa",
    fontSize: "14px",
};

const scoreBadgeCell = {
    textAlign: "center" as const,
};

const scoreBadge = {
    backgroundColor: "#ef4444",
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "12px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    padding: "0 48px",
};
