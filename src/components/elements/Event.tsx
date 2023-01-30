import { Popover } from "@headlessui/react";
import { TicketIcon, QrCodeIcon } from "@heroicons/react/24/solid";
import {
  QrCodeIcon as QrCodeOutlineIcon,
  TicketIcon as TicketOutlineIcon,
} from "@heroicons/react/24/outline";
import { QRCode } from "react-qrcode-logo";
import { clientEnv } from "../../env/schema.mjs";
import DateAttribute from "../attributes/Date";
import MarkdownAttribute from "../attributes/Markdown";
import TextAttribute from "../attributes/Text";
import UsersAttribute from "../attributes/Users";
import { ElementProps, RequiredAttribute } from "./utils";

export const EventRequiredAttributes: RequiredAttribute[] = [
  { name: "Title", type: "Text", value: "" },
  { name: "Description", type: "Markdown", value: "" },
  { name: "Start Date", type: "Date", value: "" },
  { name: "End Date", type: "Date", value: "" },
  { name: "Location", type: "Text", value: "" },
  { name: "Attendees", type: "Users", value: [] },
];

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
      {(startDateAttribute?.value || endDateAttribute?.value || edit) && (
        <div className="flex flex-row flex-wrap items-center space-x-2">
          {startDateAttribute?.value && !endDateAttribute?.value && (
            <p className="text-base">From</p>
          )}
          {endDateAttribute?.value && !startDateAttribute?.value && (
            <p className="text-base">Until</p>
          )}
          {startDateAttribute && (
            <DateAttribute
              attribute={startDateAttribute}
              edit={edit}
              placeholder={"Edit start date..."}
            />
          )}
          {startDateAttribute?.value && endDateAttribute?.value && (
            <p className="text-base">→</p>
          )}
          {endDateAttribute && (
            <DateAttribute
              attribute={endDateAttribute}
              edit={edit}
              placeholder={"Edit end date..."}
            />
          )}
        </div>
      )}
      {descriptionAttribute && (
        <MarkdownAttribute
          attribute={descriptionAttribute}
          edit={edit}
          placeholder={"*Edit event description...*"}
        />
      )}
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
      <div className="flex flex-row space-x-2">
        {edit && <AttendeesPopover element={element} edit={edit} page={page} />}
        {edit && <EventQRPopover element={element} edit={edit} page={page} />}
      </div>
    </div>
  );
};

export default EventElement;

const AttendeesPopover = ({ element, edit }: ElementProps) => {
  const usersAttribute = element.atts.find((a) => a.name === "Attendees");

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex flex-row items-center space-x-2 rounded-lg px-2 py-1 font-semibold hover:bg-slate-200 ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {open ? (
              <TicketIcon className="w-6" />
            ) : (
              <TicketOutlineIcon className="w-6" />
            )}
            <span className="text-sm">Attendees</span>
          </Popover.Button>
          <Popover.Panel className="absolute top-10 left-0 z-10 flex flex-col space-y-1 rounded-md border-2 bg-white p-2">
            {usersAttribute ? (
              <UsersAttribute attribute={usersAttribute} edit={edit} />
            ) : (
              <p>loading attendees...</p>
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

const EventQRPopover = ({ element }: ElementProps) => {
  const url = `${clientEnv.NEXT_PUBLIC_URL}/${element.id}`;

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex flex-row items-center space-x-2 rounded-lg px-2 py-1 font-semibold hover:bg-slate-200 ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {open ? (
              <QrCodeIcon className="w-6" />
            ) : (
              <QrCodeOutlineIcon className="w-6" />
            )}
            <span className="text-sm">QR Code</span>
          </Popover.Button>
          <Popover.Panel className="absolute top-10 left-0 z-10 flex flex-col space-y-1 rounded-md border-2 bg-white p-2 text-center">
            <QRCode
              value={url}
              size={400}
              logoHeight={110}
              logoWidth={110}
              ecLevel={"Q"}
              eyeRadius={5}
              removeQrCodeBehindLogo
              logoImage={"/static/logo2.png"}
            />
            <code className="text-sm">{url}</code>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};
