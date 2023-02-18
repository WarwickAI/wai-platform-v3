import { PlusIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import attributes from "../../attributes";
import { ColumnAttributeSchema, ColumnSchema } from "../../attributes/Columns";
import { ColumnHeader } from "../../attributes/Columns/ColumnHeader";
import DateAttribute from "../../attributes/Date";
import MarkdownAttribute from "../../attributes/Markdown";
import TextAttribute from "../../attributes/Text";
import UsersAttribute from "../../attributes/Users";
import { ElementWithAttsGroups } from "../utils";

type DatabaseTableProps = {
  columns: z.infer<typeof ColumnAttributeSchema>;
  elements: ElementWithAttsGroups[];
  edit: boolean;
  handleAddRow: () => void;
  handleAddColumn: () => void;
  handleEditColumn: (
    oldName: string,
    newValue: z.infer<typeof ColumnSchema>
  ) => void;
  handleDeleteColumn: (name: string) => void;
};

const DatabaseTable = ({
  columns,
  elements,
  edit,
  handleAddRow,
  handleAddColumn,
  handleEditColumn,
  handleDeleteColumn,
}: DatabaseTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="table-compact w-full">
        <thead>
          <tr className="bg-gray-200">
            {columns
              .sort(
                (a, b) =>
                  columns.findIndex((c) => a.name === c.name) -
                  columns.findIndex((c) => b.name === c.name)
              )
              .map((att) => (
                <th
                  key={att.name}
                  className="border-r border-r-gray-300 text-base font-normal normal-case"
                >
                  <ColumnHeader
                    column={att}
                    edit={edit}
                    editColumn={handleEditColumn}
                    deleteColumn={handleDeleteColumn}
                  />
                </th>
              ))}
            {edit && (
              <th className="text-base font-normal normal-case">
                <div
                  className="tooltip tooltip-left"
                  data-tip="Add Database Column"
                >
                  <button onClick={handleAddColumn}>
                    <PlusIcon className="h-6 w-6 text-neutral" />
                  </button>
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {elements.map((element) => (
            <tr key={element.id}>
              {element.atts
                .sort(
                  (a, b) =>
                    columns.findIndex((c) => a.name === c.name) -
                    columns.findIndex((c) => b.name === c.name)
                )
                .map((att) => {
                  const AttributeEdit = attributes[att.type]?.element;

                  if (!AttributeEdit) return null;

                  return (
                    <td
                      key={element.id + att.name}
                      className="border-r border-r-gray-300"
                    >
                      <AttributeEdit attribute={att} edit={edit} />
                    </td>
                  );
                })}
              <td></td>
            </tr>
          ))}
          {edit && (
            <tr>
              <td
                onClick={handleAddRow}
                className="tooltip tooltip-right p-2"
                data-tip="Add Row"
              >
                <PlusIcon className="h-6 w-6 text-neutral" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DatabaseTable;
