import { ElementType } from "@prisma/client";
import { SVGProps } from "react";
import { z } from "zod";
import { ColumnSchema } from "./attributes/Columns";
import elements from "./elements";

export type CustomIcon = (
  props: SVGProps<SVGSVGElement> & {
    title?: string | undefined;
    titleId?: string | undefined;
  }
) => JSX.Element;

// Given a database's column, calculate the valid element types for that database
export const getValidElementTypes = (
  columns: z.infer<typeof ColumnSchema>[]
) => {
  const validElementTypes: string[] = [];

  Object.keys(elements).forEach((key) => {
    const elementInfo = elements[key as ElementType];
    if (!elementInfo || !elementInfo.showInPicker) return;

    const requiredAttributes = elementInfo.requiredAtts;
    if (!requiredAttributes) return;

    let hasRequiredAttributes = true;

    requiredAttributes.forEach((att) => {
      const column = columns.find(
        (c) => c.name === att.name && c.type === att.type
      );
      if (!column) hasRequiredAttributes = false;
    });

    if (hasRequiredAttributes) validElementTypes.push(key);
  });

  return validElementTypes;
};
