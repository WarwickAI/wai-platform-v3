import { useRef, useState } from "react";
import { AttributeProps } from "./utils";
import { File as FileEntity } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import CryptoJS from "crypto-js";
import { z } from "zod";

export const IMAGE_MIME_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const FileAttributeSchema = z.string().default("");

// const ImageAttributeIcon = PhotoIcon;

const ImageAttribute = ({ attribute, edit }: AttributeProps) => {
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
      const file = e.target.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target) {
          const binary = event.target.result;
          const md5 = CryptoJS.MD5(binary as string).toString();
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

    if (!isImage) return;

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

      // Only upload if we receive a signed URL (signedURL is an AWS PresignedPost)
      if (signedUrl) {
        // Create a new form data
        const formData = new FormData();

        // Add the signed URL fields to the form data
        Object.entries(signedUrl.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });

        // Add the file to the form data
        formData.append("file", file);

        // Upload the file
        const res = await fetch(signedUrl.url, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          editAttribute.mutate({ id: attribute.id, value: fileEntity.id });
        }
      } else {
        // Only change the attribute if we don't receive a signed URL
        editAttribute.mutate({ id: attribute.id, value: fileEntity.id });
      }
    };
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
              accept={IMAGE_MIME_TYPES.join(",")}
            />
            <button
              className="btn-primary btn-sm btn"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              Select image
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

export default ImageAttribute;
