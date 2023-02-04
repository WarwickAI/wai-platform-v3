import { PlusIcon } from "@heroicons/react/24/solid";
import PageElement from "../Page";
import { ElementWithAttsGroups } from "../utils";

type DatabasePagesProps = {
  pages: ElementWithAttsGroups[];
  handleAddRow: () => void;
  edit: boolean;
};

const DatabasePages = ({ pages, handleAddRow, edit }: DatabasePagesProps) => {
  return (
    <div className="flex flex-row flex-wrap space-x-2">
      {pages.map((page) => (
        <PageElement
          key={page.id}
          element={{ ...page, children: [] }}
          edit={edit}
          page={false}
        />
      ))}
      {edit && (
        <button
          onClick={handleAddRow}
          className="h-8 w-8 rounded-full p-1 hover:cursor-pointer hover:bg-slate-300"
        >
          <PlusIcon className="h-6 w-6 text-neutral" />
        </button>
      )}
    </div>
  );
};

export default DatabasePages;
