import { router, authedProcedure } from "../trpc";
import { z } from "zod";
import { DBColumnType } from "../../../components/attributes/utils";
import { AttributeType } from "@prisma/client";
import { SurveyQuestion } from "../../../components/attributes/SurveyQuestion";
import elements from "../../../components/elements";
import { AttributeEditInputSchema } from "./schemas";

export const attributeRouter = router({
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.nativeEnum(AttributeType),
        value: z.string().or(z.any().array()),
        required: z.boolean(),
        elementId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the element
      const element = await ctx.prisma.element.findUniqueOrThrow({
        where: { id: input.elementId },
        include: {
          editGroups: true,
        },
      });

      // Get the user (with groups)
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        include: {
          groups: true,
        },
      });

      // Check if the user is allowed to edit the element
      if (
        !user.groups.some((group) =>
          element.editGroups.map((g) => g.id).includes(group.id)
        )
      ) {
        throw new Error("You are not allowed to edit this element");
      }

      // Create the attribute
      return ctx.prisma.attribute.create({
        data: {
          name: input.name,
          type: input.type,
          value: input.value,
          required: input.required,
          element: {
            connect: { id: input.elementId },
          },
        },
      });
    }),
  editValue: authedProcedure
    .input(AttributeEditInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, value } = input;

      const attribute = await ctx.prisma.attribute.findUniqueOrThrow({
        where: { id },
        include: {
          element: {
            include: {
              children: {
                include: {
                  atts: true,
                  user: true,
                },
              },
            },
          },
        },
      });

      const user =
        ctx.session?.user &&
        (await ctx.prisma.user.findUniqueOrThrow({
          where: { id: ctx.session.user.id },
          include: {
            groups: true,
          },
        }));

      const preAttributeEditFn =
        elements[attribute.element.type]?.preAttributeEditFn;

      preAttributeEditFn &&
        (await preAttributeEditFn(
          ctx.prisma,
          attribute.element,
          attribute,
          input,
          user
        ));

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
