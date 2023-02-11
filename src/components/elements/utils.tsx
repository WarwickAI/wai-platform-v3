import {
  Attribute,
  AttributeType,
  Element,
  Group,
  Prisma,
  PrismaClient,
  User,
} from "@prisma/client";
import {
  AttributeEditInputType,
  ElementCreateInputType,
} from "../../server/trpc/router/schemas";

export type ElementWithGroups = Element & {
  masterGroups: Group[];
  editGroups: Group[];
  interactGroups: Group[];
  viewGroups: Group[];
};

export type ElementWithAtts = Element & {
  atts: Attribute[];
  user: User;
};

export type ElementWithAttsGroups = ElementWithAtts & {
  masterGroups: Group[];
  editGroups: Group[];
  interactGroups: Group[];
  viewGroups: Group[];
};

export type ElementWithAttsGroupsChildren = ElementWithAttsGroups & {
  user: User;
  atts: Attribute[];
  children: ElementWithAttsGroups[];
};

export type ElementAttributeDescription = {
  name: string;
  type: AttributeType;
  optional?: boolean;
};

export type ElementProps = {
  element: ElementWithAttsGroupsChildren;
  parent?: ElementWithAttsGroupsChildren;
  edit: boolean;
  page?: boolean;
};

export const ElementOperations = [
  "ElementView",
  "ElementEdit",
  "ElementDelete",
  "ElementInteract",
  "ElementEditPerms",
] as const;
export type ElementOperations = typeof ElementOperations[number];

export const AttributeOperations = ["AttributeEdit"] as const;
export type AttributeOperations = typeof AttributeOperations[number];

type SmpPrismaClient = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>;

// Run when checking permissions, return true if the user has permission, false if not, and undefined to use the default permission check#
export type ElementCreateCheckPermsFn = (
  prisma: SmpPrismaClient,
  user: (User & { groups: Group[] }) | undefined,
  input: ElementCreateInputType,
  parent?: ElementWithGroups
) => Promise<boolean | void>;

export type ElementDeleteCheckPermsFn = (
  prisma: SmpPrismaClient,
  user: (User & { groups: Group[] }) | undefined,
  element: ElementWithGroups,
  parent?: ElementWithGroups
) => Promise<boolean | void>;

// Run before an element is created
export type PreElementCreationFn = (
  prisma: SmpPrismaClient,
  input: ElementCreateInputType,
  user: User | undefined,
  perms: {
    master: Group[];
    edit: Group[];
    interact: Group[];
    view: Group[];
  }
) => Promise<{
  input: ElementCreateInputType;
  perms: {
    master: Group[];
    edit: Group[];
    interact: Group[];
    view: Group[];
  };
} | void>;

// Run after an element is created
export type PostElementCreationFn = (
  prisma: SmpPrismaClient,
  element: Element,
  user: User | undefined
) => Promise<void>;

// Run before an attribute is edited
export type PreAttributeEditFn = (
  prisma: SmpPrismaClient,
  element: Element & { children: ElementWithAtts[] },
  attribute: Attribute,
  input: AttributeEditInputType,
  user: User | undefined
) => Promise<void>;
