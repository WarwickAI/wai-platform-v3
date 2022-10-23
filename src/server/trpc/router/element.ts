import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { ElementType } from "@prisma/client";

export const elementRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.element.findMany({ include: { user: true } });
  }),
  create: protectedProcedure
    .input(z.object({ type: z.nativeEnum(ElementType), value: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.element.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.element.delete({ where: { id: input.id } });
    }),
});
