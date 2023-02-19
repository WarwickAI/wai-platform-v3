import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { env } from "../../../env/client.mjs";
import { trpc } from "../../../utils/trpc";
import PageElement, { generateUUIDRoute } from "../Page";
import { ElementWithAttsGroups } from "../utils";

type DatabasePagesProps = {
  pages: ElementWithAttsGroups[];
  handleAddRow: () => void;
  edit: boolean;
};

const DatabasePages = ({ pages, handleAddRow, edit }: DatabasePagesProps) => {
  return (
    <div className="flex flex-row flex-wrap space-x-2">
      {pages.map((page) => (
        <PageElement
          key={page.id}
          element={{ ...page, children: [] }}
          edit={edit}
          page={false}
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

export default DatabasePages;

export const DatabasePagesCard = ({
  pages,
  handleAddRow,
  edit,
}: DatabasePagesProps) => {
  return (
    <div className="flex w-full flex-row flex-wrap gap-2">
      {pages.map((page) => (
        <PageCard key={page.id} page={page} />
      ))}
      {edit && (
        <button
          onClick={handleAddRow}
          className="flex h-72 w-48 grow flex-col items-center justify-center overflow-clip rounded-xl border-2 bg-slate-100 hover:cursor-pointer"
        >
          <PlusIcon className="h-6 w-6 text-neutral" />
        </button>
      )}
    </div>
  );
};

const PageCard = ({ page }: { page: ElementWithAttsGroups }) => {
  const cardAttribute = page.atts.find((a) => a.name === "Card");
  const { data: coverFile } = trpc.file.get.useQuery(
    { id: (cardAttribute?.value as string) || "" },
    {
      enabled: !!cardAttribute?.value,
    }
  );

  const titleAttribute = page.atts.find((a) => a.name === "Title");

  return (
    <Link
      href={
        page.route.match(
          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
        )
          ? "/" +
            generateUUIDRoute(
              page.route,
              titleAttribute ? (titleAttribute.value as string) : undefined
            )
          : "/" + page.route
      }
    >
      <div
        className={`flex h-72 w-48 grow flex-col justify-end  overflow-clip rounded-xl hover:cursor-pointer ${
          coverFile
            ? "bg-cover bg-center bg-no-repeat"
            : "border-2 bg-slate-100"
        }`}
        style={{
          backgroundImage: coverFile
            ? `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url(https://${env.NEXT_PUBLIC_CDN_URL}/${coverFile.uuid})`
            : "",
        }}
      >
        {/* Put title at bottom */}
        <p
          className={`p-4 text-lg font-medium ${
            coverFile ? "text-white" : "text-black"
          }`}
        >
          {titleAttribute?.value as string}
        </p>
      </div>
    </Link>
  );
};
