import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Attribute, Group } from "@prisma/client";
import { useMemo, useState } from "react";
import { trpc } from "../../utils/trpc";
import { GroupBadge } from "./Group";

type GroupsAttributeProps = {
  attribute: Attribute;
  edit: boolean;
};

const GroupAttribute = ({ attribute, edit }: GroupsAttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string[]) => {
    editAttribute.mutate(
      { id: attribute.id, value: newValue },
      { onSuccess: () => utils.element.getAll.invalidate() }
    );
  };

  return (
    <GroupsEdit
      groupIds={attribute.value as string[]}
      onAdd={(g) => {
        const groups = attribute.value as string[];
        handleEdit([...groups, g.id]);
      }}
      onRemove={(g) => {
        const groups = attribute.value as string[];
        handleEdit(groups.filter((id) => id !== g.id));
      }}
      edit={edit}
    />
  );
};

export default GroupAttribute;

type GroupsEditProps = {
  groupIds: string[];
  onAdd: (group: Group) => void;
  onRemove: (group: Group) => void;
  edit: boolean;
};

export const GroupsEdit = ({
  groupIds,
  onAdd,
  onRemove,
  edit,
}: GroupsEditProps) => {
  const [selected, setSelected] = useState<Group | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const groupsData = trpc.group.getAll.useQuery();

  const groups = useMemo(() => {
    if (!groupsData.data) return [];

    return groupsData.data.filter((group) => {
      return (groupIds as string[]).includes(group.id);
    });
  }, [groupsData.data, groupIds]);

  return (
    <div className="flex flex-row flex-wrap items-end space-x-4">
      {groups.map((g) => (
        <div key={g.id} className="relative">
          <GroupBadge group={g} />
          {edit && (
            <button
              className="absolute top-0 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-700"
              onClick={() => {
                onRemove(g);
              }}
            >
              <TrashIcon className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      ))}
      {edit && (
        <div
          className={`badge truncate text-ellipsis text-white ${
            isSelectOpen ? "p-2" : "p-1"
          }`}
        >
          {isSelectOpen && (
            <select
              className="select-ghost select select-sm w-40 text-xs"
              value={selected?.id || 0}
              onChange={(e) =>
                setSelected(
                  groupsData.data?.find((g) => g.id === e.target.value) || null
                )
              }
            >
              <option value="0" disabled>
                Select a group
              </option>
              {groupsData.data &&
                groupsData.data.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
            </select>
          )}
          <button
            onClick={() => {
              if (isSelectOpen) {
                selected && onAdd(selected);
                setSelected(null);
              } else {
                setIsSelectOpen(true);
              }
            }}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
