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

export type RequiredAttribute = {
  name: string;
  type: AttributeType;
  value: string | string[];
};

export type ElementProps = {
  element: ElementWithAttsGroupsChildren;
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
}>;

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
