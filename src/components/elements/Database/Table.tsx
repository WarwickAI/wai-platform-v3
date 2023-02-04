import { PlusIcon } from "@heroicons/react/24/solid";
import { ColumnHeader } from "../../attributes/Columns";
import DateAttribute from "../../attributes/Date";
import MarkdownAttribute from "../../attributes/Markdown";
import TextAttribute from "../../attributes/Text";
import UsersAttribute from "../../attributes/Users";
import { DBColumnType } from "../../attributes/utils";
import { ElementWithAttsGroups } from "../utils";

type DatabaseTableProps = {
  columns: DBColumnType[];
  elements: ElementWithAttsGroups[];
  edit: boolean;
  handleAddRow: () => void;
  handleAddColumn: () => void;
  handleEditColumn: (oldName: string, newValue: DBColumnType) => void;
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
                .map((att) => (
                  <td
                    key={element.id + att.name}
                    className="border-r border-r-gray-300"
                  >
                    {att.type === "Text" && (
                      <TextAttribute attribute={att} edit={edit} size="sm" />
                    )}
                    {att.type === "Date" && (
                      <DateAttribute attribute={att} edit={edit} />
                    )}
                    {att.type === "Markdown" && (
                      <MarkdownAttribute attribute={att} edit={edit} />
                    )}
                    {att.type === "Users" && (
                      <UsersAttribute
                       attribute={att} edit={edit} />
                    )}
                  </td>
                ))}
              <td></td>
            </tr>
          ))}
          <tr>
            <td
              onClick={handleAddRow}
              className="tooltip tooltip-right p-2"
              data-tip="Add Row"
            >
              <PlusIcon className="h-6 w-6 text-neutral" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DatabaseTable;
