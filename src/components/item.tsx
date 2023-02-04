import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Element } from "@prisma/client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import { MD5 } from "crypto-js";
import Permissions from "./permissions";
import Add from "./add";
import Modify from "./modify";
import Elements from "./elements";
import { ElementWithAttsGroups } from "./elements/utils";

type ItemProps = {
  element?: ElementWithAttsGroups;
  parent?: Element;
  blur?: boolean;
  editParent: boolean;
};

const Item = ({ element, parent, blur, editParent }: ItemProps) => {
  const userData = trpc.user.getMe.useQuery();
  const user = userData.data;

  const [hovered, setHovered] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element?.id || 0 });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const edit = useMemo(() => {
    if (!element || !user) return false;

    // Check it the user is an admin
    if (user.groups.find((g) => g.name === "Admin")) return true;

    return user.groups.some((g) =>
      element.editGroups.find((eg) => eg.id === g.id)
    );
  }, [element, user]);

  // Should the element be shown as hovered
  const showHovered = hovered && editParent;
  const showPerms = hovered && edit;

  // Extract the element from the elements list
  const Element = element && Elements[element.type]?.element;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative max-w-4xl rounded-lg border-2 bg-white p-2 transition-colors ${
        showHovered ? "border-slate-300" : "border-white"
      } ${blur ? "opacity-20" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`xs:-left-8 xs:flex-col absolute -left-24 flex flex-row space-x-1 pr-5 text-neutral transition-opacity ${
          showHovered ? "opacity-100" : "opacity-0"
        }`}
        {...listeners}
        {...attributes}
      >
        {element && (
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
        )}
        <Add parent={parent} index={element?.index || 0} />
        <Modify parent={parent} element={element} />
      </div>
      {element ? (
        Element ? (
          <Element element={{ ...element, children: [] }} edit={edit} />
        ) : (
          <p>No element found...</p>
        )
      ) : (
        <></>
      )}
      {element && (
        <div
          className={`absolute top-0 right-1 z-10 transition-opacity ${
            showPerms ? "opacity-100" : "opacity-0"
          }`}
        >
          <Permissions element={element} parent={parent} />
        </div>
      )}
    </div>
  );
};

export default Item;
