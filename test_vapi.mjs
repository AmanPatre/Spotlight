import dotenv from 'dotenv';
dotenv.config();

const VAPI_API_KEY = process.env.VAPI_API_KEY || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

async function fetchAssistant() {
    const res = await fetch("https://api.vapi.ai/assistant/797aca99-aedf-4d19-8386-6f654698dd8f", {
        headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`
        }
    });
    const data = await res.json();
    const fs = await import('fs');
    fs.writeFileSync('agent_data.json', JSON.stringify(data, null, 2));
}

fetchAssistant();
