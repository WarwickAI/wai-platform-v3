import { ViewColumnsIcon } from "@heroicons/react/24/solid";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const DatabaseViewTypeIcon = ViewColumnsIcon;

const DatabaseViewTypeAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation({
    onSuccess: (data) => {
      utils.element.getAll.invalidate();
      utils.element.get.invalidate(data.elementId);
      utils.element.queryAll.invalidate({ type: data.element.type });
      data.element.parent &&
        utils.element.getPage.invalidate({
          route: data.element.parent.route,
        });
    },
  });

  return (
    <div className="flex flex-row justify-between">
      <select
        className={`select-ghost select select-sm border-0 text-lg font-medium ${
          !edit ? "pointer-events-none" : ""
        }`}
        value={(attribute?.value as string) || 0}
        placeholder={edit ? "Edit view type..." : ""}
        onChange={(e) => {
          editAttribute.mutate({
            id: attribute?.id || "",
            value: e.target.value,
          });
        }}
      >
        <option value={0} disabled>
          Select a view type
        </option>
        <option value="table">Table</option>
        <option value="events">Events</option>
        <option value="pages">Pages</option>
      </select>
    </div>
  );
};

export default DatabaseViewTypeAttribute;
