import { TrashIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { ColumnAttributeSchema } from "./Columns";
import { AttributeProps } from "./utils";

export type DatabaseFilterType = {
  columnName: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "notLike";
  value: any;
}[];

export const DatabaseFilterAttributeSchema = z
  .array(
    z.object({
      columnName: z.string(),
      operator: z.enum([
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "like",
        "notLike",
      ]),
      value: z.any(),
    })
  )
  .default([]);

const DatabaseFilterAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const databaseViewData = trpc.element.get.useQuery(attribute.elementId);

  const databaseAttribute = databaseViewData.data?.atts.find(
    (att) => att.name === "Database"
  );

  const databaseData = trpc.element.get.useQuery(
    databaseAttribute?.value as string
  );

  const columns = ColumnAttributeSchema.parse(
    databaseData.data?.atts.find((att) => att.name === "Columns")?.value
  );

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
        (attribute.value as DatabaseFilterType).map((filter, index) => (
          <div key={index} className="flex flex-row justify-between space-x-2">
            <select
              className={`select-ghost select select-sm border-0 text-lg font-medium ${
                !edit ? "pointer-events-none" : ""
              }`}
              value={filter.columnName}
              placeholder={edit ? "Edit filter..." : ""}
              onChange={(e) => {
                editAttribute.mutate({
                  id: attribute?.id || "",
                  value: (attribute.value as DatabaseFilterType).map(
                    (filter, i) =>
                      i === index
                        ? {
                            ...filter,
                            columnName: e.target.value,
                          }
                        : filter
                  ),
                });
              }}
            >
              <option value={0} disabled>
                Select a filter attribute
              </option>
              {columns?.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
            <select
              className={`select-ghost select select-sm border-0 text-lg font-medium ${
                !edit ? "pointer-events-none" : ""
              }`}
              value={filter.operator}
              placeholder={edit ? "Edit operator..." : ""}
              onChange={(e) => {
                editAttribute.mutate({
                  id: attribute?.id || "",
                  value: (attribute.value as DatabaseFilterType).map(
                    (filter, i) =>
                      i === index
                        ? {
                            ...filter,
                            operator: e.target.value as any,
                          }
                        : filter
                  ),
                });
              }}
            >
              <option value={0} disabled>
                Select a filter operator
              </option>
              <option value="eq">Equals</option>
              <option value="neq">Not Equals</option>
              <option value="gt">Greater Than</option>
              <option value="gte">Greater Than or Equal</option>
              <option value="lt">Less Than</option>
              <option value="lte">Less Than or Equal</option>
              <option value="like">Like</option>
              <option value="notLike">Not Like</option>
            </select>

            <input
              className={`input-ghost input input-sm border-0 text-lg font-medium ${
                !edit ? "pointer-events-none" : ""
              }`}
              value={filter.value}
              placeholder={edit ? "Edit value..." : ""}
              onChange={(e) => {
                editAttribute.mutate({
                  id: attribute?.id || "",
                  value: (attribute.value as DatabaseFilterType).map(
                    (filter, i) =>
                      i === index
                        ? {
                            ...filter,
                            value: e.target.value,
                          }
                        : filter
                  ),
                });
              }}
            />
            <button
              onClick={() =>
                editAttribute.mutate({
                  id: attribute.id || "",
                  value: (attribute.value as DatabaseFilterType).filter(
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
                ...(attribute.value as DatabaseFilterType),
                { columnName: e.target.value, direction: "asc" },
              ],
            });
          }}
        >
          <option value={0} disabled>
            Select a filter attribute
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

export default DatabaseFilterAttribute;
