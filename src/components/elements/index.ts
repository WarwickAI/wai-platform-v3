import {
  CalendarIcon,
  CheckBadgeIcon,
  CircleStackIcon,
  DocumentIcon,
  ListBulletIcon,
  PencilIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  TableCellsIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { ElementType } from "@prisma/client";
import TextElement, { TextRequiredAttributes } from "./Text";
import PageElement, { PageRequiredAttributes } from "./Page";
import UserElement, { UserRequiredAttributes } from "./User";
import {
  ElementProps,
  ElementAttributeDescription,
  PreAttributeEditFn,
  ElementCreateCheckPermsFn,
  PreElementCreationFn,
  ElementDeleteCheckPermsFn,
  AttributeEditCheckPermsFn,
} from "./utils";
import EventElement, {
  eventAttributeEditCheckPerms,
  EventRequiredAttributes,
} from "./Event";
import DatabaseElement, {
  DatabaseRequiredAttributes,
  databasePreAttributeEdit,
} from "./Database";
import DatabaseViewElement, {
  DatabaseViewRequiredAttributes,
} from "./DatabaseView";
import SurveyElement, {
  SurveyRequiredAttributes,
  surveyPreAttributeEdit,
} from "./Survey";
import BadgeElement, { BadgeRequiredAttributes } from "./Badge";
import SurveyResponseElement, {
  surveyResponseCreateCheckPerms,
  surveyResponseDeleteCheckPerms,
  surveyResponsePreCreate,
  SurveyResponseRequiredAttributes,
} from "./SurveyResponse";
import ImageElement, { ImageRequiredAttributes } from "./Image";
import { CustomIcon } from "../utils";
import CollectionElement, { CollectionRequiredAttributes } from "./Collection";

export const PageElementTmp = PageElement;

const elements: {
  [key in ElementType]?: {
    name: string;
    description: string;
    icon: CustomIcon;
    element: ({ element, edit }: ElementProps) => JSX.Element;
    showInPicker: boolean;
    requiredAtts: ElementAttributeDescription[];
    elementCreatePermsCheck?: ElementCreateCheckPermsFn;
    elementDeletePermsCheck?: ElementDeleteCheckPermsFn;
    attributeEditPermsCheck?: AttributeEditCheckPermsFn;
    preAttributeEditFn?: PreAttributeEditFn;
    preElementCreateFn?: PreElementCreationFn;
  };
} = {
  [ElementType.Text]: {
    name: "Text",
    description: "A text element, supports Markdown.",
    icon: PencilIcon,
    element: TextElement,
    showInPicker: true,
    requiredAtts: TextRequiredAttributes,
  },
  [ElementType.Page]: {
    name: "Page",
    description: "Container for other elements.",
    icon: DocumentIcon,
    element: PageElement,
    showInPicker: true,
    requiredAtts: PageRequiredAttributes,
  },
  [ElementType.Event]: {
    name: "Event",
    description: "Scheduled event with location and time.",
    icon: CalendarIcon,
    element: EventElement,
    showInPicker: true,
    requiredAtts: EventRequiredAttributes,
    attributeEditPermsCheck: eventAttributeEditCheckPerms,
  },
  [ElementType.Badge]: {
    name: "Badge",
    description: "An award for users.",
    icon: CheckBadgeIcon,
    element: BadgeElement,
    showInPicker: true,
    requiredAtts: BadgeRequiredAttributes,
  },
  [ElementType.Database]: {
    name: "Database",
    description: "Stores a list of elements.",
    icon: CircleStackIcon,
    element: DatabaseElement,
    showInPicker: false,
    requiredAtts: DatabaseRequiredAttributes,
    preAttributeEditFn: databasePreAttributeEdit,
  },
  [ElementType.DatabaseView]: {
    name: "Database View",
    description: "A view of a database.",
    icon: TableCellsIcon,
    element: DatabaseViewElement,
    showInPicker: true,
    requiredAtts: DatabaseViewRequiredAttributes,
  },
  [ElementType.Survey]: {
    name: "Survey",
    description: "A survey element, with questions.",
    icon: PresentationChartBarIcon,
    element: SurveyElement,
    requiredAtts: SurveyRequiredAttributes,
    showInPicker: true,
    preAttributeEditFn: surveyPreAttributeEdit,
  },
  [ElementType.SurveyResponse]: {
    name: "Survey Response",
    description: "A response to a survey.",
    icon: PresentationChartBarIcon,
    element: SurveyResponseElement,
    requiredAtts: SurveyResponseRequiredAttributes,
    showInPicker: false,
    elementCreatePermsCheck: surveyResponseCreateCheckPerms,
    elementDeletePermsCheck: surveyResponseDeleteCheckPerms,
    preElementCreateFn: surveyResponsePreCreate,
  },
  [ElementType.Image]: {
    name: "Image",
    description: "An image element.",
    icon: PhotoIcon,
    element: ImageElement,
    requiredAtts: ImageRequiredAttributes,
    showInPicker: true,
  },
  [ElementType.Collection]: {
    name: "Collection",
    description: "A collection of elements.",
    icon: ListBulletIcon,
    element: CollectionElement,
    requiredAtts: CollectionRequiredAttributes,
    showInPicker: true,
  },
  [ElementType.User]: {
    name: "User",
    description: "Shows a user.",
    icon: UserIcon,
    element: UserElement,
    requiredAtts: UserRequiredAttributes,
    showInPicker: true,
  },
};

export default elements;
