import { ElementType } from "@prisma/client";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const ElementTypeAttributeSchema = z.nativeEnum(ElementType).default("Event");

const ElementTypeAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: ElementType) => {
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

  if (!edit) {
    return <p>{attribute.value as ElementType}</p>;
  } else {
    return (
      <select
        className="input-ghost input w-full border-0"
        value={attribute.value as ElementType}
        onChange={(e) => handleEdit(e.target.value as ElementType)}
      >
        {Object.values(ElementType).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    );
  }
};

export default ElementTypeAttribute;
