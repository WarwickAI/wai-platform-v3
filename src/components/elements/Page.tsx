import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Item from "../item";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Attribute, AttributeType, Element, Group, User } from "@prisma/client";
import TextAttribute from "../attributes/Text";
import { trpc } from "../../utils/trpc";
import Link from "next/link";

export const PageRequiredAttributes: {
  name: string;
  type: AttributeType;
  value: object | string;
}[] = [{ name: "Title", type: "Text", value: "Page Title" }];

type PageElementProps = {
  element: Element & {
    user: User;
    atts: Attribute[];
    children: (Element & {
      user: User;
      atts: Attribute[];
      masterGroups: Group[];
      editGroups: Group[];
      interactGroups: Group[];
      viewGroups: Group[];
    })[];
    masterGroups: Group[];
    editGroups: Group[];
    interactGroups: Group[];
    viewGroups: Group[];
  };
  page?: boolean;
};

const PageElement = ({ element, page }: PageElementProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<
    (Element & {
      user: User;
      atts: Attribute[];
      masterGroups: Group[];
      editGroups: Group[];
      interactGroups: Group[];
      viewGroups: Group[];
    })[]
  >([]);
  useEffect(() => {
    setItems(element.children.sort((a, b) => a.index - b.index));
  }, [element.children]);

  const user = trpc.user.getMe.useQuery();

  const orderElements = trpc.element.order.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const titleAttribute = element.atts.find((a) => a.name === "Title");

  const edit = useMemo(() => {
    if (!element || !user.data) return false;

    for (const elGroup of element.editGroups) {
      for (const userGroup of user.data.groups) {
        if (elGroup.id === userGroup.id) return true;
      }
    }
    return false;
  }, [element, user]);

  if (!page) {
    return (
      <Link href={"/" + (element.route || element.id)}>
        {titleAttribute?.value as string}
      </Link>
    );
  } else {
    return (
      <>
        <Head>
          <title>Create T3 App</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="container mx-auto flex min-h-screen max-w-2xl flex-col p-8">
          <div className="flex flex-row space-x-2">
            {titleAttribute && (
              <TextAttribute attribute={titleAttribute} isTitle edit={edit} />
            )}
          </div>

          <div className="flex w-full flex-col space-y-2 pt-6 text-2xl">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.length > 0
                  ? items.map((child) => (
                      <Item
                        key={child.id}
                        element={child}
                        parent={element}
                        editParent={edit}
                      />
                    ))
                  : edit && <Item parent={element} editParent={edit} />}
                <DragOverlay>
                  {activeId ? (
                    <Item
                      element={items.find((i) => i.id === activeId)}
                      parent={element}
                      editParent={edit}
                    />
                  ) : null}
                </DragOverlay>
              </SortableContext>
            </DndContext>
          </div>
        </main>
      </>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItemsArray = arrayMove(items, oldIndex, newIndex);

      orderElements.mutate(
        newItemsArray.map((item, index) => {
          return { id: item.id, index: index + 1 };
        })
      );

      return newItemsArray;
    });
  }
};

export default PageElement;
