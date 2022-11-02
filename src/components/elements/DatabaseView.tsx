import { CircleStackIcon, TableCellsIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import DatabaseAttribute from "../attributes/Database";
import TextAttribute from "../attributes/Text";
import { ElementProps, RequiredAttribute } from "./utils";

export const DatabaseViewRequiredAttributes: RequiredAttribute[] = [
  { name: "View Type", type: "DatabaseViewType", value: "Table" },
  { name: "Database", type: "Database", value: "" },
];

export const DatabaseViewDescription = "Shows a database's items.";

export const DatabaseViewIcon = TableCellsIcon;

const DatabaseViewElement = ({ element, edit }: ElementProps) => {
  const [selectOpen, setSelectOpen] = useState(false);
  const viewType = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "View Type");
  }, [element]);

  const database = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Database");
  }, [element]);

  const databaseQuery = trpc.element.get.useQuery(
    (database?.value as string) || ""
  );

  const databaseTitle = useMemo(() => {
    return databaseQuery.data?.atts.find((a) => a.name === "Title");
  }, [databaseQuery.data]);

  return (
    <div className="flex flex-row justify-between">
      {databaseQuery.data ? (
        viewType ? (
          databaseTitle && (
            <TextAttribute attribute={databaseTitle} edit={edit} size="md" />
          )
        ) : (
          <p>no view type...</p>
        )
      ) : (
        <p>loading database...</p>
      )}
      <div className="relative mr-8">
        <div className="tooltip" data-tip="Change Database">
          <button
            className={`rounded-full p-1 transition-colors ${
              selectOpen ? "bg-neutral" : "bg-white"
            }`}
            onClick={() => setSelectOpen(!selectOpen)}
          >
            <CircleStackIcon
              className={`h-4 w-4 ${
                selectOpen ? "text-white" : "text-neutral"
              }`}
            />
          </button>
        </div>
        <div
          className={`absolute right-0 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
            selectOpen ? "opacity-100" : "invisible opacity-0"
          }`}
        >
          {database && <DatabaseAttribute attribute={database} edit={edit} />}
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewElement;
