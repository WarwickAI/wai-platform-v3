import { Popover } from "@headlessui/react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import { AdjustmentsHorizontalIcon as AdjustmentsHorizontalOutlineIcon } from "@heroicons/react/24/outline";
import { ElementType } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import ElementTypeAttribute from "../attributes/ElementType";
import EventElement from "./Event";
import {
  ElementAttributeDescription,
  ElementProps,
  ElementWithAttsGroupsChildren,
} from "./utils";

export const CollectionRequiredAttributes: ElementAttributeDescription[] = [
  { name: "Element Type", type: "ElementType" },
];

const CollectionElement = ({ element, edit }: ElementProps) => {
  const elementTypeAttribute = element.atts.find(
    (a) => a.name === "Element Type"
  );

  const queriedElementsData = trpc.element.queryAll.useQuery({
    type: elementTypeAttribute?.value as ElementType,
  });

  const queriedElements = queriedElementsData.data || [];

  return (
    <div>
      {edit && (
        <div className="flex flex-row flex-wrap space-x-2">
          {/* Popup for creating the survey questions */}
          {elementTypeAttribute && (
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={`flex flex-row items-center space-x-1 rounded-lg bg-secondary px-2 py-1 font-semibold text-secondary-content hover:bg-secondary-focus ${
                      open ? "outline-2" : "outline-none"
                    }`}
                  >
                    {open ? (
                      <AdjustmentsHorizontalIcon className="w-5" />
                    ) : (
                      <AdjustmentsHorizontalOutlineIcon className="w-5" />
                    )}
                    <span className="text-sm">Element Type</span>
                  </Popover.Button>
                  <Popover.Panel className="absolute top-8 left-0 z-10 flex w-96 flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
                    <ElementTypeAttribute
                      attribute={elementTypeAttribute}
                      edit={edit}
                    />
                  </Popover.Panel>
                </>
              )}
            </Popover>
          )}
        </div>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {queriedElements.map((element: ElementWithAttsGroupsChildren) => (
          <div key={element.id} className="rounded-xl border-2 p-2">
            <EventElement element={element} edit={edit} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionElement;
