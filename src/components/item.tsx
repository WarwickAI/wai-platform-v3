import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars4Icon, PlusIcon } from "@heroicons/react/24/solid";
import {
  Attribute,
  AttributeType,
  Element,
  ElementType,
  Group,
  User,
} from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import TextElement, { TextRequiredAttributes } from "./elements/Text";
import { MD5 } from "crypto-js";
import PageElement, { PageRequiredAttributes } from "./elements/Page";
import Permissions from "./permissions";

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
};

const Item = ({ element, parent, blur }: ItemProps) => {
  const utils = trpc.useContext();
  const createElement = trpc.element.create.useMutation();
  const deleteElement = trpc.element.delete.useMutation();

  const [hovered, setHovered] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element?.id || 0 });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleCreate = (type: ElementType, index: number) => {
    let atts: {
      name: string;
      type: AttributeType;
      value: object | string;
      required: boolean;
    }[] = [];

    if (type === "Text") {
      atts = TextRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    } else if (type === "Page") {
      atts = PageRequiredAttributes.map((a) => {
        return { ...a, required: true };
      });
    }

    createElement.mutate(
      { type, index, atts, parentId: parent?.id },
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-full max-w-md rounded-lg border-2 bg-white p-2 transition-colors ${
        hovered ? "border-slate-300" : "border-white"
      } ${blur ? "opacity-20" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`xs:-left-8 xs:flex-col absolute -left-24 flex flex-row space-x-1 pr-5 text-neutral transition-opacity ${
          hovered ? "opacity-100" : "opacity-0"
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
        <button onClick={() => setShowAdd(!showAdd)}>
          <PlusIcon className="h-6 w-6" />
          <div
            className={`absolute z-10 bg-white transition-opacity ${
              showAdd ? "opacity-100" : "invisible opacity-0"
            }`}
          >
            <button onClick={() => handleCreate("Text", element?.index || 0)}>
              Text
            </button>
            <button onClick={() => handleCreate("Page", element?.index || 0)}>
              Page
            </button>
          </div>
        </button>
        <button onClick={handleDelete}>
          <Bars4Icon className="h-6 w-6" />
        </button>
      </div>
      {element ? (
        element.type === "Text" ? (
          <TextElement element={element} edit={true} />
        ) : element.type === "Page" ? (
          <PageElement element={{ ...element, children: [] }} edit={true} />
        ) : (
          <p>No element found...</p>
        )
      ) : (
        <></>
      )}
      {element && (
        <div
          className={`absolute top-0 right-0 z-10 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Permissions element={element} />
        </div>
      )}
    </div>
  );
};

export default Item;
