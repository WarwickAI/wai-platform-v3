import { router, authedProcedure } from "../trpc";
import { z } from "zod";
import { AttributeType } from "@prisma/client";
import elements from "../../../components/elements";
import { AttributeEditInputSchema } from "./schemas";
import { defaultPermsCheck, groupsInclude } from "./element";

export const attributeRouter = router({
  // PERMS: edit permissions on element
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
          ...groupsInclude,
        },
      });

      if (!defaultPermsCheck(ctx, element, "ElementEdit")) {
        throw new Error("You do not have permission to edit this element");
      }

      // Create the attribute
      return ctx.prisma.attribute.create({
        data: {
          name: input.name,
          type: input.type,
          value: input.value,
          element: {
            connect: { id: input.elementId },
          },
        },
      });
    }),
  // PERMS: edit permissions on element
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
              ...groupsInclude,
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

      if (!defaultPermsCheck(ctx, attribute.element, "ElementEdit")) {
        throw new Error("You do not have permission to edit this element");
      }

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
        where: { id: id },
        data: { value: value },
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
