import { Popover } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { AttributeType } from "@prisma/client";
import React, { SVGProps, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { DatabaseAttibuteIcon } from "./Database";
import { DateAttibuteIcon } from "./Date";
import { MarkdownAttributeIcon } from "./Markdown";
import { TextAttibuteIcon } from "./Text";
import { UsersAttibuteIcon } from "./Users";
import { DBColumnType } from "./utils";

type ColumnHeaderProps = {
  column: DBColumnType;
  edit: boolean;
  editColumn: (oldName: string, newValue: DBColumnType) => void;
  deleteColumn: (name: string) => void;
};

export const ColumnHeader = ({
  column,
  edit,
  editColumn,
  deleteColumn,
}: ColumnHeaderProps) => {
  let Icon:
    | ((
        props: SVGProps<SVGSVGElement> & {
          title?: string | undefined;
          titleId?: string | undefined;
        }
      ) => JSX.Element)
    | null = null;

  switch (column.type) {
    case "Database":
      Icon = DatabaseAttibuteIcon;
      break;
    case "Date":
      Icon = DateAttibuteIcon;
      break;
    // case "Group":
    //   icon = GroupAttibuteIcon;
    //   break;
    // case "Groups":
    //   icon = GroupsAttibuteIcon;
    //   break;
    case "Markdown":
      Icon = MarkdownAttributeIcon;
      break;
    case "Text":
      Icon = TextAttibuteIcon;
      break;
    case "Users":
      Icon = UsersAttibuteIcon;
  }

  const [name, setName] = useState(column.name);
  const [value, setValue] = useState(column.value);
  const [required, setRequired] = useState(column.required);

  const debounced = useDebouncedCallback(
    (newAttribute: DBColumnType) => editColumn(column.name, newAttribute),
    1000
  );

  useEffect(() => {
    setName(column.name);
    setValue(column.value);
    setRequired(column.required);
  }, [column]);

  const columnTypes: {
    name: AttributeType;
    icon: (
      props: SVGProps<SVGSVGElement> & {
        title?: string | undefined;
        titleId?: string | undefined;
      }
    ) => JSX.Element;
  }[] = [
    {
      name: "Text",
      icon: TextAttibuteIcon,
    },
    {
      name: "Markdown",
      icon: MarkdownAttributeIcon,
    },
    {
      name: "Date",
      icon: DateAttibuteIcon,
    },
    {
      name: "Users",
      icon: UsersAttibuteIcon,
    },
  ];

  return (
    <>
      <Popover className="relative flex flex-row items-center space-x-2">
        {({ open }) => (
          <>
            <Popover.Button
              className={`flex flex-row items-center space-x-2 rounded-full p-2 font-semibold hover:bg-slate-200 ${
                open ? "outline-2" : "outline-none"
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-6 w-6 ${open ? "text-white" : "text-neutral"}`}
                />
              )}
            </Popover.Button>
            <input
              className="input-ghost input input-sm"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                debounced({
                  name: e.target.value,
                  type: column.type,
                  value,
                  required,
                });
              }}
            />
            <Popover.Panel
              className={`absolute top-10 z-10 left-0 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
                open ? "opacity-100" : "invisible opacity-0"
              }`}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2 rounded-md p-2">
                  {columnTypes.map((col) => (
                    <div key={col.name} className="tooltip" data-tip={col.name}>
                      <button
                        className={`rounded-full p-1 transition-colors ${
                          column.type === col.name ? "bg-neutral" : "bg-white"
                        }`}
                        onClick={() => {
                          editColumn(column.name, {
                            name: column.name,
                            type: col.name,
                            value,
                            required,
                          });
                        }}
                      >
                        <col.icon
                          className={`h-6 w-6 ${
                            column.type === col.name
                              ? "text-white"
                              : "text-neutral"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => deleteColumn(column.name)}
                  className="flex flex-row items-center space-x-2 rounded-md p-2 hover:bg-slate-100"
                >
                  <div>
                    <TrashIcon className="h-6 w-6 text-neutral" />
                  </div>

                  <div className="text-start">
                    <p className="text-sm font-bold">Delete</p>
                    <p className="text-xs">Remove this attribute</p>
                  </div>
                </button>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </>
  );
};
