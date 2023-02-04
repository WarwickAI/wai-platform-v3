import { PlusIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";
import { trpc } from "../../utils/trpc";
import { ColumnHeader } from "../attributes/Columns";
import { DatabaseSortType } from "../attributes/DatabaseSort";
import DateAttribute from "../attributes/Date";
import MarkdownAttribute from "../attributes/Markdown";
import TextAttribute from "../attributes/Text";
import UsersAttribute from "../attributes/Users";
import { DBColumnType } from "../attributes/utils";
import Permissions from "../permissions";
import EventElement, { EventRequiredAttributes } from "./Event";
import PageElement, { PageRequiredAttributes } from "./Page";
import {
  ElementProps,
  ElementWithAttsGroups,
  PreAttributeEditFn,
  RequiredAttribute,
} from "./utils";

export const DatabaseRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "" },
  { name: "Base Type", type: "DatabaseBaseType", value: "" },
  { name: "Columns", type: "Columns", value: [] },
];

const DatabaseElement = ({
  element,
  edit,
  viewAs,
  sorts,
}: ElementProps & { viewAs?: string; sorts?: DatabaseSortType }) => {
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

  const sortedChildren = useMemo(() => {
    const children = element.children;

    if (!sorts) return children;

    const sorted = children.sort((a, b) => {
      let i = 0;
      while (true) {
        const sort = sorts[i];
        if (!sort) return 0;

        const aAtt = a.atts.find((att) => att.name === sort.columnName);
        const bAtt = b.atts.find((att) => att.name === sort.columnName);

        if (!aAtt || !bAtt) return 0;
        if (!aAtt) return -1;
        if (!bAtt) return 1;

        if (aAtt.value !== bAtt.value) {
          return sort.direction === "asc"
            ? aAtt.value! > bAtt.value!
              ? 1
              : -1
            : aAtt.value! < bAtt.value!
            ? 1
            : -1;
        }

        // Will only get to here if the values are the same
        // So we need to check the next sort
        i += 1;
      }
    });

    return sorted;
  }, [element.children, sorts]);

  return (
    <div>
      <div className="flex flex-row space-x-2">
        {databaseTitle && (
          <TextAttribute
            attribute={databaseTitle}
            edit={edit}
            size="md"
            placeholder="Edit database title..."
          />
        )}
        {edit && <Permissions element={element} />}
        {edit && matchingElements.event && (
          <div className="badge-primary badge badge-sm">Event</div>
        )}
        {edit && matchingElements.page && (
          <div className="badge-primary badge badge-sm">Page</div>
        )}
      </div>
      {!viewAs ||
        (viewAs === "table" && (
          <DatabaseTable
            columns={columns || []}
            edit={edit}
            elements={sortedChildren}
            handleAddRow={handleAddRow}
            handleAddColumn={handleAddColumn}
            handleEditColumn={handleEditColumn}
            handleDeleteColumn={handleDeleteColumn}
          />
        ))}
      {viewAs === "events" && (
        <DatabaseEvents
          events={sortedChildren}
          handleAddRow={handleAddRow}
          edit={edit}
        />
      )}
      {viewAs === "pages" && (
        <DatabasePages
          pages={sortedChildren}
          handleAddRow={handleAddRow}
          edit={edit}
        />
      )}
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
                      <UsersAttribute attribute={att} edit={edit} />
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
      <button
        onClick={handleAddRow}
        className="h-8 w-8 rounded-full p-1 hover:cursor-pointer hover:bg-slate-300"
      >
        <PlusIcon className="h-6 w-6 text-neutral" />
      </button>
    </div>
  );
};

type DatabaseEventsProps = {
  events: ElementWithAttsGroups[];
  handleAddRow: () => void;
  edit: boolean;
};

const DatabaseEvents = ({
  events,
  handleAddRow,
  edit,
}: DatabaseEventsProps) => {
  return (
    <div className="flex flex-row flex-wrap space-x-2">
      {events.map((event) => (
        <EventElement
          key={event.id}
          element={{ ...event, children: [] }}
          edit={edit}
        />
      ))}
      <button
        onClick={handleAddRow}
        className="h-8 w-8 rounded-full p-1 hover:cursor-pointer hover:bg-slate-300"
      >
        <PlusIcon className="h-6 w-6 text-neutral" />
      </button>
    </div>
  );
};

export const databasePreAttributeEdit: PreAttributeEditFn = async (
  prisma,
  element,
  attribute,
  input,
  user
) => {
  if (attribute.type === "Columns") {
    const columns = input.value as DBColumnType[];

    // Get all the children of the element
    const children = element.children;

    // Loop through all attributes of the children, and remove any that are not in the columns
    // and add any that are not in the children, and check that the types match
    for (const child of children) {
      // Get all the attributes of the child
      const atts = child.atts;

      // Loop through all the attributes of the child
      for (const att of atts) {
        // If the attribute is not in the columns, delete it
        if (!columns.find((c) => c.name === att.name)) {
          await prisma.attribute.delete({
            where: { id: att.id },
          });
        }
      }

      // Loop through all the columns
      for (const column of columns) {
        // If the column is not in the attributes, add it
        if (!atts.find((a) => a.name === column.name)) {
          await prisma.attribute.create({
            data: {
              name: column.name,
              type: column.type,
              value: column.value || "",
              required: column.required,
              element: {
                connect: {
                  id: child.id,
                },
              },
            },
          });
        }
      }

      // Loop through all the attributes of the child
      for (const att of atts) {
        // If the attribute type does not match the column type, update it
        const column = columns.find((c) => c.name === att.name);
        if (column && column.type !== att.type) {
          await prisma.attribute.update({
            where: { id: att.id },
            data: {
              type: column.type,
            },
          });
        }
      }
    }
  }

  return;
};
