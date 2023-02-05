import { DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import { AttributeProps } from "./utils";
import CryptoJS from "crypto-js";

const FileAttributeIcon = DocumentArrowUpIcon;

const FileAttribute = ({ attribute, edit }: AttributeProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileHash, setFileHash] = useState("");
  const [file, setFile] = useState<File | null>(null);

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
  };

  if (edit) {
    return (
      <div className="flex flex-col">
        <input
          type="file"
          ref={fileInputRef}
          className={"hidden"}
          onChange={handleFileChange}
        />
        <button
          className="btn-primary btn"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          Select file
        </button>
        <p className="text-sm">{file?.name}</p>
        <button className="btn-primary btn" onClick={handleUpload}>
          Upload
        </button>
        <p className="text-base">{attribute.value as string}</p>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row items-center space-x-2">
        <FileAttributeIcon className="h-5 w-5" />
        <p className="text-base">{attribute.value as string}</p>
      </div>
    );
  }
};

export default FileAttribute;
