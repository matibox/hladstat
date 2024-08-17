import {
  createUploadthing,
  type FileRouter as TFileRouter,
} from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "./auth";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({ image: { maxFileSize: "2MB" } })
    .middleware(async () => {
      const session = await getServerAuthSession();
      if (!session) throw new UploadThingError("Unauthorized");
      return { session };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.session.user.id);
      console.log("file url", file.url);
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.session.user.id };
    }),
} satisfies TFileRouter;

export type FileRouter = typeof fileRouter;
