import { Popover } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { Element, Group } from "@prisma/client";
import { useMemo } from "react";
import { trpc } from "../utils/trpc";
import { GroupsEdit } from "./attributes/Groups";

type PermissionsProps = {
  element: Element & {
    masterGroups: Group[];
    editGroups: Group[];
    interactGroups: Group[];
    viewGroups: Group[];
  };
  parent?: Element & {
    masterGroups: Group[];
    editGroups: Group[];
    interactGroups: Group[];
    viewGroups: Group[];
  };
};

const Permissions = ({ element, parent }: PermissionsProps) => {
  const utils = trpc.useContext();

  const userData = trpc.user.getMe.useQuery();
  const user = userData.data;

  const modifyPerms = trpc.element.modifyPerms.useMutation({
    onSuccess: () => {
      utils.element.getAll.invalidate();
      utils.element.getPage.invalidate({ route: element.route || "" });
      utils.element.get.invalidate(element.id);
      parent &&
        utils.element.getPage.invalidate({
          route: parent.route,
        });
    },
  });

  // Check if the user has master perms on this element
  const canModifyPerms = useMemo(() => {
    if (!user) return false;

    // Check if user has Admin group
    if (user.groups.findIndex((g) => g.name === "Admin") !== -1) return true;

    return element.masterGroups.some(
      (g) => user.groups.findIndex((ug) => ug.id === g.id) !== -1
    );
  }, [user, element]);

  const handleInheritFromParent = () => {
    if (!parent) return;

    modifyPerms.mutate({
      id: element.id,
      newGroups: parent.masterGroups.map((g) => g.id),
      permsKey: "masterGroups",
    });
    modifyPerms.mutate({
      id: element.id,
      newGroups: parent.editGroups.map((g) => g.id),
      permsKey: "editGroups",
    });
    modifyPerms.mutate({
      id: element.id,
      newGroups: parent.interactGroups.map((g) => g.id),
      permsKey: "interactGroups",
    });
    modifyPerms.mutate({
      id: element.id,
      newGroups: parent.viewGroups.map((g) => g.id),
      permsKey: "viewGroups",
    });
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`rounded-full p-1 transition-colors ${
              open ? "z-10 bg-neutral" : "bg-white"
            }`}
          >
            <LockClosedIcon
              className={`h-5 w-5 ${open ? "text-white" : "text-neutral"}`}
            />
          </Popover.Button>
          <Popover.Panel className="absolute top-8 left-0 z-10 flex flex-col space-y-1 divide-y-2 rounded-md border-2 bg-white p-2 text-center">
            {parent && canModifyPerms && (
              <button
                className="rounded-full bg-primary text-sm text-white"
                onClick={handleInheritFromParent}
              >
                Inherit from parent
              </button>
            )}
            <PermissionSelect
              permissionName="master"
              groups={element.masterGroups}
              element={element}
              parent={parent}
              canModifyPerms={canModifyPerms}
            />
            <PermissionSelect
              permissionName="edit"
              groups={element.editGroups}
              element={element}
              parent={parent}
              canModifyPerms={canModifyPerms}
            />
            <PermissionSelect
              permissionName="interact"
              groups={element.interactGroups}
              element={element}
              parent={parent}
              canModifyPerms={canModifyPerms}
            />
            <PermissionSelect
              permissionName="view"
              groups={element.viewGroups}
              element={element}
              parent={parent}
              canModifyPerms={canModifyPerms}
            />
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default Permissions;

type PermissionSelectProps = {
  permissionName: string;
  groups: Group[];
  element: Element;
  parent?: Element;
  canModifyPerms?: boolean;
};

const PermissionSelect = ({
  permissionName,
  groups,
  element,
  parent,
  canModifyPerms,
}: PermissionSelectProps) => {
  const utils = trpc.useContext();
  const updatePerms = trpc.element.modifyPerms.useMutation();

  const handlePermChange = (groups: Group[]) => {
    const permKey = `${permissionName}Groups`;
    updatePerms.mutate(
      {
        id: element.id,
        newGroups: groups.map((g) => g.id),
        permsKey: permKey as
          | "masterGroups"
          | "editGroups"
          | "interactGroups"
          | "viewGroups",
      },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({ route: element.route || "" });
          utils.element.get.invalidate(element.id);
          parent &&
            utils.element.getPage.invalidate({
              route: parent.route,
            });
        },
      }
    );
  };

  return (
    <GroupsEdit
      groupIds={groups.map((g) => g.id)}
      onChange={handlePermChange}
      edit={!!canModifyPerms}
      name={permissionName.charAt(0).toUpperCase() + permissionName.slice(1)}
    />
  );
};
