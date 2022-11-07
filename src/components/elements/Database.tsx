import { CircleStackIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import { AttributeHeader } from "../attributes/Attributes";
import TextAttribute from "../attributes/Text";
import { DBAttributeType } from "../attributes/utils";
import Permissions from "../permissions";
import {
  ElementProps,
  ElementWithAttsGroups,
  RequiredAttribute,
} from "./utils";

export const DatabaseRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "Database Title" },
  { name: "Base Type", type: "DatabaseBaseType", value: "" },
  { name: "Attributes", type: "Attributes", value: [] },
];

export const DatabaseDescription = "Stores a list of items.";

export const DatabaseIcon = CircleStackIcon;

const DatabaseElement = ({ element, edit }: ElementProps) => {
  const [dbPermsOpen, setDbPermsOpen] = useState(false);
  const utils = trpc.useContext();

  const addElement = trpc.element.create.useMutation();
  const editAttribute = trpc.attribute.editValue.useMutation();

  const attributesAtt = element.atts.find(
    (attribute) => attribute.name === "Attributes"
  );

  const attributes = useMemo(() => {
    return attributesAtt?.value as DBAttributeType[];
  }, [attributesAtt]);

  const databaseTitle = element.atts.find((a) => a.name === "Title");

  const handleAddRow = () => {
    const newElementAtts = attributes.map((a) => {
      return { ...a, required: true };
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

  const handleAddAttribute = () => {
    const newAtts = [...attributes];

    newAtts.push({
      name: "New Attribute" + Math.floor(Math.random() * 1000),
      type: "Text",
      value: "",
      required: false,
    });
    handleEdit(newAtts);
  };

  const handleEditAttribute = (oldName: string, newValue: DBAttributeType) => {
    const newAtts = [...attributes];

    const index = newAtts.findIndex((a) => a.name === oldName);

    newAtts[index] = newValue;

    handleEdit(newAtts);
  };

  const handleDeleteAttribute = (name: string) => {
    const newAtts = [...attributes];

    const index = newAtts.findIndex((a) => a.name === name);

    newAtts.splice(index, 1);

    handleEdit(newAtts);
  };

  const handleEdit = (newValue: DBAttributeType[]) => {
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
      </div>
      <DatabaseTable
        columns={attributes}
        edit={edit}
        elements={element.children}
        handleAddAttribute={handleAddAttribute}
        handleEditAttribute={handleEditAttribute}
        handleDeleteAttribute={handleDeleteAttribute}
      />
    </div>
  );
};

export default DatabaseElement;

type DatabaseTableProps = {
  columns: DBAttributeType[];
  elements: ElementWithAttsGroups[];
  edit: boolean;
  handleAddRow: () => void;
  handleAddAttribute: () => void;
  handleEditAttribute: (oldName: string, newValue: DBAttributeType) => void;
  handleDeleteAttribute: (name: string) => void;
};

const DatabaseTable = ({
  columns,
  elements,
  edit,
  handleAddRow,
  handleAddAttribute,
  handleEditAttribute,
  handleDeleteAttribute,
}: DatabaseTableProps) => {
  const [attrHeaderOpen, setAttrHeaderOpen] = useState<string>("");

  return (
    <div className="">
      <table className="table-compact z-0 table w-full">
        <thead>
          <tr>
            {columns.map((att) => (
              <th key={att.name} className="text-base font-normal normal-case">
                <AttributeHeader
                  attribute={att}
                  edit={edit}
                  editAttribute={handleEditAttribute}
                  deleteAttribute={handleDeleteAttribute}
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
              <div className="tooltip" data-tip="Add Database Attribute">
                <button onClick={handleAddAttribute}>
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
                  <td key={element.id + att.name}>
                    {att.type === "Text" && (
                      <TextAttribute attribute={att} edit={edit} size="sm" />
                    )}
                  </td>
                ))}
              <td></td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
    </div>
  );
};
