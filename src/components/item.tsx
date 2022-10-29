import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars4Icon } from "@heroicons/react/24/solid";
import { Attribute, Element, Group, User } from "@prisma/client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import TextElement from "./elements/Text";
import { MD5 } from "crypto-js";
import PageElement from "./elements/Page";
import Permissions from "./permissions";
import Add from "./add";

type ItemProps = {
  element?: Element & {
    user: User;
    atts: Attribute[];
    masterGroups: Group[];
    editGroups: Group[];
    interactGroups: Group[];
    viewGroups: Group[];
  };
  parent?: Element;
  blur?: boolean;
  editParent: boolean;
};

const Item = ({ element, parent, blur, editParent }: ItemProps) => {
  const utils = trpc.useContext();

  const user = trpc.user.getMe.useQuery();

  const deleteElement = trpc.element.delete.useMutation();

  const [hovered, setHovered] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showPermissions, setShowPermissions] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element?.id || 0 });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (!element) return;

    deleteElement.mutate(
      { id: element.id },
      {
        onSuccess: () => {
          utils.element.getAll.invalidate();
          utils.element.getPage.invalidate({
            route: parent?.route || parent?.id || "",
          });
        },
      }
    );
  };

  const edit = useMemo(() => {
    if (!element || !user.data) return false;

    // Check it the user is an admin
    for (const userGroup of user.data.groups) {
      if (userGroup.name === "Admin") return true;
    }

    for (const elGroup of element.editGroups) {
      for (const userGroup of user.data.groups) {
        if (elGroup.id === userGroup.id) return true;
      }
    }
    return false;
  }, [element, user.data]);

  const activeAddMove = (hovered || showAdd || showPermissions) && editParent;
  const activePerms = (hovered || showAdd || showPermissions) && edit;

  // Fixes issue where after removing permission, showPermissions stays true
  if (showPermissions && !edit) {
    setShowPermissions(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-full max-w-md rounded-lg border-2 bg-white p-2 transition-colors ${
        activeAddMove ? "border-slate-300" : "border-white"
      } ${blur ? "opacity-20" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`xs:-left-8 xs:flex-col absolute -left-24 flex flex-row space-x-1 pr-5 text-neutral transition-opacity ${
          activeAddMove ? "opacity-100" : "opacity-0"
        }`}
        {...listeners}
        {...attributes}
      >
        <Image
          alt={element?.user.email + "profile picture"}
          width={24}
          height={24}
          className={"rounded-full"}
          src={
            "https://www.gravatar.com/avatar/" +
            MD5(element?.user.email || "") +
            "?s=24"
          }
        />
        <Add
          parent={parent}
          index={element?.index || 0}
          open={showAdd}
          setOpen={setShowAdd}
        />
        <button onClick={handleDelete}>
          <Bars4Icon className="h-6 w-6" />
        </button>
      </div>
      {element ? (
        element.type === "Text" ? (
          <TextElement element={element} edit={edit} />
        ) : element.type === "Page" ? (
          <PageElement element={{ ...element, children: [] }} />
        ) : (
          <p>No element found...</p>
        )
      ) : (
        <></>
      )}
      {element && (
        <div
          className={`absolute top-0 right-1 z-10 transition-opacity ${
            activePerms ? "opacity-100" : "opacity-0"
          }`}
        >
          <Permissions
            element={element}
            open={showPermissions}
            setOpen={setShowPermissions}
          />
        </div>
      )}
    </div>
  );
};

export default Item;
