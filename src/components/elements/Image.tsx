import { env } from "../../env/client.mjs";
import FileAttribute from "../attributes/File";
import { ElementProps, RequiredAttribute } from "./utils";
import Image from "next/image";
import { trpc } from "../../utils/trpc";

export const ImageRequiredAttributes: RequiredAttribute[] = [
  { name: "URL", type: "File", value: "" },
];

const ImageElement = ({ element, edit }: ElementProps) => {
  const urlAttribute = element.atts.find((a) => a.name === "URL");
  const fileData = trpc.file.get.useQuery(
    { id: (urlAttribute?.value as string) || "" },
    {
      enabled: !!urlAttribute?.value,
    }
  );
  const file = fileData.data;

  const url = file?.uuid && `https://${env.NEXT_PUBLIC_CDN_URL}/${file.uuid}`;

  return (
    <div className="flex flex-col">
      {urlAttribute && <FileAttribute attribute={urlAttribute} edit={edit} />}
      {file && file.width && file.height && url && (
        <Image
          src={url}
          alt={"Something..."}
          width={file.width}
          height={file.height}
        />
      )}
    </div>
  );
};

export default ImageElement;
