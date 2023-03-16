import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Attribute, ElementType } from "@prisma/client";
import { InstantRunoff } from "votes";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import elements from "../elements";
import { ElementWithAttsGroupsChildren } from "../elements/utils";
import { getValidElementTypes } from "../utils";
import { ColumnAttributeSchema } from "./Columns";
import { AttributeProps } from "./utils";

export const STVAttributeSchema = z.array(z.string()).default([]);

type STVProps = AttributeProps & {
  database?: ElementWithAttsGroupsChildren;
};

export const STVAttribute = ({ attribute, edit, database }: STVProps) => {
  const order = STVAttributeSchema.parse(attribute.value);

  const utils = trpc.useContext();
  const editAttribute = trpc.attribute.editValue.useMutation();

  if (!database) return <div>Should provide database for ref</div>;

  const databaseColumnsAttribute = database.atts.find(
    (att) => att.name === "Columns"
  );

  if (!databaseColumnsAttribute)
    return <div>Database has no columns, cannot infer element type</div>;

  const databaseColumns = ColumnAttributeSchema.parse(
    databaseColumnsAttribute.value
  );

  const compatibleElements = getValidElementTypes(databaseColumns);

  if (compatibleElements.length === 0)
    return <div>Database has no compatible elements</div>;

  const Element = elements[compatibleElements[0] as ElementType]?.element;

  const handleValueUpdate = (newValue: string[]) => {
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

  const handleMoveUp = (id: string) => {
    const curValue = order;

    const index = curValue.findIndex((q) => q === id);

    // If the index is -1, add it to the end
    if (index === -1) {
      handleValueUpdate([...curValue, id]);
      return;
    }

    if (index === 0 || curValue.length < 2) return;

    const newValue = [...curValue];
    newValue[index] = newValue[index - 1]!;
    newValue[index - 1] = curValue[index]!;

    handleValueUpdate(newValue);
  };

  const handleMoveDown = (id: string) => {
    const curValue = attribute.value as string[];

    const index = curValue.findIndex((q) => q === id);

    // If the index is -1, add it to the end
    if (index === -1) {
      handleValueUpdate([...curValue, id]);
      return;
    }

    if (index === curValue.length - 1 || curValue.length < 2) return;

    const newValue = [...curValue];
    newValue[index] = newValue[index + 1]!;
    newValue[index + 1] = curValue[index]!;

    handleValueUpdate(newValue);
  };

  const handleRemove = (id: string) => {
    const curValue = attribute.value as string[];

    const index = curValue.findIndex((q) => q === id);

    // If index exists, remove it
    if (index !== -1) {
      const newValue = [...curValue];
      newValue.splice(index, 1);
      handleValueUpdate(newValue);
    }
  };

  return (
    <div className="flex flex-col">
      {database.children
        .sort(
          (a, b) =>
            (order.findIndex((c) => c === a.id) + 1 || 10000) -
            (order.findIndex((c) => c === b.id) + 1 || 10000)
        )
        .map((child) => {
          return (
            <div
              key={child.id}
              className="mt-2 flex flex-row items-center space-x-1"
            >
              <p className="font-sembold w-8 text-3xl">
                {order.findIndex((c) => c === child.id) + 1 || ""}
              </p>
              {Element && (
                <Element element={{ ...child, children: [] }} edit={edit} />
              )}
              <button onClick={() => handleMoveUp(child.id)}>
                <ChevronUpIcon className="h-6 w-6" />
              </button>
              <button onClick={() => handleMoveDown(child.id)}>
                <ChevronDownIcon className="h-6 w-6" />
              </button>
              <button onClick={() => handleRemove(child.id)}>
                <TrashIcon className="h-6 w-6 text-warning" />
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default STVAttribute;

// Given a list of STV results, allow the user to choose the number of seats to allocate
// and show the results (with counts of votes and seats allocated)
export const STVResults = ({
  stvAttributes,
  dbRef,
}: {
  stvAttributes: Attribute[];
  dbRef: string;
}) => {
  // Get the database
  const { data: database } = trpc.element.get.useQuery(dbRef);

  // Get all users
  const { data: users } = trpc.user.getAll.useQuery();

  if (!database) return <div>Database not found</div>;

  // Get the candidates (titles and IDs of the database children)
  const candidates = database.children.map((child) => {
    const userId = child.atts.find((att) => att.name === "User")?.value;

    if (!userId) return { id: child.id, name: "Unknown" };

    const user = users?.find((u) => u.id === userId);
    return {
      id: child.id,
      name: user?.name || "Unknown",
    };
  });

  // Parse the STV attributes
  const results = stvAttributes.map((att) => {
    const parsed = STVAttributeSchema.parse(att.value);
    return parsed;
  });

  // Create the STV object
  const stvResults = new InstantRunoff({
    candidates: candidates.map((c) => c.id),
    ballots: results.map((r) => {
      return {
        weight: 1,
        ranking: r.map((id) => [id]),
      };
    }),
  });

  const preferenceCounts: { [key: string]: number[] } = {};

  candidates.forEach((c) => {
    preferenceCounts[c.id] = [0, 0, 0, 0, 0, 0];
  });

  results.forEach((r) => {
    r.forEach((id, i) => {
      preferenceCounts[id]![i]++;
    });
  });

  return (
    <div>
      <p>STV Results</p>
      <ul>
        {stvResults.ranking().map((rank, i) => (
          <li key={i}>
            {rank.map((candidate) => (
              <span key={i + " " + candidate}>
                {candidates.find(({ id, name }) => id === candidate)?.name ||
                  "Unknown"}
              </span>
            ))}
          </li>
        ))}
      </ul>
      <p>Raw Results</p>
      {Object.keys(preferenceCounts).map((id) => {
        return (
          <div key={id}>
            <p>
              {candidates.find((c) => c.id === id)?.name || "Unknown"}:{" "}
              {preferenceCounts[id]!.join(", ")}
            </p>
          </div>
        );
      })}
    </div>
  );
};
