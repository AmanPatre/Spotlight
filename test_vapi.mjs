import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const vapiKeyMatch = envContent.match(/VAPI_API_KEY=(.+)/);
const vapiKey = vapiKeyMatch ? vapiKeyMatch[1].trim() : null;

if (!vapiKey) {
    console.error("No VAPI_API_KEY found in .env");
    process.exit(1);
}

async function testFetch() {
    try {
        const response = await fetch('https://api.vapi.ai/call?limit=2', {
            headers: {
                "Authorization": `Bearer ${vapiKey}`
            }
        });
        const calls = await response.json();

        fs.writeFileSync('vapi_calls.json', JSON.stringify(calls, null, 2));
        console.log("Wrote calls to vapi_calls.json");
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

testFetch();
