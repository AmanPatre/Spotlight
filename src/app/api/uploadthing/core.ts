import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
    videoUploader: f({
        video: { maxFileSize: "1GB", maxFileCount: 1 },
    })
        .middleware(async () => {
            const user = await auth();
            if (!user.userId) throw new UploadThingError("Unauthorized");
            return { userId: user.userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
