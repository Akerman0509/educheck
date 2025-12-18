import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";

GlobalWorkerOptions.workerSrc = pdfWorker;


export default function UploadBox({ onChange }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      onChange && onChange(file);
      return;
    }

    if (file.type === "application/pdf") {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);

        // Load PDF
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const page = await pdf.getPage(1);

        // Render PDF => canvas
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport
        }).promise;

        const imageData = canvas.toDataURL("image/png");
        setPreview(imageData);

        onChange && onChange(file);
      };

      fileReader.readAsArrayBuffer(file);
    }
  };

  return (
    <label className="bg-white w-[500px] h-[500px] rounded-xl shadow-[0px_5px_20px_rgba(0,0,0,0.4)] m-2 flex items-center justify-center cursor-pointer overflow-hidden">
      {preview ? (
        <img src={preview} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center text-gray-600">
          <img src="/imgButton/upload.png" className="w-10 h-10" />
          <div className="mt-1 text-sm text-center">
            Upload văn bằng (ảnh hoặc PDF)
          </div>
        </div>
      )}

      <input type="file" accept="image/*,application/pdf" hidden onChange={handleUpload} />
    </label>
  );
}
