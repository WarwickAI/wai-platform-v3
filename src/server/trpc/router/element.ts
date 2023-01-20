import { router, publicProcedure, authedProcedure } from "../trpc";
import { z } from "zod";
import { AttributeType, ElementType } from "@prisma/client";

export const elementRouter = router({
  get: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.element.findUniqueOrThrow({
      where: {
        id: input,
      },
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
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.element.findMany({
      include: {
        user: true,
        atts: true,
        masterGroups: true,
        editGroups: true,
        interactGroups: true,
        viewGroups: true,
      },
    });
  }),
  queryAll: publicProcedure
    .input(z.object({ type: z.nativeEnum(ElementType) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.element.findMany({
        where: {
          type: input.type,
        },
        include: {
          atts: true,
        },
      });
    }),
  getPage: publicProcedure
    .input(z.object({ route: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.element.findFirstOrThrow({
        where: { route: input.route, type: "Page" },
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
            value: z
              .string()
              .or(z.number())
              .or(z.boolean())
              .or(z.any().array()),
            required: z.boolean(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const parent = input.parentId
        ? await ctx.prisma.element.findFirst({
            where: { id: input.parentId },
            include: {
              masterGroups: true,
              editGroups: true,
              interactGroups: true,
              viewGroups: true,
            },
          })
        : null;

      const adminGroup = await ctx.prisma.group.findFirstOrThrow({
        where: { name: "Admin" },
      });

      const masterGroups = parent?.masterGroups ?? [adminGroup];
      const editGroups = parent?.editGroups ?? [adminGroup];
      const interactGroups = parent?.interactGroups ?? [adminGroup];
      const viewGroups = parent?.viewGroups ?? [adminGroup];

      return ctx.prisma.element.create({
        data: {
          ...input,
          atts: { create: input.atts },
          userId: ctx.session.user.id,
          masterGroups: { connect: masterGroups.map((g) => ({ id: g.id })) },
          editGroups: { connect: editGroups.map((g) => ({ id: g.id })) },
          interactGroups: {
            connect: interactGroups.map((g) => ({ id: g.id })),
          },
          viewGroups: { connect: viewGroups.map((g) => ({ id: g.id })) },
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
  hasAttended: authedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // First get the event element (make sure it exists)
      const event = await ctx.prisma.element.findFirstOrThrow({
        where: { id: input, type: "Event" },
        include: {
          atts: true,
        },
      });

      // Get the event's attendees attribute
      const attendees = event.atts.find((a) => a.name === "Attendees");

      // If the event doesn't have an attendees attribute, throw an error
      if (!attendees) {
        throw new Error("Event does not have an attendees attribute");
      }

      // Check if the current user is in the attendees attribute
      return (attendees.value as string[]).includes(ctx.session.user.id);
    }),
  claimAttendance: authedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // First get the event element (make sure it exists)
      const event = await ctx.prisma.element.findFirstOrThrow({
        where: { id: input, type: "Event" },
        include: {
          atts: true,
        },
      });

      // Get the event's attendees attribute
      const attendees = event.atts.find((a) => a.name === "Attendees");

      // If the event doesn't have an attendees attribute, throw an error
      if (!attendees) {
        throw new Error("Event does not have an attendees attribute");
      }

      // Update the attendees attribute to include the current user
      const updated = await ctx.prisma.attribute.update({
        where: { id: attendees.id },
        data: {
          value: [...(attendees.value as string[]), ctx.session.user.id],
        },
      });

      // Return true if the user was added to the attendance list
      return (updated.value as string[]).includes(ctx.session.user.id);
    }),
});
