import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars4Icon, PlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import {
  Attribute,
  AttributeType,
  Element,
  ElementType,
  User,
} from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import TextElement, { TextRequiredAttributes } from "./elements/Text";
import { MD5 } from "crypto-js";
import PageElement, { PageRequiredAttributes } from "./elements/Page";

type ItemProps = {
  element?: Element & {
    user: User;
    atts: Attribute[];
  };
  parent?: Element;
};

const Item = ({ element, parent }: ItemProps) => {
  const utils = trpc.useContext();
  const createElement = trpc.element.create.useMutation();
  const deleteElement = trpc.element.delete.useMutation();

  const [hovered, setHovered] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
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
      className={`relative w-full max-w-md rounded-lg border-2 p-2 transition-colors ${
        hovered ? "border-slate-300" : "border-white"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`xs:-left-8 xs:flex-col absolute -left-32 flex flex-row space-x-1 pr-5 text-neutral transition-opacity ${
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
        <button onClick={() => setIsEdit(!isEdit)}>
          <PencilIcon
            className={`h-6 w-6 ${isEdit ? "rounded-md bg-slate-300" : ""}`}
          />
        </button>
      </div>
      {element ? (
        element.type === "Text" ? (
          <TextElement element={element} edit={isEdit} />
        ) : element.type === "Page" ? (
          <PageElement element={{ ...element, children: [] }} edit={isEdit} />
        ) : (
          <p>No element found...</p>
        )
      ) : (
        <></>
      )}
    </div>
  );
};

export default Item;
