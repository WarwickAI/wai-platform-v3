import { Popover } from "@headlessui/react";
import { CircleStackIcon, ViewColumnsIcon } from "@heroicons/react/24/solid";
import {
  CircleStackIcon as CircleStackOutlineIcon,
  ViewColumnsIcon as ViewColumnsOutlineIcon,
} from "@heroicons/react/24/outline";
import { Attribute } from "@prisma/client";
import { useMemo } from "react";
import { trpc } from "../../utils/trpc";
import DatabaseAttribute from "../attributes/Database";
import DatabaseElement from "./Database";
import { ElementProps, RequiredAttribute } from "./utils";
import DatabaseViewTypeAttribute from "../attributes/DatabaseViewType";

export const DatabaseViewRequiredAttributes: RequiredAttribute[] = [
  { name: "View Type", type: "DatabaseViewType", value: "Table" },
  { name: "Database", type: "Database", value: "" },
];

const DatabaseViewElement = ({ element, edit }: ElementProps) => {
  const viewType = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "View Type");
  }, [element]);

  const database = useMemo(() => {
    return element.atts.find((attribute) => attribute.name === "Database");
  }, [element]);

  const databaseQuery = trpc.element.get.useQuery(
    (database?.value as string) || ""
  );

  console.log(viewType);

  return (
    <div>
      {edit && (
        <div className="spacing-x-2 flex flex-row justify-start">
          <DatabaseSelectPopover attribute={database} />
          <DatabaseViewTypeSelectPopover attribute={viewType} />
        </div>
      )}
      {databaseQuery.data && (
        <DatabaseElement
          edit={edit}
          element={databaseQuery.data}
          viewAs={viewType?.value as string}
        />
      )}
    </div>
  );
};

export default DatabaseViewElement;

const DatabaseSelectPopover = ({ attribute }: { attribute?: Attribute }) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex flex-row items-center space-x-2 rounded-lg px-2 py-1 font-semibold hover:bg-slate-200 ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {open ? (
              <CircleStackIcon className="w-6" />
            ) : (
              <CircleStackOutlineIcon className="w-6" />
            )}
            <span className="text-sm">Database</span>
          </Popover.Button>
          <Popover.Panel
            className={`absolute top-10 left-0 z-10 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
              open ? "opacity-100" : "invisible opacity-0"
            }`}
          >
            {attribute && (
              <DatabaseAttribute attribute={attribute} edit={true} />
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

const DatabaseViewTypeSelectPopover = ({
  attribute,
}: {
  attribute?: Attribute;
}) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex flex-row items-center space-x-2 rounded-lg px-2 py-1 font-semibold hover:bg-slate-200 ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {open ? (
              <ViewColumnsIcon className="w-6" />
            ) : (
              <ViewColumnsOutlineIcon className="w-6" />
            )}
            <span className="text-sm">View Type</span>
          </Popover.Button>
          <Popover.Panel
            className={`absolute top-10 left-0 z-10 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
              open ? "opacity-100" : "invisible opacity-0"
            }`}
          >
            {attribute && (
              <DatabaseViewTypeAttribute attribute={attribute} edit={true} />
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};
