import { Attribute } from "@prisma/client";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { trpc } from "../../utils/trpc";

type TextAttributeProps = {
  attribute: Attribute;
  isTitle?: boolean;
};

const TextAttribute = ({ attribute, isTitle }: TextAttributeProps) => {
  const [value, setValue] = useState<string>("");

  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    setValue(attribute.value as string);
  }, [attribute.value]);

  const debounced = useDebouncedCallback((v: string) => {
    handleEdit(v);
  }, 1000);

  const utils = trpc.useContext();

  const edit = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string) => {
    edit.mutate(
      { id: attribute.id, value: newValue },
      { onSuccess: () => utils.element.getAll.invalidate() }
    );
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <input
          className={`input w-full ${
            isTitle ? "input-lg text-4xl font-extrabold" : ""
          }`}
          value={value as string}
          onChange={(e) => {
            debounced(e.target.value);
            setValue(e.target.value);
          }}
        />
      ) : (
        <p
          className={`input w-full ${
            isTitle ? "input-lg p-4 text-4xl font-extrabold" : ""
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
};

export default TextAttribute;
