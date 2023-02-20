import { Popover } from "@headlessui/react";
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
                  <Popover.Button className="flex flex-row items-center space-x-2 rounded-lg bg-primary px-2 py-1 font-semibold text-primary-content hover:bg-primary-focus">
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
      <div className="flex flex-row flex-wrap space-x-2">
        {queriedElements.map((element: ElementWithAttsGroupsChildren) => (
          <EventElement key={element.id} element={element} edit={edit} />
        ))}
      </div>
    </div>
  );
};

export default CollectionElement;
