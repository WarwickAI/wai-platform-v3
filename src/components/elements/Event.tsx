import { CalendarIcon } from "@heroicons/react/24/solid";
import DateAttribute from "../attributes/Date";
import MarkdownAttribute from "../attributes/Markdown";
import TextAttribute from "../attributes/Text";
import { ElementProps, RequiredAttribute } from "./utils";

export const EventRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "Event Title" },
  { name: "Description", type: "Markdown", value: "Event Description" },
  { name: "Start Date", type: "Date", value: "" },
  { name: "End Date", type: "Date", value: "" },
  { name: "Location", type: "Text", value: "" },
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
        <TextAttribute attribute={titleAttribute} edit={edit} size="lg" />
      )}
      {descriptionAttribute && (
        <MarkdownAttribute attribute={descriptionAttribute} edit={edit} />
      )}
      {startDateAttribute && (
        <DateAttribute attribute={startDateAttribute} edit={edit} />
      )}
      {endDateAttribute && (
        <DateAttribute attribute={endDateAttribute} edit={edit} />
      )}
      {locationAttribute && (
        <TextAttribute attribute={locationAttribute} edit={edit} size="sm" />
      )}
    </div>
  );
};

export default EventElement;
