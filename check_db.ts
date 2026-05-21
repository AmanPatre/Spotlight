import { PrismaClient } from './src/generated/prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
    const id = 'd904836a-f61b-416d-a75d-e257c589a46f';
    console.log('Querying for webinar ID:', id);
    const webinar = await prisma.webinar.findUnique({
        where: { id: id },
    });
    console.log('Result:', webinar);

    const allWebinars = await prisma.webinar.findMany({
        select: { id: true, title: true }
    });
    console.log('All webinars in DB:', allWebinars);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    });
