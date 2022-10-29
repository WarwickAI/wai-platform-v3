import { Bars4Icon, TrashIcon } from "@heroicons/react/24/solid";
import { Element } from "@prisma/client";
import { useCallback } from "react";
import { trpc } from "../utils/trpc";

type AddProps = {
  parent?: Element;
  element?: Element;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Modify = ({ parent, element, open, setOpen }: AddProps) => {
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
    <div className="relative">
      <div className="tooltip" data-tip="Modify Element">
        <button
          onClick={() => setOpen(!open)}
          className={`rounded-full transition-colors ${
            open ? "bg-neutral" : "bg-white"
          }`}
        >
          <Bars4Icon
            className={`h-6 w-6 ${open ? "text-white" : "text-neutral"}`}
          />
        </button>
      </div>
      <div
        className={`absolute z-10 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
          open ? "opacity-100" : "invisible opacity-0"
        }`}
      >
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
      </div>
    </div>
  );
};

export default Modify;
