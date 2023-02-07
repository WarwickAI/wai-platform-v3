// import aws from "aws-sdk";
import { z } from "zod";
import { IMAGE_MIME_TYPES } from "../../../components/attributes/File";
import { env } from "../../../env/server.mjs";
import { publicProcedure, router, authedProcedure } from "../trpc";

// const SPACES_ENDPOINT = new aws.Endpoint(
//   `${env.DO_SPACES_REGION}.digitaloceanspaces.com`
// );

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

// const S3 = new aws.S3({
//   endpoint: SPACES_ENDPOINT,
//   accessKeyId: env.DO_SPACES_ACCESS_KEY_ID,
//   secretAccessKey: env.DO_SPACES_SECRET_KEY,
//   region: env.DO_SPACES_REGION,
// });

export const fileRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.file.findFirstOrThrow({
        where: {
          id: input.id,
        },
        include: {
          user: true,
        },
      });

      return file;
    }),
  upload: authedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        encoding: z.string(),
        hash: z.string(),
        size: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileName, mimeType, encoding, hash, size } = input;

      if (size > MAX_FILE_SIZE) {
        throw new Error("File is too large");
      }

      // Check if a file already exists with the same hash and mimeType
      const existingFile = await ctx.prisma.file.findFirst({
        where: {
          hash,
          mimeType,
        },
      });

      if (existingFile) {
        // Return just the file's uuid
        return {
          file: existingFile,
          signedUrl: null,
        };
      }

      // Create the file
      const file = await ctx.prisma.file.create({
        data: {
          fileName,
          mimeType,
          encoding,
          hash,
          size,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          ...(IMAGE_MIME_TYPES.includes(mimeType)
            ? {
                width: input.width,
                height: input.height,
              }
            : {}),
        },
      });

      const params = {
        Bucket: env.DO_SPACES_BUCKET,
        Key: file.uuid,
        ContentType: mimeType,
        ACL: "public-read",
      };

      // const signedUrl = S3.getSignedUrl("putObject", params);
      const signedUrl = null;

      return {
        file,
        signedUrl,
      };
    }),
});
