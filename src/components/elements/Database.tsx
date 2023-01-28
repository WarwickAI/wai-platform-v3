import { CircleStackIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import { ColumnHeader } from "../attributes/Columns";
import DateAttribute from "../attributes/Date";
import MarkdownAttribute from "../attributes/Markdown";
import TextAttribute from "../attributes/Text";
import UsersAttribute from "../attributes/Users";
import { DBColumnType } from "../attributes/utils";
import Permissions from "../permissions";
import { EventRequiredAttributes } from "./Event";
import { PageRequiredAttributes } from "./Page";
import {
  ElementProps,
  ElementWithAttsGroups,
  RequiredAttribute,
} from "./utils";

export const DatabaseRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "Database Title" },
  { name: "Base Type", type: "DatabaseBaseType", value: "" },
  { name: "Columns", type: "Columns", value: [] },
];

export const DatabaseDescription = "Stores a list of items.";

export const DatabaseIcon = CircleStackIcon;

const DatabaseElement = ({ element, edit }: ElementProps) => {
  const [dbPermsOpen, setDbPermsOpen] = useState(false);
  const utils = trpc.useContext();

  const addElement = trpc.element.create.useMutation();
  const editAttribute = trpc.attribute.editValue.useMutation();

  const attributesAtt = element.atts.find(
    (attribute) => attribute.name === "Columns"
  );

  const columns = useMemo(() => {
    return attributesAtt?.value as DBColumnType[];
  }, [attributesAtt]);

  const databaseTitle = element.atts.find((a) => a.name === "Title");

  const handleAddRow = () => {
    const newElementAtts = columns.map((a) => {
      return { ...a, required: true, value: a.value || "" };
    });

    addElement.mutate(
      { type: "Text", index: 0, atts: newElementAtts, parentId: element.id },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(element.id);
          utils.element.queryAll.invalidate({ type: data.type });
          utils.element.getPage.invalidate({
            route: element.route,
          });
        },
      }
    );
  };

  const handleAddColumn = () => {
    const newAtts = [...columns];

    newAtts.push({
      name: "New Attribute" + Math.floor(Math.random() * 1000),
      type: "Text",
      value: "",
      required: false,
    });
    handleEditColumnsAttribute(newAtts);
  };

  const handleEditColumn = (oldName: string, newValue: DBColumnType) => {
    const newAtts = [...columns];

    const index = newAtts.findIndex((a) => a.name === oldName);

    newAtts[index] = newValue;

    handleEditColumnsAttribute(newAtts);
  };

  const handleDeleteColumn = (name: string) => {
    const newAtts = [...columns];

    const index = newAtts.findIndex((a) => a.name === name);

    newAtts.splice(index, 1);

    handleEditColumnsAttribute(newAtts);
  };

  const handleEditColumnsAttribute = (newValue: DBColumnType[]) => {
    if (!attributesAtt) return;
    editAttribute.mutate(
      { id: attributesAtt.id, value: newValue },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(data.elementId);
          utils.element.queryAll.invalidate({ type: data.element.type });
          data.element.parent &&
            utils.element.getPage.invalidate({
              route: data.element.parent.route,
            });
        },
      }
    );
  };

  // Check if the database has columns/attributes that match exisitng elements
  const matchingElements = useMemo(() => {
    const matching = {
      event: true,
      page: true,
    };

    for (const attribute of EventRequiredAttributes) {
      if (
        !columns ||
        columns.find(
          (a) => a.name === attribute.name && a.type === attribute.type
        ) === undefined
      ) {
        matching.event = false;
        break;
      }
    }

    for (const attribute of PageRequiredAttributes) {
      if (
        !columns ||
        columns.find(
          (a) => a.name === attribute.name && a.type === attribute.type
        ) === undefined
      ) {
        matching.page = false;
        break;
      }
    }

    return matching;
  }, [columns]);

  return (
    <div>
      <div className="flex flex-row space-x-2">
        {databaseTitle && (
          <TextAttribute attribute={databaseTitle} edit={edit} size="md" />
        )}
        <Permissions
          element={element}
          open={dbPermsOpen}
          setOpen={(v) => {
            setDbPermsOpen(v);
          }}
        />
        {matchingElements.event && (
          <div className="badge-primary badge badge-sm">Event</div>
        )}
        {matchingElements.page && (
          <div className="badge-primary badge badge-sm">Page</div>
        )}
      </div>
      <DatabaseTable
        columns={columns || []}
        edit={edit}
        elements={element.children}
        handleAddRow={handleAddRow}
        handleAddColumn={handleAddColumn}
        handleEditColumn={handleEditColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    </div>
  );
};

export default DatabaseElement;

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
  const [attrHeaderOpen, setAttrHeaderOpen] = useState<string>("");

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
                    open={attrHeaderOpen === att.name}
                    setOpen={(open) => {
                      if (open) {
                        setAttrHeaderOpen(att.name);
                      } else {
                        setAttrHeaderOpen("");
                      }
                    }}
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
                      <UsersAttribute attribute={att} edit={edit} />
                    )}
                  </td>
                ))}
              <td></td>
            </tr>
          ))}
          <tr>
            <button
              onClick={handleAddRow}
              className="tooltip tooltip-right p-2"
              data-tip="Add Row"
            >
              <PlusIcon className="h-6 w-6 text-neutral" />
            </button>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
