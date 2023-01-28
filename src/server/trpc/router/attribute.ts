import { router, authedProcedure } from "../trpc";
import { z } from "zod";
import { DBColumnType } from "../../../components/attributes/utils";
import { AttributeType } from "@prisma/client";
import { SurveyQuestion } from "../../../components/attributes/SurveyQuestion";

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
                },
              },
            },
          },
        },
      });

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
                  value: column.value || "",
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

      // If we are updating the questions in a survey, make sure that the children
      // (i.e. the survey responses) have all the questions as attributes
      if (attribute.type === "SurveyQuestions") {
        const questions = value as SurveyQuestion[];

        // Get all the children of the element
        const children = attribute.element.children;

        // Loop through all attributes of the children, and remove any that are not in the questions
        // and add any that are not in the children, and check that the types match
        for (const child of children) {
          // Get all the attributes of the child
          const atts = child.atts;

          // Loop through all the attributes of the child
          for (const att of atts) {
            // If the attribute is not in the questions, delete it
            if (!questions.find((q) => q.id === att.name)) {
              await ctx.prisma.attribute.delete({
                where: { id: att.id },
              });
            }
          }

          // Loop through all the questions
          for (const question of questions) {
            // If the question is not in the attributes, add it
            if (!atts.find((a) => a.name === question.id)) {
              await ctx.prisma.attribute.create({
                data: {
                  name: question.id,
                  type: question.type,
                  value: "",
                  required: false,
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
            // If the attribute type does not match the question type, update it
            const question = questions.find((q) => q.id === att.name);
            if (question && question.type !== att.type) {
              await ctx.prisma.attribute.update({
                where: { id: att.id },
                data: {
                  type: question.type,
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
