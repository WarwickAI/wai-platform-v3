import { router, execProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  get: execProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: input },
      include: { groups: true },
    });
  }),

  getAll: execProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getMe: execProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      include: { groups: true },
    });
  }),
});
