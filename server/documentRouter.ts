import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { documents } from "../drizzle/schema";
import { GameSetting, GAME_SETTINGS } from "../shared/const";
import { eq } from "drizzle-orm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./_core/env";

// Initialize S3 Client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const documentRouter = router({
  // 1. Get a pre-signed URL for uploading a file directly to S3
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileType: z.string().min(1),
        fileSize: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const fileKey = \`user-documents/\${ctx.user.id}/\${Date.now()}-\${input.fileName}\`;
      const bucketName = env.AWS_S3_BUCKET_NAME;

      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: input.fileType,
        ContentLength: input.fileSize,
      });

      const uploadUrl = await getSignedUrl(s3Client, putCommand, {
        expiresIn: 60 * 5, // URL expires in 5 minutes
      });

      // Insert a placeholder record into the database
      const [newDocument] = await db
        .insert(documents)
        .values({
          userId: ctx.user.id,
          name: input.fileName,
          fileKey: fileKey,
          fileUrl: \`https://\${bucketName}.s3.\${env.AWS_REGION}.amazonaws.com/\${fileKey}\`,
          mimeType: input.fileType,
          fileSize: input.fileSize,
        })
        .returning();

      return {
        uploadUrl,
        documentId: newDocument.id,
        fileKey: fileKey,
      };
    }),

  // 2. List all documents for the current user
  list: protectedProcedure
    .input(z.object({ setting: z.nativeEnum(GAME_SETTINGS).default(GAME_SETTINGS.CONFLICT_HORIZON) }))
    .query(async ({ ctx, input }) => {
      return db
        .select()
        .from(documents)
        .where(and(eq(documents.userId, ctx.user.id), eq(documents.setting, input.setting)));
    }),

  // 3. Delete a document (and eventually the file from S3)
  delete: protectedProcedure
    .input(z.object({ documentId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement S3 file deletion here
      await db
        .delete(documents)
        .where(eq(documents.id, input.documentId))
        .execute();

      return { success: true };
    }),
});
