import { Bars2Icon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const NumberAttibuteIcon = Bars2Icon;

type NumberAttributeProps = AttributeProps & {
  size?: "sm" | "md" | "lg" | "xl";
  placeholder?: string;
};

const NumberAttribute = ({
  attribute,
  size,
  edit,
  placeholder,
}: NumberAttributeProps) => {
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
      <input
        className={`input-ghost input w-full border-0 ${
          size === "xl"
            ? "number-4xl input-lg font-extrabold"
            : size === "lg"
            ? "number-2xl input-md font-bold"
            : size === "md"
            ? "number-lg input-sm font-medium"
            : size === "sm"
            ? "number-sm input-xs font-normal"
            : ""
        } ${!edit ? "pointer-events-none" : ""} p-0`}
        value={value as string}
        placeholder={
          edit && placeholder ? placeholder : edit ? "Edit number..." : ""
        }
        type="text"
        onChange={async (e) => {
          // Check if last character is one of [. , 0]
          if (
            [".", ","].includes(
              e.target.value.charAt(e.target.value.length - 1)
            ) ||
            ((e.target.value.includes(".") || e.target.value.includes(",")) &&
              e.target.value.charAt(e.target.value.length - 1) === "0")
          ) {
            setValue(e.target.value);
          } else {
            // Remove commas
            e.target.value = e.target.value.replace(/,/g, "");
            setValue(parseFloat(e.target.value) + "");
            debounced.cancel();
            debounced(parseFloat(e.target.value) + "");
          }
        }}
      />
    </div>
  );
};

export default NumberAttribute;
