import { PlusIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { z } from "zod";
import { trpc } from "../../../utils/trpc";
import attributes from "../../attributes";
import { ColumnAttributeSchema, ColumnSchema } from "../../attributes/Columns";
import { ColumnHeader } from "../../attributes/Columns/ColumnHeader";
import Modify from "../../modify";
import Permissions from "../../permissions";
import { ElementWithAttsGroups } from "../utils";

type DatabaseTableProps = {
  database: ElementWithAttsGroups;
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
  database,
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
            <DatabaseTableRow
              key={element.id}
              database={database}
              element={element}
              columns={columns}
              editParent={edit}
            />
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

type DatabaseTableRowProps = {
  database: ElementWithAttsGroups;
  element: ElementWithAttsGroups;
  columns: z.infer<typeof ColumnAttributeSchema>;
  editParent: boolean;
};

const DatabaseTableRow = ({
  database,
  element,
  columns,
  editParent,
}: DatabaseTableRowProps) => {
  const userData = trpc.user.getMe.useQuery();
  const user = userData.data;

  const [hovered, setHovered] = useState(false);

  const edit = useMemo(() => {
    if (!element || !user) return false;

    // Check it the user is an admin
    if (user.groups.find((g) => g.name === "Admin")) return true;

    // Check if the all group is in the edit groups
    if (element.editGroups.find((group) => group.name === "All")) return true;

    return user.groups.some((g) =>
      element.editGroups.find((eg) => eg.id === g.id)
    );
  }, [element, user]);

  // Should the element be shown as hovered
  const showHovered = hovered && editParent;
  const showPerms = hovered && edit;

  return (
    <tr
      key={element.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
      {/* This is the adding column cell */}
      <td>
        <div className="flex flex-row space-x-1">
          {showPerms && element && (
            <Permissions element={element} parent={database} />
          )}
          {showHovered && <Modify parent={database} element={element} />}
        </div>
      </td>
    </tr>
  );
};
