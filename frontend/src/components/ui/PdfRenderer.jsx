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
export default function PdfRenderer({ fileSrc, title = "Document Preview" }) {
    const [numPages, setNumPages] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [pageWidth, setPageWidth] = useState(600);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error) => {
        setLoadError(error.message);
    };

    // Resize theo container
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setPageWidth(containerRef.current.clientWidth);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isOpen]);

    return (
        <>
            {/* ✅ Preview nhỏ - click để zoom */}
            <div
                onClick={() => setIsOpen(true)}
                className="cursor-zoom-in rounded shadow border bg-gray-100 p-2 w-fit"
            >
                <Document file={fileSrc}>
                    <Page pageNumber={1} width={300} />
                </Document>
                <p className="text-sm text-center text-gray-500 mt-2">
                    {title}
                </p>
            </div>

            {/* ✅ Modal Zoom */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="bg-white w-[60vw] h-[90vh] rounded-lg shadow-lg flex flex-col">
                        {/* ✅ Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="font-semibold text-lg">{title}</h2>
                            <button
                                className="text-red-500 font-semibold"
                                onClick={() => setIsOpen(false)}
                            >
                                Đóng
                            </button>
                        </div>

                        {/* ✅ PDF Scroll area */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-auto flex flex-col items-center bg-gray-100 p-4"
                        >
                            <Document
                                file={fileSrc}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={
                                    <div className="h-96 flex items-center justify-center text-gray-500">
                                        Đang tải PDF...
                                    </div>
                                }
                            >
                                {numPages &&
                                    Array.from(
                                        new Array(numPages),
                                        (_, index) => (
                                            <Page
                                                key={index}
                                                pageNumber={index + 1}
                                                width={pageWidth}
                                                className="mb-6"
                                            />
                                        )
                                    )}
                            </Document>

                            {loadError && (
                                <div className="text-red-500 p-4">
                                    Không thể tải file PDF: {loadError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
