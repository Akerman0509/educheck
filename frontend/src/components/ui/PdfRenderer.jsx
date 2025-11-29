import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Component render một trang đầu tiên của file PDF.
 * @param {string} fileSrc - Đường dẫn tới file PDF.
 */
export default function PdfRenderer({ fileSrc }) {
    const [numPages, setNumPages] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const containerRef = useRef(null);
    const [pageWidth, setPageWidth] = useState(600); // default

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error) => {
        setLoadError(error.message);
    };

    // Update page width to container width
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setPageWidth(containerRef.current.clientWidth);
            }
        };
        handleResize(); // initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            ref={containerRef}
            className="pdf-container rounded shadow border bg-gray-100 flex flex-col items-center p-2 overflow-auto"
            style={{ maxHeight: "80vh" }}
        >
            <Document
                file={fileSrc}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                    <div className="h-96 flex items-center justify-center text-gray-500">
                        Đang tải văn bằng...
                    </div>
                }
            >
                {numPages && <Page pageNumber={1} width={pageWidth} />}
            </Document>

            {loadError && (
                <div className="text-red-500 p-4">
                    Không thể tải file PDF: {loadError}
                </div>
            )}
        </div>
    );
}
