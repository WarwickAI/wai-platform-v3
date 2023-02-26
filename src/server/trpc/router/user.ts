import {
  router,
  execProcedure,
  publicProcedure,
  authedProcedure,
} from "../trpc";
import { z } from "zod";

export const userRouter = router({
  get: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: input },
      include: { groups: true },
    });
  }),

  getAll: authedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getMe: authedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      include: { groups: true },
    });
  }),
});
