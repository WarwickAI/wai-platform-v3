import { PlusIcon } from "@heroicons/react/24/solid";
import { AttributeType, Element, ElementType } from "@prisma/client";
import { trpc } from "../utils/trpc";
import {
  DatabaseViewDescription,
  DatabaseViewIcon,
  DatabaseViewRequiredAttributes,
} from "./elements/DatabaseView";
import {
  EventDescription,
  EventIcon,
  EventRequiredAttributes,
} from "./elements/Event";
import {
  PageDescription,
  PageIcon,
  PageRequiredAttributes,
} from "./elements/Page";
import {
  TextDescription,
  TextIcon,
  TextRequiredAttributes,
} from "./elements/Text";
import {
  BadgeDescription,
  BadgeIcon,
  BadgeRequiredAttributes,
} from "./elements/Badge";

type AddProps = {
  parent?: Element;
  index: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Add = ({ parent, index, open, setOpen }: AddProps) => {
  const utils = trpc.useContext();

  const createElement = trpc.element.create.useMutation();

  const handleCreate = (type: ElementType, index: number) => {
    let atts: {
      name: string;
      type: AttributeType;
      value: string | string[];
      required: boolean;
    }[] = [];

    if (type === "Text") {
      atts = TextRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    } else if (type === "Page") {
      atts = PageRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    } else if (type === "Event") {
      atts = EventRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    } else if (type === "DatabaseView") {
      atts = DatabaseViewRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    } else if (type === "Badge") {
      atts = BadgeRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    } else {
      throw new Error("Unknown element type");
    }

    createElement.mutate(
      { type, index, atts, parentId: parent?.id },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({
            route: parent?.route || "",
          });
          setOpen(false);
        },
      }
    );
  };

  return (
    <div className="relative">
      <div className="tooltip" data-tip="Add Element">
        <button
          onClick={() => setOpen(!open)}
          className={`rounded-full transition-colors ${
            open ? "bg-neutral" : "bg-white"
          }`}
        >
          <PlusIcon
            className={`h-6 w-6 ${open ? "text-white" : "text-neutral"}`}
          />
        </button>
      </div>
      <div
        className={`absolute z-10 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
          open ? "opacity-100" : "invisible opacity-0"
        }`}
      >
        <AddElementType
          type="Text"
          create={(type) => handleCreate(type, index)}
        />
        <AddElementType
          type="Page"
          create={(type) => handleCreate(type, index)}
        />
        <AddElementType
          type="Event"
          create={(type) => handleCreate(type, index)}
        />
        <AddElementType
          type="DatabaseView"
          create={(type) => handleCreate(type, index)}
        />
        <AddElementType
          type="Badge"
          create={(type) => handleCreate(type, index)}
        />
      </div>
    </div>
  );
};

export default Add;

type AddElementTypeProps = {
  type: ElementType;
  create: (type: ElementType) => void;
};

const AddElementType = ({ type, create }: AddElementTypeProps) => {
  const description =
    type === "Text"
      ? TextDescription
      : type === "Page"
      ? PageDescription
      : type === "Event"
      ? EventDescription
      : type === "Badge"
      ? BadgeDescription
      : DatabaseViewDescription;
  const Icon =
    type === "Text"
      ? TextIcon
      : type === "Page"
      ? PageIcon
      : type === "Event"
      ? EventIcon
      : type === "Badge"
      ? BadgeIcon
      : DatabaseViewIcon;

  return (
    <button
      onClick={() => create(type)}
      className="flex flex-row items-center space-x-2 rounded-md p-2 hover:bg-slate-100"
    >
      <div>
        <Icon className="h-6 w-6 text-neutral" />
      </div>
      <div className="text-start">
        <p className="text-sm font-bold">{type}</p>
        <p className="text-xs">{description}</p>
      </div>
    </button>
  );
};
