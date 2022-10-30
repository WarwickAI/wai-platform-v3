import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

type TextAttributeProps = AttributeProps & {
  size: "sm" | "md" | "lg" | "xl";
};

const TextAttribute = ({ attribute, size, edit }: TextAttributeProps) => {
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
        onChange={(e) => {
          setValue(e.target.value);
          debounced(e.target.value);
        }}
      />
    </div>
  );
};

export default TextAttribute;
