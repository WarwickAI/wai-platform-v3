import { router, authedProcedure } from "../trpc";
import { z } from "zod";
import { DBColumnType } from "../../../components/attributes/utils";

export const attributeRouter = router({
  editValue: authedProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.string().or(z.any().array()),
      })
    )
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
                }
              }
            }
          }
        }
      })

      // If we are updating the columns of a database, make sure to update the children of the
      // element to contain all the columns as attributes
      if (attribute.type === "Columns") {
        const columns = value as DBColumnType[];

        // Get all the children of the element
        const children = attribute.element.children;

        // Loop through all attributes of the children, and remove any that are not in the columns
        // and add any that are not in the children, and check that the types match
        for (const child of children) {
          // Get all the attributes of the child
          const atts = child.atts;

          // Loop through all the attributes of the child
          for (const att of atts) {
            // If the attribute is not in the columns, delete it
            if (!columns.find((c) => c.name === att.name)) {
              await ctx.prisma.attribute.delete({
                where: { id: att.id },
              });
            }
          }

          // Loop through all the columns
          for (const column of columns) {
            // If the column is not in the attributes, add it
            if (!atts.find((a) => a.name === column.name)) {
              await ctx.prisma.attribute.create({
                data: {
                  name: column.name,
                  type: column.type,
                  value: column.value,
                  required: column.required,
                  element: {
                    connect: {
                      id: child.id,
                    },
                  },
                },
              });
            }
          }

          // Loop through all the attributes of the child
          for (const att of atts) {
            // If the attribute type does not match the column type, update it
            const column = columns.find((c) => c.name === att.name);
            if (column && column.type !== att.type) {
              await ctx.prisma.attribute.update({
                where: { id: att.id },
                data: {
                  type: column.type,
                },
              });
            }
          }
        }
      }

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
