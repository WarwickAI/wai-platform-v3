import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";

export const DateAttibuteIcon = CalendarDaysIcon;

const DateAttribute = ({ attribute, edit }: AttributeProps) => {
  const [editMode, setEditMode] = useState<boolean>(false);

  const [dateValue, setDateValue] = useState<Date | null>(
    attribute.value ? new Date(attribute.value as string) : null
  );

  useEffect(() => {
    setDateValue(attribute.value ? new Date(attribute.value as string) : null);
  }, [attribute.value]);

  const utils = trpc.useContext();

  const editAttribute = trpc.attribute.editValue.useMutation();

  const handleEdit = (newDate: Date | null) => {
    const newValue = newDate?.toISOString() || "";
    editAttribute.mutate(
      { id: attribute.id, value: newValue },
      {
        onSuccess: (data) => {
          utils.element.getAll.invalidate();
          utils.element.get.invalidate(data.elementId);
          utils.element.queryAll.invalidate({ type: data.element.type });
          data.element.parent &&
            utils.element.getPage.invalidate({
              route: data.element.parent.route,
            });
        },
      }
    );
  };

  return (
    <div>
      {edit && editMode ? (
        <div className="flex flex-row items-center space-x-1">
          <input
            className={`input input-sm px-0`}
            type="date"
            value={dateValue?.toISOString().split("T")[0]}
            onChange={(e) => {
              const oldTime = (dateValue?.toTimeString() || "00:00").split(":");
              const newDate = e.target.valueAsDate;

              if (newDate) {
                newDate.setHours(parseInt(oldTime[0] || "0"));
                newDate.setMinutes(parseInt(oldTime[1] || "0"));
              }

              setDateValue(newDate);
              handleEdit(newDate);
            }}
          />
          <input
            className={`input input-sm px-0`}
            type="time"
            value={
              dateValue
                ? dateValue?.getHours() +
                  ":" +
                  (dateValue?.getMinutes() < 10
                    ? "0" + dateValue.getMinutes()
                    : dateValue.getMinutes())
                : ""
            }
            onChange={(e) => {
              const time = e.target.value.split(":");
              const newDate = dateValue ? new Date(dateValue.getTime()) : null;

              if (newDate) {
                newDate.setHours(parseInt(time[0] || "0"));
                newDate.setMinutes(parseInt(time[1] || "0"));
              }

              setDateValue(newDate);
              handleEdit(newDate);
            }}
          />
          <button onClick={() => setEditMode(false)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <article className="prose" onClick={() => setEditMode(true)}>
          {dateValue
            ? dateValue?.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })
            : edit && <em>click to edit date...</em>}
        </article>
      )}
    </div>
  );
};

export default DateAttribute;
