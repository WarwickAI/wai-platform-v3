import { Bars2Icon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const TextAttibuteIcon = Bars2Icon;

type TextAttributeProps = AttributeProps & {
  size: "sm" | "md" | "lg" | "xl";
  placeholder?: string;
};

const TextAttribute = ({
  attribute,
  size,
  edit,
  placeholder,
}: TextAttributeProps) => {
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
            ? "input-lg text-4xl font-extrabold"
            : size === "lg"
            ? "input-md text-2xl font-bold"
            : size === "md"
            ? "input-sm text-lg font-medium"
            : size === "sm"
            ? "input-xs text-sm font-normal"
            : ""
        } ${!edit ? "pointer-events-none" : ""}`}
        value={value as string}
        placeholder={edit && placeholder ? placeholder : ""}
        onChange={(e) => {
          setValue(e.target.value);
          debounced(e.target.value);
        }}
      />
    </div>
  );
};

export default TextAttribute;
