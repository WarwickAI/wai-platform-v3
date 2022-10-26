import { router, publicProcedure, authedProcedure } from "../trpc";
import { z } from "zod";
import { AttributeType, ElementType } from "@prisma/client";

export const elementRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.element.findMany({ include: { user: true, atts: true } });
  }),
  getPage: publicProcedure
    .input(z.object({ route: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.element.findFirstOrThrow({
        where: { id: input.route, type: "Page" },
        include: {
          user: true,
          atts: true,
          children: {
            include: {
              user: true,
              atts: true,
              masterGroups: true,
              editGroups: true,
              interactGroups: true,
              viewGroups: true,
            },
          },
          masterGroups: true,
          editGroups: true,
          interactGroups: true,
          viewGroups: true,
        },
      });
    }),
  create: authedProcedure
    .input(
      z.object({
        type: z.nativeEnum(ElementType),
        index: z.number(),
        parentId: z.string().nullish(),
        atts: z
          .object({
            name: z.string(),
            type: z.nativeEnum(AttributeType),
            value: z.object({}).or(z.string()),
            required: z.boolean(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.element.create({
        data: {
          ...input,
          atts: { create: input.atts },
          userId: ctx.session.user.id,
        },
      });
    }),
  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.element.delete({ where: { id: input.id } });
    }),

  order: authedProcedure
    .input(
      z
        .object({
          id: z.string(),
          index: z.number(),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      for (const { id, index } of input) {
        await ctx.prisma.element.update({
          where: { id },
          data: { index },
        });
      }
    }),

  addPerms: authedProcedure
    .input(
      z.object({
        id: z.string(),
        masterGroups: z.string().array().nullish(),
        editGroups: z.string().array().nullish(),
        interactGroups: z.string().array().nullish(),
        viewGroups: z.string().array().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.element.update({
        where: { id: input.id },
        data: {
          masterGroups: { connect: input.masterGroups?.map((id) => ({ id })) },
          editGroups: { connect: input.editGroups?.map((id) => ({ id })) },
          interactGroups: {
            connect: input.interactGroups?.map((id) => ({ id })),
          },
          viewGroups: { connect: input.viewGroups?.map((id) => ({ id })) },
        },
      });
    }),

  removePerms: authedProcedure
    .input(
      z.object({
        id: z.string(),
        masterGroups: z.string().array().nullish(),
        editGroups: z.string().array().nullish(),
        interactGroups: z.string().array().nullish(),
        viewGroups: z.string().array().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.element.update({
        where: { id: input.id },
        data: {
          masterGroups: {
            disconnect: input.masterGroups?.map((id) => ({ id })),
          },
          editGroups: { disconnect: input.editGroups?.map((id) => ({ id })) },
          interactGroups: {
            disconnect: input.interactGroups?.map((id) => ({ id })),
          },
          viewGroups: { disconnect: input.viewGroups?.map((id) => ({ id })) },
        },
      });
    }),
});
