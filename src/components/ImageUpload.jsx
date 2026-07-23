import { useState } from "react";

const ImageUpload = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cloudName = "tl37mzk2";

  const openUploadWidget = () => {
    setLoading(true);
    setError("");

    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;

    script.onload = () => {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: "my_preset",
          folder: "auto-khata",
          sources: ["local", "url", "camera"],
          multiple: true,
          maxImageFileSize: 5000000,
        },
        (error, result) => {
          if (error) {
            console.error("Upload error:", error);
            setError("Upload failed! Please try again.");
            setLoading(false);
            return;
          }

          if (result.event === "success") {
            console.log("✅ Upload success:", result.info);
            setImageUrls((prev) => [...prev, result.info.secure_url]);
            setLoading(false);
          } else if (result.event === "close") {
            setLoading(false);
          }
        },
      );

      widget.open();
    };

    script.onerror = () => {
      setError("Failed to load upload widget.");
      setLoading(false);
    };

    document.body.appendChild(script);
  };

  const removeImage = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="image-upload-wrapper">
      {/* Upload Button */}
      <button
        onClick={openUploadWidget}
        disabled={loading}
        className="upload-btn"
      >
        {loading ? "⏳ Uploading..." : "📸 Upload Images"}
      </button>

      {error && <p className="upload-error">{error}</p>}

      {/* Image Grid */}
      {imageUrls.length > 0 && (
        <div className="image-grid">
          {imageUrls.map((url, index) => (
            <div key={index} className="image-thumbnail-wrapper">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="image-thumbnail"
              />
              <button
                onClick={() => removeImage(index)}
                className="remove-btn"
                title="Remove this image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Global Styles (Inject kar rahe hain taake sab forms mein apply ho) */}
      <style>{`
        .image-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .upload-btn {
          background: #3b82f6;
          color: white;
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-error {
          color: #ef4444;
          font-size: 13px;
          margin: 0;
        }

        .image-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 6px;
        }

        .image-thumbnail-wrapper {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          overflow: hidden;
          background: #f3f4f6;
          flex-shrink: 0;
          transition: 0.2s;
        }

        .image-thumbnail-wrapper:hover {
          border-color: #94a3b8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .image-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .remove-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          border: 2px solid white;
          font-size: 12px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.15s;
          padding: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .remove-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        /* Dark mode support for your existing gray-800 theme */
        .image-thumbnail-wrapper.dark {
          border-color: #4b5563;
          background: #1f2937;
        }

        .image-thumbnail-wrapper.dark:hover {
          border-color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
