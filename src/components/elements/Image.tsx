import { env } from "../../env/client.mjs";
import { ElementProps, RequiredAttribute } from "./utils";
import Image from "next/image";
import { trpc } from "../../utils/trpc";
import ImageAttribute from "../attributes/Image";
import NumberAttribute from "../attributes/Number";

export const ImageRequiredAttributes: RequiredAttribute[] = [
  { name: "URL", type: "Image", value: "" },
  { name: "Scale", type: "Number", value: "1" },
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

  const scaleAttribute = element.atts.find((a) => a.name === "Scale");

  return (
    <div>
      <div className="flex flex-row items-center space-x-2">
        {urlAttribute && edit && (
          <ImageAttribute attribute={urlAttribute} edit={edit} />
        )}
        {scaleAttribute && edit && (
          <div className="flex flex-row items-center space-x-2">
            <p className="text-base">Scale</p>
            <NumberAttribute attribute={scaleAttribute} edit={edit} />
          </div>
        )}
      </div>
      {file && file.width && file.height && scaleAttribute?.value && url && (
        <div className="flex flex-col items-center">
        <Image
          src={url}
          alt={"Something..."}
          width={
            isNaN(file.width * Number(scaleAttribute.value))
              ? 0
              : file.width * Number(scaleAttribute.value)
          }
          height={
            isNaN(file.height * Number(scaleAttribute.value))
              ? 0
              : file.height * Number(scaleAttribute.value)
          }
        />
        </div>
      )}
    </div>
  );
};

export default ImageElement;
