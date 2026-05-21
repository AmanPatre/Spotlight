import { prismaClient } from "./src/lib/prismaClient.js";
import fs from "fs";
import path from "path";

// Manually load .env since we are running as a standalone script
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/DATABASE_URL="?([^"\n\r]+)"?/);
    if (match) {
        process.env.DATABASE_URL = match[1];
        console.log("Loaded DATABASE_URL from .env");
    }
}

async function checkWebinar() {
    try {
        const allWebinars = await prismaClient.webinar.findMany({
            include: {
                presenter: {
                    select: { name: true, email: true }
                }
            }
        });
        console.log("Found", allWebinars.length, "webinars:");
        allWebinars.forEach(w => {
            console.log(`- [${w.id}] ${w.title} (Presenter: ${w.presenter.name})`);
        });
    } catch (error) {
        console.error("Error checking webinars:", error);
    } finally {
        process.exit();
    }
}

checkWebinar();
