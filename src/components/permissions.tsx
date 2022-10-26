import { LockClosedIcon } from "@heroicons/react/24/solid";
import { Element, Group } from "@prisma/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";

type PermissionsProps = {
  element: Element & {
    masterGroups: Group[];
    editGroups: Group[];
    interactGroups: Group[];
    viewGroups: Group[];
  };
};

const Permissions = ({ element }: PermissionsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <button className="btn-xs btn" onClick={() => setOpen(!open)}>
        <LockClosedIcon className="h-4 w-4 text-white" />
      </button>
      <div className={`absolute ${open ? "visible" : "invisible"}`}>
        <PermissionSelect
          permissionName="master"
          groups={element.masterGroups}
          element={element}
        />
        <PermissionSelect
          permissionName="edit"
          groups={element.editGroups}
          element={element}
        />
        <PermissionSelect
          permissionName="interact"
          groups={element.interactGroups}
          element={element}
        />
        <PermissionSelect
          permissionName="view"
          groups={element.viewGroups}
          element={element}
        />
      </div>
    </div>
  );
};

export default Permissions;

type PermissionSelectProps = {
  permissionName: string;
  groups: Group[];
  element: Element;
};

const PermissionSelect = ({
  permissionName,
  groups,
  element,
}: PermissionSelectProps) => {
  const [selected, setSelected] = useState<Group | null>(null);

  const utils = trpc.useContext();
  const allGroups = trpc.group.getAll.useQuery();
  const updatePerms = trpc.element.addPerms.useMutation();
  const removePerms = trpc.element.removePerms.useMutation();

  const handlePermChange = (group: Group) => {
    const permKey = `${permissionName}Groups`;
    updatePerms.mutate(
      { id: element.id, [permKey]: [group.id] },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({ route: element.parentId || "" });
        },
      }
    );
  };

  const handlePermRemove = (group: Group) => {
    const permKey = `${permissionName}Groups`;
    removePerms.mutate(
      { id: element.id, [permKey]: [group.id] },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({ route: element.parentId || "" });
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-row items-center">
        <label className="input-group">
          <span>{permissionName}</span>
          <select
            className="select-bordered select select-sm"
            name={permissionName}
            id={permissionName}
            value={selected?.id || 0}
            onChange={(e) =>
              setSelected(
                allGroups.data?.find((g) => g.id === e.target.value) || null
              )
            }
          >
            <option value="0">Select a group to add</option>
            {allGroups.data &&
              allGroups.data.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
          </select>
        </label>
        <button
          className="btn-sm btn"
          onClick={() => {
            if (selected) {
              handlePermChange(selected);
            }
          }}
        >
          Add
        </button>
      </div>
      <div className="flex flex-row flex-wrap">
        {groups.map((g) => (
          <div key={g.id} className="flex flex-row items-center">
            <span>{g.name}</span>
            <button className="btn-sm btn" onClick={() => handlePermRemove(g)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
