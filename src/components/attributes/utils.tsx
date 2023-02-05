import { Attribute, AttributeType } from "@prisma/client";

export type AttributeProps = {
  attribute: Attribute;
  edit: boolean;
};

export type DBColumnType = {
  name: string;
  type: AttributeType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  required: boolean;
};
