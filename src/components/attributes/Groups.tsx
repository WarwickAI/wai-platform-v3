import { Combobox } from "@headlessui/react";
import { TrashIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { Group } from "@prisma/client";
import { useMemo, useState } from "react";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import { GroupBadge } from "./Group";
import { AttributeProps } from "./utils";

export const GroupsAttibuteIcon = UserGroupIcon;

export const GroupsAttributeSchema = z.array(z.string()).default([]);

const GroupsAttribute = ({ attribute, edit }: AttributeProps) => {
  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newValue: string[]) => {
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
    <GroupsEdit
      groupIds={attribute.value as string[]}
      onChange={(v) => handleEdit(v.map((g) => g.id))}
      edit={edit}
    />
  );
};

export default GroupsAttribute;

type GroupsEditProps = {
  groupIds: string[];
  onChange: (v: Group[]) => void;
  edit: boolean;
  name?: string;
};

export const GroupsEdit = ({
  groupIds,
  onChange,
  edit,
  name,
}: GroupsEditProps) => {
  const [query, setQuery] = useState("");

  const groupsData = trpc.group.getAll.useQuery();

  const groups = useMemo(() => groupsData.data || [], [groupsData.data]);

  const groupsSelected = useMemo(() => {
    return groups.filter((group) => {
      return (groupIds as string[]).includes(group.id);
    });
  }, [groups, groupIds]);

  const filteredGroups = useMemo(() => {
    if (query === "") return groups;

    return groups.filter((group) =>
      group.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [groups, query]);

  return (
    // Shove in a div to stop divider lines from appearing
    <div className="block">
      <Combobox value={groupsSelected} onChange={onChange} multiple>
        {groupsSelected.length > 0 &&
          groupsSelected.map((g) => (
            <GroupBadge key={g.id} group={g}>
              {edit && (
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  onClick={() => {
                    onChange(
                      groupsSelected.filter((group) => group.id !== g.id)
                    );
                  }}
                >
                  <TrashIcon className="h-4 w-4 text-white" />
                </button>
              )}
            </GroupBadge>
          ))}
        <div className="relative w-full">
          <div className="flex w-full flex-row space-x-2">
            <p className="text-base">{name}</p>
            {edit && (
              <Combobox.Input
                className="input input-sm"
                onChange={(event) => setQuery(event.target.value)}
              />
            )}
          </div>
          {edit && (
            <Combobox.Options className="absolute right-0 z-10 flex w-full flex-col space-y-0 rounded-md border-2 bg-white p-2">
              {filteredGroups.map((g) => (
                <Combobox.Option key={g.id} value={g}>
                  <GroupBadge group={g}>
                    {groupsSelected.includes(g) && (
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        onClick={() => {
                          onChange(
                            groupsSelected.filter((group) => group.id !== g.id)
                          );
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </GroupBadge>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
};
