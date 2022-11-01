import { AttributeType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { DatabaseRequiredAttributes } from "../elements/Database";
import { AttributeProps } from "./utils";

const DatabaseAttribute = ({ attribute, edit }: AttributeProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(attribute.value as string);
  }, [attribute.value]);

  const debounced = useDebouncedCallback((v: string) => {
    handleEdit(v);
  }, 1000);

  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string) => {
    editAttribute.mutate(
      { id: attribute.id, value: newValue },
      { onSuccess: () => utils.element.getAll.invalidate() }
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
      value: string | string[];
      required: boolean;
    }[] = [];

    atts = DatabaseRequiredAttributes.map((a) => {
      return { ...a, required: true };
    });

    createElement.mutate(
      { type: "Database", index: 0, atts },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.queryAll.invalidate({ type: "Database" });
          utils.element.get.invalidate(data.id);
        },
      }
    );
  };

  return (
    <div>
      <select
        className={`select-ghost select select-sm w-full border-0 text-lg font-medium ${
          !edit ? "pointer-events-none" : ""
        }`}
        value={value as string}
        placeholder={edit ? "Edit database..." : ""}
        onChange={(e) => {
          setValue(e.target.value);
          debounced(e.target.value);
        }}
      >
        <option value={0} disabled>
          Select a database
        </option>
        {databases.data &&
          databases.data.map((database) => (
            <option key={database.id} value={database.id}>
              {(database.atts.find((attribute) => attribute.name === "Title")
                ?.value as string) || "No database title"}
            </option>
          ))}
      </select>
      <button onClick={handleCreate}>Create Database</button>
    </div>
  );
};

export default DatabaseAttribute;
