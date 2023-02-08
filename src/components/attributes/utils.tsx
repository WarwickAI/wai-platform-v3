import { Attribute, AttributeType } from "@prisma/client";
import { SVGProps } from "react";

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

export type CustomIcon = (
  props: SVGProps<SVGSVGElement> & {
    title?: string | undefined;
    titleId?: string | undefined;
  }
) => JSX.Element;