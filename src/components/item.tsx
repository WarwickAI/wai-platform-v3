import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Attribute, Element, Group, User } from "@prisma/client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import TextElement from "./elements/Text";
import { MD5 } from "crypto-js";
import PageElement from "./elements/Page";
import Permissions from "./permissions";
import Add from "./add";
import Modify from "./modify";
import EventElement from "./elements/Event";
import DatabaseViewElement from "./elements/DatabaseView";

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
  const user = trpc.user.getMe.useQuery();

  const [hovered, setHovered] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showModify, setShowModify] = useState<boolean>(false);
  const [showPermissions, setShowPermissions] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element?.id || 0 });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
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

  const activeAddMove =
    (hovered || showAdd || showModify || showPermissions) && editParent;
  const activePerms =
    (hovered || showAdd || showModify || showPermissions) && edit;

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
        <div
          className="tooltip"
          data-tip={
            "Created by " +
            element?.user.email +
            " at " +
            element?.createdAt.toLocaleString()
          }
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
        </div>
        <Add
          parent={parent}
          index={element?.index || 0}
          open={showAdd}
          setOpen={(v) => {
            setShowAdd(v);
            v && setShowModify(false);
            v && setShowPermissions(false);
          }}
        />
        <Modify
          parent={parent}
          element={element}
          open={showModify}
          setOpen={(v) => {
            setShowModify(v);
            v && setShowAdd(false);
            v && setShowPermissions(false);
          }}
        />
      </div>
      {element ? (
        element.type === "Text" ? (
          <TextElement element={{ ...element, children: [] }} edit={edit} />
        ) : element.type === "Page" ? (
          <PageElement element={{ ...element, children: [] }} edit={edit} />
        ) : element.type === "Event" ? (
          <EventElement element={{ ...element, children: [] }} edit={edit} />
        ) : element.type === "DatabaseView" ? (
          <DatabaseViewElement
            element={{ ...element, children: [] }}
            edit={edit}
          />
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
            setOpen={(v) => {
              setShowPermissions(v);
              v && setShowAdd(false);
              v && setShowModify(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Item;
