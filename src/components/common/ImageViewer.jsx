import React from "react";
import { Close, Download } from "@mui/icons-material";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Image Viewer Modal Component
 * Displays images in full-screen modal with download option
 */
const ImageViewer = ({ imageUrl, alt, onClose }) => {
  const { isDark } = useTheme();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = alt || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 
                   rounded-full text-white transition-all backdrop-blur-sm"
          aria-label="Close"
        >
          <Close />
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-4 right-16 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 
                   rounded-full text-white transition-all backdrop-blur-sm"
          aria-label="Download"
        >
          <Download />
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt={alt || "Image"}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            e.target.src = "/avatar.jpeg";
          }}
        />
      </div>
    </div>
  );
};

export default ImageViewer;

