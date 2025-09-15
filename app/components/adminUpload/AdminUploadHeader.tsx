import React from "react";
import MuzaButton from "~/controls/MuzaButton";
import "./AdminUploadHeader.scss";

interface AdminUploadHeaderProps {
  onCancel: () => void;
}

const AdminUploadHeader: React.FC<AdminUploadHeaderProps> = ({ onCancel }) => {
  return (
    <div className="admin-upload-header">
      <div className="admin-upload-header__content">
        <h1 className="admin-upload-header__title">Muza Utils – File Upload</h1>
        <MuzaButton
          content="Cancel all"
          onClick={onCancel}
          className="admin-upload-header__cancel-button"
          size="medium"
        />
      </div>
    </div>
  );
};

export default AdminUploadHeader;
