import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('e:/MERN PROJECTS/spotlight/webinaar-platform/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("API Key not found!");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    console.log("Fetching available models for your API key...");
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log("\n✅ Models Available:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.error("\n❌ Error:");
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
