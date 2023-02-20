import { Popover } from "@headlessui/react";
import { TicketIcon, QrCodeIcon } from "@heroicons/react/24/solid";
import {
  QrCodeIcon as QrCodeOutlineIcon,
  TicketIcon as TicketOutlineIcon,
} from "@heroicons/react/24/outline";
import { QRCode } from "react-qrcode-logo";
import { clientEnv } from "../../env/schema.mjs";
import DateAttribute, { DateAttributeSchema } from "../attributes/Date";
import MarkdownAttribute from "../attributes/Markdown";
import TextAttribute from "../attributes/Text";
import UsersAttribute, { UsersAttributeSchema } from "../attributes/Users";
import {
  ElementProps,
  ElementAttributeDescription,
  AttributeEditCheckPermsFn,
} from "./utils";

export const EventRequiredAttributes: ElementAttributeDescription[] = [
  { name: "Title", type: "Text" },
  { name: "Description", type: "Markdown" },
  { name: "Start Date", type: "Date" },
  { name: "End Date", type: "Date" },
  { name: "Location", type: "Text" },
  { name: "Attendees", type: "Users", optional: true },
  { name: "Interested", type: "Users", optional: true },
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
      {edit && (
        <div className="flex flex-row space-x-2">
          <AttendeesPopover element={element} edit={edit} page={page} />
          <EventQRPopover element={element} edit={edit} page={page} />
        </div>
      )}
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
      {locationAttribute && (locationAttribute.value || edit) && (
        <div className="flex flex-row flex-wrap items-center">
          <p className="text-md">📍</p>

          <TextAttribute
            attribute={locationAttribute}
            edit={edit}
            size="sm"
            placeholder="Edit location..."
          />
        </div>
      )}
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
            className={`flex flex-row items-center space-x-1 rounded-lg bg-secondary px-2 py-1 font-semibold text-secondary-content hover:bg-secondary-focus ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {open ? (
              <TicketIcon className="w-5" />
            ) : (
              <TicketOutlineIcon className="w-5" />
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
  const url = `${clientEnv.NEXT_PUBLIC_URL}/claim/${element.id}`;

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex flex-row items-center space-x-1 rounded-lg bg-secondary px-2 py-1 font-semibold text-secondary-content hover:bg-secondary-focus ${
              open ? "outline-2" : "outline-none"
            }`}
          >
            {open ? (
              <QrCodeIcon className="w-5" />
            ) : (
              <QrCodeOutlineIcon className="w-5" />
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

export const eventAttributeEditCheckPerms: AttributeEditCheckPermsFn = async (
  prisma,
  user,
  input,
  attribute,
  element
) => {
  // Allow the user to add themselves to the attendees list (attribute)
  // if they have edit permissions on the element

  if (!user) return;

  // Make sure user has interact permissions on the element
  if (
    !user.groups.some((g) =>
      element.interactGroups.map((g2) => g2.id).includes(g.id)
    ) &&
    !element.interactGroups.find((g) => g.name === "All")
  ) {
    return;
  }

  // Also, make sure that the current date is between the start and end dates
  const startDateAttribute = element.atts.find((a) => a.name === "Start Date");

  let startDateValue: Date | undefined;
  if (startDateAttribute) {
    const startDate = DateAttributeSchema.safeParse(startDateAttribute.value);

    if (!startDate.success) {
      console.error("Error parsing start date attribute");
      return;
    }

    startDateValue = new Date(startDate.data);
  }

  const endDateAttribute = element.atts.find((a) => a.name === "End Date");

  let endDateValue: Date | undefined;
  if (endDateAttribute) {
    const endDate = DateAttributeSchema.safeParse(endDateAttribute.value);

    if (!endDate.success) {
      console.error("Error parsing end date attribute");
      return;
    }

    endDateValue = new Date(endDate.data);
  }

  const now = new Date();

  if (
    (startDateValue && now < startDateValue) ||
    (endDateValue && now > endDateValue)
  ) {
    return;
  }

  if (attribute.name === "Attendees" && attribute.type === "Users") {
    // Get the current list of users
    const users = UsersAttributeSchema.safeParse(attribute.value);
    const newUsers = UsersAttributeSchema.safeParse(input.value);

    if (!users.success || !newUsers.success) {
      console.error("Error parsing users attribute");
      return;
    }

    // Check that the users and newUsers only differ by the current user ID
    if (
      (users.data.length !== newUsers.data.length - 1 || // One less user
        users.data.length === newUsers.data.length - 1) && // Same number of users (might already be in the list)
      newUsers.data.every((u) => users.data.includes(u) || u === user.id) && // All users in the new list are in the old list, or are the current user
      users.data.every((u) => newUsers.data.includes(u) || u === user.id) // All users in the old list are in the new list, or are the current user
    ) {
      return true;
    }
  }

  return;
};
