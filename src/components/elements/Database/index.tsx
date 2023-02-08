import { useMemo } from "react";
import { z } from "zod";
import { trpc } from "../../../utils/trpc";
import { ColumnAttributeSchema, ColumnSchema } from "../../attributes/Columns";
import { DatabaseSortType } from "../../attributes/DatabaseSort";
import TextAttribute from "../../attributes/Text";
import Permissions from "../../permissions";
import { EventRequiredAttributes } from "../Event";
import { PageRequiredAttributes } from "../Page";
import { ElementProps, PreAttributeEditFn, RequiredAttribute } from "../utils";
import DatabaseEvents from "./Events";
import DatabasePages from "./Pages";
import DatabaseTable from "./Table";

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
    return ColumnAttributeSchema.parse(attributesAtt?.value);
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
    });
    handleEditColumnsAttribute(newAtts);
  };

  const handleEditColumn = (
    oldName: string,
    newValue: z.infer<typeof ColumnSchema>
  ) => {
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

  const handleEditColumnsAttribute = (
    newValue: z.infer<typeof ColumnAttributeSchema>
  ) => {
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
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              aAtt.value! > bAtt.value!
              ? 1
              : -1
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            aAtt.value! < bAtt.value!
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

export const databasePreAttributeEdit: PreAttributeEditFn = async (
  prisma,
  element,
  attribute,
  input
) => {
  if (attribute.type === "Columns") {
    const columns = ColumnAttributeSchema.parse(input.value);

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
