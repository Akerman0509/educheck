import { useState } from "react";
import PdfRenderer from "./PdfRenderer.jsx";

export default function ImgGrid({ files }) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {files.map((file, index) => (
                <div key={index}>
                    <PdfRenderer fileSrc={file.src} title={file.alt} />
                </div>
            ))}
        </div>
    );
}
