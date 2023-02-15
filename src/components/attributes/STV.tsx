import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { ElementType } from "@prisma/client";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import elements from "../elements";
import { ElementWithAttsGroupsChildren } from "../elements/utils";
import { getValidElementTypes } from "../utils";
import { ColumnAttributeSchema } from "./Columns";
import DatabaseAttribute from "./Database";
import { AttributeProps } from "./utils";

export const STVAttributeSchema = z.array(z.string()).default([]);

type STVProps = AttributeProps & {
  database?: ElementWithAttsGroupsChildren;
};

export const STVAttribute = ({ attribute, edit, database }: STVProps) => {
  const order = STVAttributeSchema.parse(attribute.value);

  const utils = trpc.useContext();
  const editAttribute = trpc.attribute.editValue.useMutation();

  if (!database) return <div>Should provide database for ref</div>;

  const databaseColumnsAttribute = database.atts.find(
    (att) => att.name === "Columns"
  );

  if (!databaseColumnsAttribute)
    return <div>Database has no columns, cannot infer element type</div>;

  const databaseColumns = ColumnAttributeSchema.parse(
    databaseColumnsAttribute.value
  );

  const compatibleElements = getValidElementTypes(databaseColumns);

  if (compatibleElements.length === 0)
    return <div>Database has no compatible elements</div>;

  const Element = elements[compatibleElements[0] as ElementType]?.element;

  const handleValueUpdate = (newValue: string[]) => {
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

  const handleMoveUp = (id: string) => {
    const curValue = order;

    const index = curValue.findIndex((q) => q === id);

    // If the index is -1, add it to the end
    if (index === -1) {
      handleValueUpdate([...curValue, id]);
      return;
    }

    if (index === 0 || curValue.length < 2) return;

    const newValue = [...curValue];
    newValue[index] = newValue[index - 1]!;
    newValue[index - 1] = curValue[index]!;

    handleValueUpdate(newValue);
  };

  const handleMoveDown = (id: string) => {
    const curValue = attribute.value as string[];

    const index = curValue.findIndex((q) => q === id);

    // If the index is -1, add it to the end
    if (index === -1) {
      handleValueUpdate([...curValue, id]);
      return;
    }

    if (index === curValue.length - 1 || curValue.length < 2) return;

    const newValue = [...curValue];
    newValue[index] = newValue[index + 1]!;
    newValue[index + 1] = curValue[index]!;

    handleValueUpdate(newValue);
  };

  return (
    <div className="flex flex-col">
      {database.children
        .sort(
          (a, b) =>
            (order.findIndex((c) => c === a.id) + 1 || 10000) -
            (order.findIndex((c) => c === b.id) + 1 || 10000)
        )
        .map((child) => {
          return (
            <div key={child.id} className="flex flex-row space-x-1">
              <p>
                {order.findIndex((c) => c === child.id) + 1 || "not sorted"}
              </p>
              {Element && (
                <Element element={{ ...child, children: [] }} edit={edit} />
              )}
              <button onClick={() => handleMoveUp(child.id)}>
                <ChevronUpIcon className="h-6 w-6" />
              </button>
              <button onClick={() => handleMoveDown(child.id)}>
                <ChevronDownIcon className="h-6 w-6" />
              </button>
              <button onClick={() => {}}>
                <TrashIcon className="h-6 w-6 text-warning" />
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default STVAttribute;
