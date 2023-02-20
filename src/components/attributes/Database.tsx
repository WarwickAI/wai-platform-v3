import {
  CircleStackIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Attribute, AttributeType } from "@prisma/client";
import { z } from "zod";
import attributes from ".";
import { trpc } from "../../utils/trpc";
import { DatabaseRequiredAttributes } from "../elements/Database";
import { ElementWithAtts } from "../elements/utils";
import { AttributeProps } from "./utils";

export const DatabaseAttibuteIcon = CircleStackIcon;

export const DatabaseAttributeSchema = z.string().default("");

const DatabaseAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();
  const deleteElement = trpc.element.delete.useMutation();

  const handleEdit = (newValue: string) => {
    editAttribute.mutate(
      { id: attribute.id, value: newValue },
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

  const handleDelete = () => {
    deleteElement.mutate(
      { id: (attribute?.value as string) || "" },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(data.id);
          utils.element.queryAll.invalidate({ type: data.type });
        },
      }
    );
  };

  const databases = trpc.element.queryAll.useQuery({
    type: "Database",
  });

  const createElement = trpc.element.create.useMutation();

  const handleCreate = () => {
    let atts: {
      name: string;
      type: AttributeType;
      value: any;
    }[] = [];

    atts = DatabaseRequiredAttributes.map((a) => {
      // Find attribute
      const attInfo = attributes[a.type];
      if (!attInfo) throw new Error("Invalid attribute type");
      return {
        name: a.name,
        type: a.type,
        // For the value, use the default value of the attribute's zod schema
        value: attInfo.valueSchema.parse(undefined),
      };
    });

    createElement.mutate(
      { type: "Database", index: 0, atts },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.queryAll.invalidate({ type: "Database" });
          data && utils.element.get.invalidate(data.id);
          data && handleEdit(data.id);
        },
      }
    );
  };

  return (
    <div className="flex flex-row justify-between">
      <select
        className={`select-ghost select select-sm border-0 text-lg font-medium ${
          !edit ? "pointer-events-none" : ""
        }`}
        value={(attribute?.value as string) || 0}
        placeholder={edit ? "Edit database..." : ""}
        onChange={(e) => {
          handleEdit(e.target.value);
        }}
      >
        <option value={0} disabled>
          Select a database
        </option>
        {databases.data &&
          databases.data.map((database: ElementWithAtts) => (
            <option key={database.id} value={database.id}>
              {(database.atts.find(
                (attribute: Attribute) => attribute.name === "Title"
              )?.value as string) || "No database title"}
            </option>
          ))}
      </select>
      <button onClick={handleCreate}>
        <PlusIcon className="h-6 w-6 text-neutral" />
      </button>
    </div>
  );
};

export default DatabaseAttribute;
