import { Switch } from "@headlessui/react";
import { Bars3BottomRightIcon, TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "../../utils/trpc";
import { AttributeProps, DBColumnType } from "./utils";

export type DatabaseSortType = {
  columnName: string;
  direction: "asc" | "desc";
}[];

export const DatabaseSortIcon = Bars3BottomRightIcon;

const DatabaseSortAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const databaseViewData = trpc.element.get.useQuery(attribute.elementId);

  const databaseAttribute = databaseViewData.data?.atts.find(
    (att) => att.name === "Database"
  );

  const databaseData = trpc.element.get.useQuery(
    databaseAttribute?.value as string
  );

  const columns = databaseData.data?.atts.find((att) => att.name === "Columns")
    ?.value as DBColumnType[] | undefined;

  const editAttribute = trpc.attribute.editValue.useMutation({
    onSuccess: (data) => {
      utils.element.getAll.invalidate();
      utils.element.get.invalidate(data.elementId);
      utils.element.queryAll.invalidate({ type: data.element.type });
      data.element.parent &&
        utils.element.getPage.invalidate({
          route: data.element.parent.route,
        });
    },
  });

  return (
    <div>
      {attribute?.value &&
        (attribute.value as DatabaseSortType).map((sort, index) => (
          <div key={index} className="flex flex-row justify-between space-x-2">
            <select
              className={`select-ghost select select-sm border-0 text-lg font-medium ${
                !edit ? "pointer-events-none" : ""
              }`}
              value={sort.columnName}
              placeholder={edit ? "Edit sort..." : ""}
              onChange={(e) => {
                editAttribute.mutate({
                  id: attribute?.id || "",
                  value: (attribute.value as DatabaseSortType).map((sort, i) =>
                    i === index
                      ? {
                          ...sort,
                          columnName: e.target.value,
                        }
                      : sort
                  ),
                });
              }}
            >
              <option value={0} disabled>
                Select a sort attribute
              </option>
              {columns?.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
            <Switch
              checked={sort.direction === "asc"}
              onChange={(v: boolean) => {
                editAttribute.mutate({
                  id: attribute?.id || "",
                  value: (attribute.value as DatabaseSortType).map((sort, i) =>
                    i === index
                      ? {
                          ...sort,
                          direction: v ? "asc" : "desc",
                        }
                      : sort
                  ),
                });
              }}
              className={`${
                sort.direction === "asc" ? "bg-blue-600" : "bg-gray-200"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Ascending</span>
              <span
                className={`${
                  sort.direction === "asc" ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
            <button
              onClick={() =>
                editAttribute.mutate({
                  id: attribute.id || "",
                  value: (attribute.value as DatabaseSortType).filter(
                    (_, i) => i !== index
                  ),
                })
              }
            >
              <TrashIcon className="h-8 w-8" />
            </button>
          </div>
        ))}
      <div className="flex flex-row justify-between">
        <select
          className={`select-ghost select select-sm border-0 text-lg font-medium ${
            !edit ? "pointer-events-none" : ""
          }`}
          value={0}
          placeholder={edit ? "Edit sort..." : ""}
          onChange={(e) => {
            editAttribute.mutate({
              id: attribute.id || "",
              value: [
                ...(attribute.value as DatabaseSortType),
                { columnName: e.target.value, direction: "asc" },
              ],
            });
          }}
        >
          <option value={0} disabled>
            Select a sort attribute
          </option>
          {columns?.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DatabaseSortAttribute;
