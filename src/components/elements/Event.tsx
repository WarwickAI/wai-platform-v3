import { CalendarIcon, TicketIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import DateAttribute from "../attributes/Date";
import MarkdownAttribute from "../attributes/Markdown";
import TextAttribute from "../attributes/Text";
import UsersAttribute from "../attributes/Users";
import { ElementProps, RequiredAttribute } from "./utils";

export const EventRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "Event Title" },
  { name: "Description", type: "Markdown", value: "Event Description" },
  { name: "Start Date", type: "Date", value: "" },
  { name: "End Date", type: "Date", value: "" },
  { name: "Location", type: "Text", value: "" },
  { name: "Attendees", type: "Users", value: [] },
];

export const EventDescription = "Scheduled event with location and time.";

export const EventIcon = CalendarIcon;

const EventElement = ({ element, edit, page }: ElementProps) => {
  const titleAttribute = element.atts.find((a) => a.name === "Title");
  const descriptionAttribute = element.atts.find(
    (a) => a.name === "Description"
  );
  const startDateAttribute = element.atts.find((a) => a.name === "Start Date");
  const endDateAttribute = element.atts.find((a) => a.name === "End Date");
  const locationAttribute = element.atts.find((a) => a.name === "Location");

  return (
    <div>
      {titleAttribute && (
        <TextAttribute
          attribute={titleAttribute}
          edit={edit}
          size="lg"
          placeholder="Edit event title..."
        />
      )}
      {descriptionAttribute && (
        <MarkdownAttribute attribute={descriptionAttribute} edit={edit} />
      )}
      <div className="flex flex-row flex-wrap space-x-2">
        {startDateAttribute && (
          <DateAttribute attribute={startDateAttribute} edit={edit} />
        )}
        <p className="text-base">→</p>
        {endDateAttribute && (
          <DateAttribute attribute={endDateAttribute} edit={edit} />
        )}
      </div>
      <div className="flex flex-row flex-wrap items-center">
        <p className="text-md">📍</p>
        {locationAttribute && (
          <TextAttribute
            attribute={locationAttribute}
            edit={edit}
            size="sm"
            placeholder="Edit location..."
          />
        )}
      </div>
      {edit && <AttendeesPopover element={element} edit={edit} page={page} />}
    </div>
  );
};

export default EventElement;

const AttendeesPopover = ({ element, edit }: ElementProps) => {
  const usersAttribute = element.atts.find((a) => a.name === "Attendees");

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex flex-row items-center space-x-2 hover:cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <TicketIcon className="w-6" />
        <span className="text-sm">Attendees</span>
      </div>
      <div
        className={`absolute top-10 left-0 z-10 flex w-80 flex-col space-y-1 rounded-md border-2 bg-white p-2 transition-opacity ${
          isOpen ? "opacity-100" : "invisible opacity-0"
        }`}
      >
        {usersAttribute ? (
          <UsersAttribute attribute={usersAttribute} edit={edit} />
        ) : (
          <p>loading attendees...</p>
        )}
      </div>
    </div>
  );
};
