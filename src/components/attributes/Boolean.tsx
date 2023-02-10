import { Switch } from "@headlessui/react";
import { Bars2Icon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const BooleanAttibuteIcon = Bars2Icon;

export const BooleanAttributeSchema = z.boolean().default(false);

const BooleanAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: boolean) => {
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
      <Switch
        checked={attribute.value as boolean}
        onChange={(v: boolean) => edit && handleEdit(v)}
        className={`${
          attribute.value ? "bg-green-600" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={`${
            attribute.value ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white`}
        />
      </Switch>
    </div>
  );
};

export default BooleanAttribute;
