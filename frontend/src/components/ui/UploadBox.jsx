import { useState } from "react";

export default function UploadBox({ onChange }) {
  const [preview, setPreview] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange && onChange(file);
    }
  };

  return (
    <label
      className="
      bg-white 
      w-[350px] 
      h-[350px] 
      rounded-xl 
      shadow-[0px_5px_20px_rgba(0,0,0,0.4)]
      m-2 
      flex 
      items-center 
      justify-center 
      cursor-pointer
      overflow-hidden
      "
    >
      {preview ? (
        <img
          src={preview}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-600">
          <img src="/upload.png" className="w-10 h-10" />
          <div className="mt-1 text-sm">Ảnh văn bằng</div>
        </div>
      )}
      <input type="file" accept="image/*" hidden onChange={handleUpload} />
    </label>
  );
}
