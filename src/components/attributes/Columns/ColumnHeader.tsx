import { useEffect, useState } from "react";
import { ColumnSchema } from ".";
import { useDebouncedCallback } from "use-debounce";
import attributes from "..";
import { Popover } from "@headlessui/react";
import { AttributeType } from "@prisma/client";
import { TrashIcon } from "@heroicons/react/24/solid";
import { z } from "zod";

type ColumnHeaderProps = {
  column: z.infer<typeof ColumnSchema>;
  edit: boolean;
  editColumn: (oldName: string, newValue: z.infer<typeof ColumnSchema>) => void;
  deleteColumn: (name: string) => void;
};

export const ColumnHeader = ({
  column,
  edit,
  editColumn,
  deleteColumn,
}: ColumnHeaderProps) => {
  const [name, setName] = useState(column.name);
  const [value, setValue] = useState(column.value);

  const debounced = useDebouncedCallback(
    (newAttribute: z.infer<typeof ColumnSchema>) =>
      editColumn(column.name, newAttribute),
    1000
  );

  useEffect(() => {
    setName(column.name);
    setValue(column.value);
  }, [column]);

  const CurIcon = attributes[column.type]?.icon;

  return (
    <>
      <Popover className="relative flex flex-row items-center space-x-2">
        {({ open }) => (
          <>
            <Popover.Button
              className={`flex flex-row items-center space-x-2 rounded-full p-2 font-semibold hover:bg-slate-200 ${
                open ? "outline-2" : "outline-none"
              }`}
              disabled={!edit}
            >
              {CurIcon && (
                <CurIcon
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
                });
              }}
              disabled={!edit}
            />
            <Popover.Panel
              className={`absolute top-10 left-0 z-10 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
                open ? "opacity-100" : "invisible opacity-0"
              }`}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row flex-wrap items-center space-x-2 rounded-md p-2">
                  {Object.keys(attributes)
                    .filter(
                      (type) => attributes[type as AttributeType]?.showInPicker
                    )
                    .map((type) => {
                      const typeInfo = attributes[type as AttributeType];
                      if (!typeInfo) return <></>;

                      const TypeIcon = typeInfo.icon;

                      return (
                        <div key={type} className="tooltip" data-tip={type}>
                          <button
                            className={`rounded-full p-1 transition-colors ${
                              column.type === type ? "bg-neutral" : "bg-white"
                            }`}
                            onClick={() => {
                              editColumn(column.name, {
                                name: column.name,
                                type: type as AttributeType,
                                value,
                              });
                            }}
                          >
                            <TypeIcon
                              className={`h-6 w-6 ${
                                column.type === type
                                  ? "text-white"
                                  : "text-neutral"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
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
