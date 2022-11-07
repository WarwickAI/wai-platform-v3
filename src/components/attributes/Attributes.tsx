import { TrashIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { DatabaseAttibuteIcon } from "./Database";
import { DateAttibuteIcon } from "./Date";
import { MarkdownAttributeIcon } from "./Markdown";
import { TextAttibuteIcon } from "./Text";
import { DBAttributeType } from "./utils";

type AttributeHeaderProps = {
  attribute: DBAttributeType;
  edit: boolean;
  editAttribute: (oldName: string, newValue: DBAttributeType) => void;
  deleteAttribute: (name: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const AttributeHeader = ({
  attribute,
  edit,
  editAttribute,
  deleteAttribute,
  open,
  setOpen,
}: AttributeHeaderProps) => {
  let Icon = null;

  switch (attribute.type) {
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
  }

  const [name, setName] = useState(attribute.name);
  const [value, setValue] = useState(attribute.value);
  const [required, setRequired] = useState(attribute.required);

  const debounced = useDebouncedCallback(
    (newAttribute: DBAttributeType) =>
      editAttribute(attribute.name, newAttribute),
    1000
  );

  useEffect(() => {
    setName(attribute.name);
    setValue(attribute.value);
    setRequired(attribute.required);
  }, [attribute]);

  return (
    <div className="relative flex flex-row space-x-2">
      {Icon && (
        <div className="tooltip" data-tip={attribute.type}>
          <button
            className={`rounded-full p-1 transition-colors ${
              open ? "bg-neutral" : "bg-white"
            }`}
            onClick={() => setOpen(!open)}
          >
            <Icon
              className={`h-6 w-6 ${open ? "text-white" : "text-neutral"}`}
            />
          </button>
        </div>
      )}
      <input
        className="input-ghost input input-sm w-24"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          debounced({
            name: e.target.value,
            type: attribute.type,
            value,
            required,
          });
        }}
      />
      <div
        className={` absolute top-10 right-0 z-10 flex w-72 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
          open ? "opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => deleteAttribute(attribute.name)}
            className="flex flex-row items-center space-x-2 rounded-md p-2 hover:bg-slate-100"
          >
            <div>
              <TrashIcon className="h-6 w-6 text-neutral" />
            </div>

            <div className="text-start">
              <p className="text-sm font-bold">Delete</p>
              <p className="text-xs">Remove this element</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
