const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const debriefs = await prisma.callDebrief.findMany({
        include: {
            attendance: {
                include: {
                    user: true,
                    webinar: true
                }
            }
        }
    });

    console.log("=== DEBRIEFS ===");
    console.dir(debriefs, { depth: null });
}

check().catch(console.error).finally(() => prisma.$disconnect());
