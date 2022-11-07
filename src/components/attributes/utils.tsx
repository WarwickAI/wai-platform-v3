import { Attribute, AttributeType, Prisma } from "@prisma/client";

export type AttributeProps = {
  attribute: Attribute;
  edit: boolean;
};

export type DBColumnType = {
  name: string;
  type: AttributeType;
  value: Prisma.JsonValue;
  required: boolean;
};
