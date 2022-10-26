import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars4Icon, PlusIcon } from "@heroicons/react/24/solid";
import { Attribute, AttributeType, Element, User } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import TextElement from "./elements/Text";
import { MD5 } from "crypto-js";

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

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element?.id || 0 });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleCreate = () => {
    const atts: {
      name: string;
      type: AttributeType;
      value: object | string;
      required: boolean;
    }[] = [
      {
        name: "Markdown",
        type: "Markdown",
        value: "**Some Test Markdown**",
        required: true,
      },
    ];

    createElement.mutate(
      { type: "Text", index: 0, atts, parentId: parent?.id },
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
        className={`absolute -left-24 flex flex-row space-x-1 pr-5 text-neutral transition-opacity ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
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
        <button onClick={handleCreate}>
          <PlusIcon className="h-6 w-6" />
        </button>
        <button {...listeners} {...attributes} onClick={handleDelete}>
          <Bars4Icon className="h-6 w-6" />
        </button>
      </div>
      {element ? (
        element.type === "Text" ? (
          <TextElement element={element} />
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
