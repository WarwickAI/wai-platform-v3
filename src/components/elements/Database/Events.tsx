import { PlusIcon } from "@heroicons/react/24/solid";
import EventElement from "../Event";
import { ElementWithAttsGroups } from "../utils";

type DatabaseEventsProps = {
  events: ElementWithAttsGroups[];
  handleAddRow: () => void;
  edit: boolean;
};

const DatabaseEvents = ({
  events,
  handleAddRow,
  edit,
}: DatabaseEventsProps) => {
  return (
    <div className="flex flex-row flex-wrap space-x-2">
      {events.map((event) => (
        <EventElement
          key={event.id}
          element={{ ...event, children: [] }}
          edit={edit}
        />
      ))}
      {edit && (
        <button
          onClick={handleAddRow}
          className="h-8 w-8 rounded-full p-1 hover:cursor-pointer hover:bg-slate-300"
        >
          <PlusIcon className="h-6 w-6 text-neutral" />
        </button>
      )}
    </div>
  );
};

export default DatabaseEvents;
