import { TableCellsIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";
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
    <div>
      {database && <DatabaseAttribute attribute={database} edit={edit} />}
      {databaseQuery.data ? (
        viewType ? (
          databaseTitle && (
            <TextAttribute attribute={databaseTitle} edit={edit} size="md"/>
          )
        ) : (
          <p>no view type...</p>
        )
      ) : (
        <p>loading database...</p>
      )}
    </div>
  );
};

export default DatabaseViewElement;
