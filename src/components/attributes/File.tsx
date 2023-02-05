import { DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";
import CryptoJS from "crypto-js";
import { File as FileEntity } from "@prisma/client";

export const IMAGE_MIME_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const FileAttributeIcon = DocumentArrowUpIcon;

const FileAttribute = ({ attribute, edit }: AttributeProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileHash, setFileHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileEntity, setFileEntity] = useState<FileEntity | null>(null);

  const utils = trpc.useContext();
  const getSignedUrl = trpc.file.upload.useMutation();
  const editAttribute = trpc.attribute.editValue.useMutation({
    onSuccess: (data) => {
      utils.element.getAll.invalidate();
      utils.element.get.invalidate(data.elementId);
      utils.element.queryAll.invalidate({ type: data.element.type });
      data.element.parent &&
        utils.element.getPage.invalidate({
          route: data.element.parent.route,
        });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]!;

      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target) {
          const binary = event.target.result;
          const md5 = CryptoJS.MD5(binary as any).toString();
          setFileHash(md5);
        }
      };

      reader.readAsBinaryString(file);

      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Check if the file is an image
    const isImage = IMAGE_MIME_TYPES.includes(file.type);

    // Get width and height if the file is an image
    if (isImage) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        const { file: fileEntity, signedUrl } = await getSignedUrl.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          encoding: "None",
          hash: fileHash,
          size: file.size,
          width,
          height,
        });

        setFileEntity(fileEntity);

        // Only upload if we receive a signed URL
        if (signedUrl) {
          const res = await fetch(signedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
              "x-amz-acl": "public-read",
            },
          });

          if (res.status === 200) {
            editAttribute.mutate({ id: attribute.id, value: fileEntity.id });
          }
        } else {
          // Only change the attribute if we don't receive a signed URL
          editAttribute.mutate({ id: attribute.id, value: fileEntity.id });
        }
      };
    } else {
      const { file: fileEntity, signedUrl } = await getSignedUrl.mutateAsync({
        fileName: file.name,
        mimeType: file.type,
        encoding: "None",
        hash: fileHash,
        size: file.size,
      });

      // Only upload if we receive a signed URL
      if (signedUrl) {
        const res = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
            "x-amz-acl": "public-read",
          },
        });

        if (res.status === 200) {
          editAttribute.mutate({ id: attribute.id, value: fileEntity.id });
        }
      } else {
        // Only change the attribute if we don't receive a signed URL
        editAttribute.mutate({ id: attribute.id, value: fileEntity.id });
      }
    }
  };

  if (edit) {
    return (
      <div className="flex flex-row items-center space-x-2">
        <div>
          <div className="flex flex-row space-x-1">
            <input
              type="file"
              ref={fileInputRef}
              className={"hidden"}
              onChange={handleFileChange}
            />
            <button
              className="btn-primary btn-sm btn"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              Select file
            </button>
          </div>
          {file && <p className="text-sm">{file?.name}</p>}
        </div>
        <div>
          <button
            className="btn-primary btn-sm btn"
            onClick={handleUpload}
            disabled={!file}
          >
            Upload
          </button>
          {fileEntity && <p className="text-base">{fileEntity?.fileName}</p>}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row items-center space-x-2">
        <p className="text-base">{fileEntity?.fileName}</p>
      </div>
    );
  }
};

export default FileAttribute;
