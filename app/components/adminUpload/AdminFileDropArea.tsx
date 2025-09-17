import React, { useCallback, useState } from "react";
import MuzaIcon from "~/icons/MuzaIcon";
import "./AdminFileDropArea.scss";

interface AdminFileDropAreaProps {
  onFileUpload: (files: File[]) => void;
}

const AdminFileDropArea: React.FC<AdminFileDropAreaProps> = ({
  onFileUpload,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileUpload(files);
      }
    },
    [onFileUpload]
  );

  const handleBrowseClick = useCallback(() => {
    // Only folder selection
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "audio/*";
    input.webkitdirectory = true; // Enable folder selection only
    input.onchange = e => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      if (files.length > 0) {
        onFileUpload(files);
      }
    };
    input.click();
  }, [onFileUpload]);

  // Always show the drop area, even when files are uploaded

  return (
    <div className="admin-file-drop-area">
      <div
        className={`admin-file-drop-area__zone ${isDragOver ? "admin-file-drop-area__zone--drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="admin-file-drop-area__content">
          <div className="admin-file-drop-area__icon">
            <MuzaIcon iconName="upload" />
          </div>

          <div className="admin-file-drop-area__text">
            <span className="admin-file-drop-area__main-text">
              Drag folders here{" "}
            </span>
            <button
              type="button"
              className="admin-file-drop-area__browse-button"
              onClick={handleBrowseClick}
            >
              or browse
            </button>
          </div>

          <p className="admin-file-drop-area__support-text">
            Supports music folders with multiple files
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminFileDropArea;
