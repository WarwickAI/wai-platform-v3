import { Popover } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AttributeType, Element, ElementType } from "@prisma/client";
import { trpc } from "../utils/trpc";
import attributes from "./attributes";
import Elements from "./elements";

type AddProps = {
  parent?: Element;
  index: number;
};

const Add = ({ parent, index }: AddProps) => {
  const utils = trpc.useContext();

  const createElement = trpc.element.create.useMutation({
    onSuccess: () => {
      // Refresh the page
      utils.element.getAll.invalidate();
      utils.element.getPage.invalidate({
        route: parent?.route || "",
      });
    },
  });

  const handleCreate = (type: ElementType, index: number) => {
    const elementData = Elements[type];

    if (!elementData) {
      throw new Error("Unknown element type");
    }

    const atts = elementData.requiredAtts.map((a) => {
      // Find attribute
      const attInfo = attributes[a.type as AttributeType];
      if (!attInfo) throw new Error("Invalid attribute type");
      return {
        name: a.name,
        type: a.type,
        // For the value, use the default value of the attribute's zod schema
        value: attInfo.valueSchema.parse(undefined),
      };
    });

    createElement.mutate({ type, index, atts, parentId: parent?.id });
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`rounded-full transition-colors ${
              open ? "bg-neutral" : "bg-white"
            }`}
          >
            <PlusIcon
              className={`h-6 w-6 ${open ? "text-white" : "text-neutral"}`}
            />
          </Popover.Button>
          <Popover.Panel className="absolute top-10 left-0 z-10 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
            {Object.keys(Elements)
              .filter((type) => Elements[type as ElementType]?.showInPicker)
              .map((type) => (
                <AddElementType
                  key={type}
                  type={type as ElementType}
                  create={(type) => {
                    handleCreate(type, index);
                    close();
                  }}
                />
              ))}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default Add;

type AddElementTypeProps = {
  type: ElementType;
  create: (type: ElementType) => void;
};

const AddElementType = ({ type, create }: AddElementTypeProps) => {
  const description = Elements[type]?.description;
  const Icon = Elements[type]?.icon;

  return description && Icon ? (
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
  ) : null;
};
