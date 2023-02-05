import { env } from "../../env/client.mjs";
import FileAttribute from "../attributes/File";
import { ElementProps, RequiredAttribute } from "./utils";
import Image from "next/image";

export const ImageRequiredAttributes: RequiredAttribute[] = [
  { name: "URL", type: "File", value: "" },
];

const ImageElement = ({ element, edit }: ElementProps) => {
  const urlAttribute = element.atts.find((a) => a.name === "URL");

  const url = urlAttribute
    ? (urlAttribute.value as string).includes("https://")
      ? (urlAttribute.value as string)
      : `https://${env.NEXT_PUBLIC_CDN_URL}/${urlAttribute?.value as string}`
    : undefined;

  return (
    <div className="flex flex-col">
      {urlAttribute && <FileAttribute attribute={urlAttribute} edit={edit} />}
      {url && <Image src={url} alt={"Something..."} width={200} height={100} />}
    </div>
  );
};

export default ImageElement;
