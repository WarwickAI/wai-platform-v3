import {
  Attribute,
  AttributeType,
  Element,
  Group,
  Prisma,
  PrismaClient,
  User,
} from "@prisma/client";

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

export type SideEffects = (
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  element: Element & { children: ElementWithAtts[] },
  user: User | undefined,
  operation: ElementOperations | AttributeOperations,
  data: any
) => Promise<void>;
