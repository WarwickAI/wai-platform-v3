import {
  CalculatorIcon,
  CalendarDaysIcon,
  CheckIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  FunnelIcon,
  InboxStackIcon,
  PaperClipIcon,
  PhotoIcon,
  QuestionMarkCircleIcon,
  Square3Stack3DIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/solid";
import { AttributeType } from "@prisma/client";
import { z } from "zod";
import ColumnAttribute, { ColumnAttributeSchema } from "./Columns";
import DateAttribute, { DateAttributeSchema } from "./Date";
import FileAttribute, { FileAttributeSchema } from "./File";
import ImageAttribute, { ImageAttributeSchema } from "./Image";
import MarkdownAttribute, { MarkdownAttributeSchema } from "./Markdown";
import NumberAttribute, { NumberAttributeSchema } from "./Number";
import TextAttribute, { TextAttributeSchema } from "./Text";
import DatabaseAttribute, { DatabaseAttributeSchema } from "./Database";
import { AttributeProps } from "./utils";
import DatabaseFilterAttribute, {
  DatabaseFilterAttributeSchema,
} from "./DatabaseFilter";
import DatabaseViewTypeAttribute, {
  DatabaseViewTypeAttributeSchema,
} from "./DatabaseViewType";
import UserAttribute, { UserAttributeSchema } from "./User";
import UsersAttribute, { UsersAttributeSchema } from "./Users";
import SurveyQuestionsAttribute, {
  SurveyQuestionsAttributeSchema,
} from "./SurveyQuestion";
import { CustomIcon } from "../utils";
import BooleanAttribute, { BooleanAttributeSchema } from "./Boolean";
import ElementTypeAttribute, {
  ElementTypeAttributeSchema,
} from "./ElementType";
import STVAttribute, { STVAttributeSchema } from "./STV";
import DatabaseSortAttribute, {
  DatabaseSortAttributeSchema,
} from "./DatabaseSort";

const attributes: {
  [key in AttributeType]?: {
    name: string;
    description: string;
    icon: CustomIcon;
    valueSchema: z.ZodSchema<any>;
    element: (v: AttributeProps) => JSX.Element;
    showInPicker?: boolean;
  };
} = {
  [AttributeType.Number]: {
    name: "Number",
    description: "A number",
    icon: CalculatorIcon,
    valueSchema: NumberAttributeSchema,
    element: NumberAttribute,
    showInPicker: true,
  },
  [AttributeType.Text]: {
    name: "Text",
    description: "Non-formatted text",
    icon: DocumentTextIcon,
    valueSchema: TextAttributeSchema,
    element: TextAttribute,
    showInPicker: true,
  },
  [AttributeType.Markdown]: {
    name: "Markdown",
    description: "Formatted text",
    icon: DocumentTextIcon,
    valueSchema: MarkdownAttributeSchema,
    element: MarkdownAttribute,
    showInPicker: true,
  },
  [AttributeType.Date]: {
    name: "Date",
    description: "A date with time",
    icon: CalendarDaysIcon,
    valueSchema: DateAttributeSchema,
    element: DateAttribute,
    showInPicker: true,
  },
  [AttributeType.Image]: {
    name: "Image",
    description: "An image upload",
    icon: PhotoIcon,
    valueSchema: ImageAttributeSchema,
    element: ImageAttribute,
    showInPicker: true,
  },
  [AttributeType.File]: {
    name: "File",
    description: "A file upload",
    icon: PaperClipIcon,
    valueSchema: FileAttributeSchema,
    element: FileAttribute,
    showInPicker: true,
  },
  [AttributeType.Columns]: {
    name: "Columns",
    description: "A set of columns for a database",
    icon: Square3Stack3DIcon,
    valueSchema: ColumnAttributeSchema,
    element: ColumnAttribute,
    showInPicker: false,
  },
  [AttributeType.Database]: {
    name: "Database",
    description: "A database",
    icon: CircleStackIcon,
    valueSchema: DatabaseAttributeSchema,
    element: DatabaseAttribute,
    showInPicker: false,
  },
  [AttributeType.DatabaseSort]: {
    name: "Database Sort",
    description: "Sorting for a database",
    icon: InboxStackIcon,
    valueSchema: DatabaseSortAttributeSchema,
    element: DatabaseSortAttribute,
    showInPicker: false,
  },
  [AttributeType.DatabaseViewType]: {
    name: "Database View Type",
    description: "The view type for a database",
    icon: ViewColumnsIcon,
    valueSchema: DatabaseViewTypeAttributeSchema,
    element: DatabaseViewTypeAttribute,
    showInPicker: false,
  },
  [AttributeType.User]: {
    name: "User",
    description: "A user",
    icon: UserIcon,
    valueSchema: UserAttributeSchema,
    element: UserAttribute,
    showInPicker: true,
  },
  [AttributeType.Users]: {
    name: "Users",
    description: "A collection of users",
    icon: UsersIcon,
    valueSchema: UsersAttributeSchema,
    element: UsersAttribute,
    showInPicker: true,
  },
  [AttributeType.SurveyQuestions]: {
    name: "Survey Questions",
    description: "A collection of survey questions",
    icon: QuestionMarkCircleIcon,
    valueSchema: SurveyQuestionsAttributeSchema,
    element: SurveyQuestionsAttribute,
    showInPicker: false,
  },
  [AttributeType.Boolean]: {
    name: "Boolean",
    description: "A boolean value",
    icon: CheckIcon,
    valueSchema: BooleanAttributeSchema,
    element: BooleanAttribute,
    showInPicker: true,
  },
  [AttributeType.ElementType]: {
    name: "Element Type",
    description: "The type of element",
    icon: Cog6ToothIcon,
    valueSchema: ElementTypeAttributeSchema,
    element: ElementTypeAttribute,
    showInPicker: false,
  },
  [AttributeType.STV]: {
    name: "STV",
    description: "Single transferable vote",
    icon: StarIcon,
    valueSchema: STVAttributeSchema,
    element: STVAttribute,
    showInPicker: false,
  },
  [AttributeType.DatabaseFilter]: {
    name: "Database Filter",
    description: "Filters for a database",
    icon: FunnelIcon,
    valueSchema: DatabaseFilterAttributeSchema,
    element: DatabaseFilterAttribute,
    showInPicker: false,
  },
};

export default attributes;
