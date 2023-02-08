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
import TextAttribute from "../attributes/Text";
import { trpc } from "../../utils/trpc";
import Link from "next/link";
import {
  ElementProps,
  ElementWithAttsGroups,
  ElementAttributeDescription,
} from "./utils";
import Add from "../add";
import Permissions from "../permissions";
import { env } from "../../env/client.mjs";
import ImageAttribute from "../attributes/Image";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";

export const PageRequiredAttributes: ElementAttributeDescription[] = [
  { name: "Title", type: "Text" },
  { name: "Icon", type: "Image", optional: true },
  { name: "Cover", type: "Image", optional: true },
];

const PageElement = ({ element, page }: ElementProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<ElementWithAttsGroups[]>([]);
  useEffect(() => {
    setItems(element.children.sort((a, b) => a.index - b.index));
  }, [element.children]);

  const user = trpc.user.getMe.useQuery();
  const utils = trpc.useContext();

  const router = useRouter();

  const orderElements = trpc.element.order.useMutation();
  const editRoute = trpc.element.editRoute.useMutation({
    onSuccess: (data) => {
      utils.element.getAll.invalidate();
      utils.element.get.invalidate(data.id);
      utils.element.queryAll.invalidate({ type: data.type });
      data.parent &&
        utils.element.getPage.invalidate({
          route: data.parent.route,
        });

      // Redirect the user to the new route
      // If the new route is still a uuid4, redirect to the page
      if (
        data.route.match(
          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
        )
      ) {
        const newRoute =
          "/" +
          generateUUIDRoute(
            data.route,
            titleAttribute ? (titleAttribute.value as string) : undefined
          );
        router.push(newRoute);
      } else {
        router.push("/" + data.route);
      }
    },
  });

  const [routeValue, setRouteValue] = useState<string>("");

  useEffect(() => {
    setRouteValue(element.route);
  }, [element.route]);

  const debounced = useDebouncedCallback((v: string) => {
    editRoute.mutate({
      id: element.id,
      route: v,
    });
  }, 1000);

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
  // const iconAttribute = element.atts.find((a) => a.name === "Icon");
  // const { data: iconFile } = trpc.file.get.useQuery(
  //   { id: (iconAttribute?.value as string) || "" },
  //   {
  //     enabled: !!iconAttribute?.value,
  //   }
  // );
  const coverAttribute = element.atts.find((a) => a.name === "Cover");
  const { data: coverFile } = trpc.file.get.useQuery(
    { id: (coverAttribute?.value as string) || "" },
    {
      enabled: !!coverAttribute?.value,
    }
  );

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
  }, [element, user]);

  const permsEdit = useMemo(() => {
    if (!element || !user.data) return false;

    // Check it the user is an admin
    for (const userGroup of user.data.groups) {
      if (userGroup.name === "Admin") return true;
    }

    for (const elGroup of element.masterGroups) {
      for (const userGroup of user.data.groups) {
        if (elGroup.id === userGroup.id) return true;
      }
    }
    return false;
  }, [element, user]);

  if (!page) {
    // This is the render for a page element on another page
    return (
      <Link
        href={
          "/" +
          generateUUIDRoute(
            element.route,
            titleAttribute ? (titleAttribute.value as string) : undefined
          )
        }
      >
        <p className="inline-flex rounded-xl bg-green-800 py-2 px-4 text-xl font-bold text-white hover:cursor-pointer">
          {titleAttribute?.value as string}
        </p>
      </Link>
    );
  } else {
    return (
      <>
        <Head>
          <title>
            {titleAttribute ? (titleAttribute.value as string) : "Warwick AI"}
          </title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen w-full">
          {coverFile && (
            <div
              className="sticky top-0 -z-10 h-60 w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) ), url(https://${env.NEXT_PUBLIC_CDN_URL}/${coverFile.uuid})`,
              }}
            />
          )}
          <div className="w-full bg-white bg-opacity-90">
            <div className="mx-auto flex max-w-4xl flex-col p-4">
              <div className="flex flex-row space-x-2">
                {coverAttribute && edit && (
                  <ImageAttribute attribute={coverAttribute} edit={edit} />
                )}
                {edit && (
                  <input
                    value={routeValue}
                    onChange={(e) => {
                      setRouteValue(e.target.value);
                      debounced(e.target.value);
                    }}
                  />
                )}
              </div>
              <div className="flex flex-row space-x-2">
                {titleAttribute && (
                  <TextAttribute
                    attribute={titleAttribute}
                    size="xl"
                    edit={edit}
                    placeholder="Edit page title..."
                  />
                )}
                {element && (
                  <div
                    className={`absolute top-2 right-2 z-10 transition-opacity ${
                      permsEdit ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Permissions element={element} />
                  </div>
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
                      : edit && <Add index={0} parent={element} />}
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
            </div>
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

const generateUUIDRoute = (uuid: string, title?: string) => {
  return (
    (title ? title.replaceAll("-", "_").replaceAll(" ", "_") : "No_Title") +
    "-" +
    uuid
  );
};
