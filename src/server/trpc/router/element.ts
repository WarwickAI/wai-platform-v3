import { router, publicProcedure, authedProcedure } from "../trpc";
import { z } from "zod";
import { AttributeType, ElementType, Group } from "@prisma/client";
import {
  ElementOperations,
  ElementWithAttsGroups,
  ElementWithGroups,
} from "../../../components/elements/utils";
import { ElementCreateInputSchema } from "./schemas";

const groupsInclude = {
  masterGroups: true,
  editGroups: true,
  interactGroups: true,
  viewGroups: true,
};

export const elementRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const element = await ctx.prisma.element.findUniqueOrThrow({
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
            ...groupsInclude,
          },
        },
        ...groupsInclude,
      },
    });

    if (!(await defaultPermsCheck(ctx, element, "ElementView"))) {
      throw new Error("No permission to view element");
    }

    // Filter only elements user has permission to view
    element.children = await asyncFilter(
      element.children,
      (e: ElementWithGroups) => {
        return defaultPermsCheck(ctx, e, "ElementView");
      }
    );

    return element;
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const elements = await ctx.prisma.element.findMany({
      include: {
        user: true,
        atts: true,
        ...groupsInclude,
      },
    });

    // Filter only elements user has permission to view
    const filtered = await asyncFilter(elements, (e: ElementWithAttsGroups) => {
      return defaultPermsCheck(ctx, e, "ElementView");
    });

    return filtered;
  }),
  queryAll: publicProcedure
    .input(z.object({ type: z.nativeEnum(ElementType) }))
    .query(async ({ ctx, input }) => {
      const elements = await ctx.prisma.element.findMany({
        where: {
          type: input.type,
        },
        include: {
          atts: true,
          ...groupsInclude,
        },
      });

      // Filter only elements user has permission to view
      const filtered = await asyncFilter(
        elements,
        (e: ElementWithAttsGroups) => {
          return defaultPermsCheck(ctx, e, "ElementView");
        }
      );

      return filtered;
    }),
  getPage: publicProcedure
    .input(z.object({ route: z.string() }))
    .query(async ({ ctx, input }) => {
      const page = await ctx.prisma.element.findFirstOrThrow({
        where: { route: input.route, type: "Page" },
        include: {
          user: true,
          atts: true,
          children: {
            include: {
              user: true,
              atts: true,
              ...groupsInclude,
            },
          },
          ...groupsInclude,
        },
      });

      if (!(await defaultPermsCheck(ctx, page, "ElementView"))) {
        throw new Error("No permission to view page");
      }

      // Filter out children user doesn't have permission to view
      page.children = await asyncFilter(
        page.children,
        (e: ElementWithAttsGroups) => {
          return defaultPermsCheck(ctx, e, "ElementView");
        }
      );

      console.log("Num children after: ", page.children.length);

      return page;
    }),
  create: authedProcedure
    .input(ElementCreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const parent = input.parentId
        ? await ctx.prisma.element.findFirst({
            where: { id: input.parentId },
            include: {
              ...groupsInclude,
              user: true,
            },
          })
        : null;

      // Check if user can create element in parent (i.e. has edit access)
      // By default, no parent means the user cannot create the element (unless Admin)
      if (!(await defaultPermsCheck(ctx, parent, "ElementEdit"))) {
        throw new Error("No permission to create element in parent");
      }

      const masterGroups = parent?.masterGroups ?? [];
      const editGroups = parent?.editGroups ?? [];
      const interactGroups = parent?.interactGroups ?? [];
      const viewGroups = parent?.viewGroups ?? [];

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
      const element = await ctx.prisma.element.findFirst({
        where: { id: input.id },
        include: {
          ...groupsInclude,
          user: true,
        },
      });

      // Check if user can delete element (i.e. has edit access)
      if (!(await defaultPermsCheck(ctx, element, "ElementDelete"))) {
        throw new Error("No permission to delete element");
      }

      return ctx.prisma.element.delete({
        where: { id: input.id },
      });
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
        const parent = await ctx.prisma.element.findFirst({
          where: { children: { some: { id } } },
          include: {
            ...groupsInclude,
            user: true,
          },
        });

        // Check if the user can edit the parent element
        if (!(await defaultPermsCheck(ctx, parent, "ElementEdit"))) {
          throw new Error("No permission to edit parent element");
        }

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
      const element = await ctx.prisma.element.findFirstOrThrow({
        where: { id: input.id },
        include: {
          ...groupsInclude,
          user: true,
        },
      });

      // Check if user can edit the perms (i.e. has master access)
      if (!(await defaultPermsCheck(ctx, element, "ElementEditPerms"))) {
        throw new Error("No permission to edit element perms");
      }

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

const defaultPermsCheck = async (
  ctx: any,
  element: ElementWithGroups | undefined | null,
  op: ElementOperations
) => {
  // Get user with groups
  const user =
    ctx.session?.user &&
    (await ctx.prisma.user.findFirstOrThrow({
      where: { id: ctx.session.user.id },
      include: { groups: true },
    }));

  const usersGroups = user?.groups || [];

  // Get 'All' and 'Admin' group
  const allGroup = await ctx.prisma.group.findFirst({
    where: { name: "All" },
  });
  const adminGroup = await ctx.prisma.group.findFirst({
    where: { name: "Admin" },
  });

  // If user has admin group, return true
  if (usersGroups.some((g: Group) => g.id === adminGroup?.id)) {
    return true;
  }

  // If element is undefined, return false
  if (!element) {
    return false;
  }

  usersGroups.push(allGroup);

  switch (op) {
    case "ElementView":
      return checkGroups(usersGroups, element.viewGroups);

    case "ElementEdit":
      return checkGroups(usersGroups, element.editGroups);

    case "ElementDelete":
      return checkGroups(usersGroups, element.editGroups);

    case "ElementInteract":
      return checkGroups(usersGroups, element.interactGroups);

    case "ElementEditPerms":
      return checkGroups(usersGroups, element.masterGroups);
  }

  return false;
};

// Simply check if one of the groups in the user's groups is in the element's groups
// using the IDs
const checkGroups = (usersGroups: Group[], elementsGroups: Group[]) => {
  return usersGroups.some((g) =>
    elementsGroups.map((eg) => eg.id).includes(g.id)
  );
};

const asyncFilter = async (
  arr: any[],
  predicate: (e: any) => Promise<boolean>
) =>
  arr.reduce(
    async (memo, e) => ((await predicate(e)) ? [...(await memo), e] : memo),
    []
  );
