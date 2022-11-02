import { router, authedProcedure } from "../trpc";
import { z } from "zod";

export const attributeRouter = router({
  editValue: authedProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.string().or(z.string().array()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.attribute.update({
        where: { id: input.id },
        data: { value: input.value },
        include: {
          element: {
            include: {
              parent: true,
            },
          },
        },
      });
    }),
});
