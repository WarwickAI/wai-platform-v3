import {
  CalculatorIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { AttributeType } from "@prisma/client";
import { z } from "zod";
import DateAttribute, { DateAttributeSchema } from "./Date";
import MarkdownAttribute, { MarkdownAttributeSchema } from "./Markdown";
import NumberAttribute, { NumberAttributeSchema } from "./Number";
import TextAttribute, { TextAttributeSchema } from "./Text";
import { AttributeProps, CustomIcon } from "./utils";

const attributes: {
  [key in AttributeType]?: {
    name: string;
    description: string;
    icon: CustomIcon;
    valueSchema: z.ZodSchema<any>;
    element: (v: AttributeProps) => JSX.Element;
  };
} = {
  [AttributeType.Number]: {
    name: "Number",
    description: "A number",
    icon: CalculatorIcon,
    valueSchema: NumberAttributeSchema,
    element: NumberAttribute,
  },
  [AttributeType.Text]: {
    name: "Text",
    description: "Non-formatted text",
    icon: DocumentTextIcon,
    valueSchema: TextAttributeSchema,
    element: TextAttribute,
  },
  [AttributeType.Markdown]: {
    name: "Markdown",
    description: "Formatted text",
    icon: DocumentTextIcon,
    valueSchema: MarkdownAttributeSchema,
    element: MarkdownAttribute,
  },
  [AttributeType.Date]: {
    name: "Date",
    description: "A date with time",
    icon: CalendarDaysIcon,
    valueSchema: DateAttributeSchema,
    element: DateAttribute,
  },
};

export default attributes;
