import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./AdminPortal.scss";
import MuzaIcon from "~/icons/MuzaIcon";

interface SectionData {
  id: number;
  name: string;
  type: string;
  content: string;
  trackNumber: number;
}

export default function AdminPortal() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: 1,
      name: "Daily Muze",
      type: "Playlists",
      content: "Edit",
      trackNumber: 6,
    },
    {
      id: 2,
      name: "Fallen Leafs for Fallen Angels",
      type: "Songs",
      content: "Edit",
      trackNumber: 0,
    },
    {
      id: 3,
      name: "Daily Muze",
      type: "Albums",
      content: "Edit",
      trackNumber: 12,
    },
    {
      id: 4,
      name: "Daily Muze",
      type: "Artists",
      content: "Edit",
      trackNumber: 18,
    },
    {
      id: 5,
      name: "Daily Muze",
      type: "Playlists",
      content: "Edit",
      trackNumber: 6,
    },
    {
      id: 6,
      name: "Daily Muze",
      type: "Albums",
      content: "Edit",
      trackNumber: 6,
    },
    {
      id: 7,
      name: "Daily Muze",
      type: "Playlists",
      content: "Edit",
      trackNumber: 6,
    },
    {
      id: 8,
      name: "Daily Muze",
      type: "Songs",
      content: "Edit",
      trackNumber: 9,
    },
    {
      id: 9,
      name: "Daily Muze",
      type: "Albums",
      content: "Edit",
      trackNumber: 18,
    },
    {
      id: 10,
      name: "Daily Muze",
      type: "Artists",
      content: "Edit",
      trackNumber: 9,
    },
  ]);

  const [selectedPage, setSelectedPage] = useState("Home");

  const handleSectionNameChange = (id: number, newName: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, name: newName } : section
      )
    );
  };

  const handleSectionTypeChange = (id: number, newType: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, type: newType } : section
      )
    );
  };

  const handleSave = () => {
    console.log("Saving sections:", sections);
    // Implement save logic here
  };

  const handleCancelAll = () => {
    console.log("Canceling all changes");
    // Implement cancel logic here
  };

  return (
    <div className="admin-portal">
      <div className="admin-portal-inner">
        {/* Header */}
        <div className="admin-portal-header">
          <div className="admin-portal-header-content">
            <h1 className="admin-portal-title">
              Muza Admin Portal – Page Editor
            </h1>
            <button
              className="admin-portal-cancel-btn"
              onClick={handleCancelAll}
            >
              Cancel all
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-portal-controls">
          <div className="admin-portal-controls-content">
            <div className="admin-portal-dropdown">
              <button className="admin-portal-dropdown-btn">
                <span>{selectedPage}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <button
              className="admin-portal-upload-btn"
              onClick={() => navigate("/admin-upload")}
            >
              <span>Upload Music</span>
              <MuzaIcon iconName="upload" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-portal-table-container">
          <div className="admin-portal-table">
            {/* Table Header */}
            <div className="admin-portal-table-header">
              <div className="admin-portal-table-column admin-portal-table-column-number">
                <div className="admin-portal-table-header-cell">
                  <span></span>
                </div>
              </div>
              <div className="admin-portal-table-column admin-portal-table-column-section">
                <div className="admin-portal-table-header-cell">
                  <span>Section Name</span>
                </div>
              </div>
              <div className="admin-portal-table-column admin-portal-table-column-type">
                <div className="admin-portal-table-header-cell">
                  <span>Type</span>
                </div>
              </div>
              <div className="admin-portal-table-column admin-portal-table-column-content">
                <div className="admin-portal-table-header-cell">
                  <span>Content</span>
                </div>
              </div>
              <div className="admin-portal-table-column admin-portal-table-column-track">
                <div
                  className="admin-portal-table-header-cell"
                  style={{ alignItems: "flex-end" }}
                >
                  <span>Track Number</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="admin-portal-table-body">
              {sections.map((section, index) => (
                <div key={section.id} className="admin-portal-table-row">
                  <div className="admin-portal-table-column admin-portal-table-column-number">
                    <div className="admin-portal-table-cell">
                      <span>{index + 1}</span>
                    </div>
                  </div>
                  <div className="admin-portal-table-column admin-portal-table-column-section">
                    <div className="admin-portal-table-cell">
                      <input
                        type="text"
                        value={section.name}
                        onChange={e =>
                          handleSectionNameChange(section.id, e.target.value)
                        }
                        className="admin-portal-input"
                      />
                    </div>
                  </div>
                  <div className="admin-portal-table-column admin-portal-table-column-type">
                    <div className="admin-portal-table-cell">
                      <div className="admin-portal-dropdown">
                        <button className="admin-portal-dropdown-btn">
                          <span>{section.type}</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="admin-portal-table-column admin-portal-table-column-content">
                    <div className="admin-portal-table-cell">
                      <button className="admin-portal-edit-btn">
                        {section.content}
                      </button>
                    </div>
                  </div>
                  <div className="admin-portal-table-column admin-portal-table-column-track">
                    <div className="admin-portal-table-cell">
                      <span className="admin-portal-track-number">
                        {section.trackNumber}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Footer */}
          <div className="admin-portal-table-footer">
            <div className="admin-portal-table-footer-content">
              <button className="admin-portal-save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
