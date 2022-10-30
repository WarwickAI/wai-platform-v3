import { Attribute, AttributeType, Element, Group, User } from "@prisma/client";

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
