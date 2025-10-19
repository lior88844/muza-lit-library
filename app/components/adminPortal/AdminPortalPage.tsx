import React, { useState } from "react";
import "./AdminPortalPage.scss";
import MuzaIcon from "~/icons/MuzaIcon";
import { PageEditorTable } from "./PageEditorTable";

interface Section {
  id: number;
  name: string;
  type: "Playlists" | "Songs" | "Albums" | "Artists";
  trackNumber: number;
}

export const AdminPortalPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([
    { id: 1, name: "Daily Muze", type: "Playlists", trackNumber: 6 },
    {
      id: 2,
      name: "Fallen Leafs for Fallen Angels",
      type: "Songs",
      trackNumber: 0,
    },
    { id: 3, name: "Daily Muze", type: "Albums", trackNumber: 12 },
    { id: 4, name: "Daily Muze", type: "Artists", trackNumber: 18 },
    { id: 5, name: "Daily Muze", type: "Playlists", trackNumber: 6 },
    { id: 6, name: "Daily Muze", type: "Albums", trackNumber: 6 },
    { id: 7, name: "Daily Muze", type: "Playlists", trackNumber: 6 },
    { id: 8, name: "Daily Muze", type: "Albums", trackNumber: 9 },
    { id: 9, name: "Daily Muze", type: "Songs", trackNumber: 18 },
    { id: 10, name: "Daily Muze", type: "Albums", trackNumber: 9 },
  ]);

  const handleSectionNameChange = (id: number, name: string) => {
    setSections(prev =>
      prev.map(section => (section.id === id ? { ...section, name } : section))
    );
  };

  const handleSectionTypeChange = (id: number, type: Section["type"]) => {
    setSections(prev =>
      prev.map(section => (section.id === id ? { ...section, type } : section))
    );
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving sections:", sections);
  };

  return (
    <div className="admin-portal-page">
      {/* Header */}
      <div className="admin-portal-header">
        <div className="admin-portal-header-content">
          <h1 className="admin-portal-title">
            Muza Admin Portal – Page Editor
          </h1>
          <button
            className="admin-portal-cancel-button"
            onClick={() => console.log("Cancel all")}
          >
            Cancel all
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-portal-controls">
        <div className="admin-portal-controls-content">
          <div className="admin-portal-dropdown">
            <button className="admin-portal-dropdown-button">
              Home
              <MuzaIcon iconName="ChevronDown" />
            </button>
          </div>
          <button className="admin-portal-upload-button">
            Upload Music
            <MuzaIcon iconName="cloud-upload" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-portal-table-container">
        <PageEditorTable
          sections={sections}
          onSectionNameChange={handleSectionNameChange}
          onSectionTypeChange={handleSectionTypeChange}
        />

        {/* Table Footer */}
        <div className="admin-portal-table-footer">
          <div className="admin-portal-table-footer-content">
            <button className="admin-portal-save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
