import { Popover } from "@headlessui/react";
import { Bars4Icon, TrashIcon } from "@heroicons/react/24/solid";
import { Element } from "@prisma/client";
import { useCallback } from "react";
import { trpc } from "../utils/trpc";

type ModifyProps = {
  parent?: Element;
  element?: Element;
};

const Modify = ({ parent, element }: ModifyProps) => {
  const utils = trpc.useContext();

  const deleteElement = trpc.element.delete.useMutation();

  const handleDelete = useCallback(() => {
    if (!element) return;

    deleteElement.mutate(
      { id: element.id },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({
            route: parent?.route || "",
          });
        },
      }
    );
  }, [deleteElement, element, parent, utils]);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`rounded-full p-1 transition-colors ${
              open ? "z-10 bg-neutral" : "bg-white"
            }`}
          >
            <Bars4Icon
              className={`h-5 w-5 ${open ? "text-white" : "text-neutral"}`}
            />
          </Popover.Button>
          <Popover.Panel className="absolute left-0 top-8 z-10 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
            <button
              onClick={handleDelete}
              className="flex flex-row items-center space-x-2 rounded-md p-2 hover:bg-slate-100"
            >
              <div>
                <TrashIcon className="h-6 w-6 text-neutral" />
              </div>

              <div className="text-start">
                <p className="text-sm font-bold">Delete</p>
                <p className="text-xs">Remove this element</p>
              </div>
            </button>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default Modify;
