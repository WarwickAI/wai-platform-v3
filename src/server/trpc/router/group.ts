import {
  router,
  publicProcedure,
  authedProcedure,
  execProcedure,
} from "../trpc";
import { z } from "zod";

export const groupRouter = router({
  get: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.group.findUniqueOrThrow({
      where: { id: input },
      include: { users: true },
    });
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findMany();
  }),

  create: authedProcedure
    .input(
      z.object({ name: z.string().min(3), description: z.string().nullish() })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.group.create({
        data: { ...input },
      });
    }),

  edit: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3),
        description: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.group.update({
        where: { id: input.id },
        data: { name: input.name, description: input.description },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.group.delete({ where: { id: input.id } });
    }),

  addUser: execProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.group.update({
        where: { id: input.groupId },
        data: {
          users: {
            connect: { id: input.userId },
          },
        },
      });
    }),

  removeUser: execProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.group.update({
        where: { id: input.groupId },
        data: {
          users: {
            disconnect: { id: input.userId },
          },
        },
      });
    }),
});
