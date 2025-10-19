import React from "react";
import MuzaIcon from "~/icons/MuzaIcon";

interface Section {
  id: number;
  name: string;
  type: "Playlists" | "Songs" | "Albums" | "Artists";
  trackNumber: number;
}

interface PageEditorTableProps {
  sections: Section[];
  onSectionNameChange: (id: number, name: string) => void;
  onSectionTypeChange: (id: number, type: Section["type"]) => void;
}

export const PageEditorTable: React.FC<PageEditorTableProps> = ({
  sections,
  onSectionNameChange,
  onSectionTypeChange,
}) => {
  const sectionTypes: Section["type"][] = [
    "Playlists",
    "Songs",
    "Albums",
    "Artists",
  ];

  return (
    <div className="page-editor-table">
      <div className="page-editor-table-content">
        {/* Row Numbers Column */}
        <div className="page-editor-table-column page-editor-table-column--numbers">
          <div className="page-editor-table-header">
            <div className="page-editor-table-header-cell">&nbsp;</div>
          </div>
          {sections.map(section => (
            <div
              key={`number-${section.id}`}
              className="page-editor-table-cell"
            >
              <div className="page-editor-table-cell-content">
                <span className="page-editor-table-number">{section.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Section Name Column */}
        <div className="page-editor-table-column page-editor-table-column--name">
          <div className="page-editor-table-header">
            <div className="page-editor-table-header-cell">
              <span className="page-editor-table-header-text">
                Section Name
              </span>
            </div>
          </div>
          {sections.map(section => (
            <div key={`name-${section.id}`} className="page-editor-table-cell">
              <div className="page-editor-table-cell-content">
                <input
                  type="text"
                  value={section.name}
                  onChange={e =>
                    onSectionNameChange(section.id, e.target.value)
                  }
                  className="page-editor-table-input"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Type Column */}
        <div className="page-editor-table-column page-editor-table-column--type">
          <div className="page-editor-table-header">
            <div className="page-editor-table-header-cell">
              <span className="page-editor-table-header-text">Type</span>
            </div>
          </div>
          {sections.map(section => (
            <div key={`type-${section.id}`} className="page-editor-table-cell">
              <div className="page-editor-table-cell-content">
                <select
                  value={section.type}
                  onChange={e =>
                    onSectionTypeChange(
                      section.id,
                      e.target.value as Section["type"]
                    )
                  }
                  className="page-editor-table-select"
                >
                  {sectionTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Content Column */}
        <div className="page-editor-table-column page-editor-table-column--content">
          <div className="page-editor-table-header">
            <div className="page-editor-table-header-cell">
              <span className="page-editor-table-header-text">Content</span>
            </div>
          </div>
          {sections.map(section => (
            <div
              key={`content-${section.id}`}
              className="page-editor-table-cell"
            >
              <div className="page-editor-table-cell-content">
                <button
                  className="page-editor-table-edit-button"
                  onClick={() => console.log(`Edit section ${section.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Track Number Column */}
        <div className="page-editor-table-column page-editor-table-column--track">
          <div className="page-editor-table-header">
            <div className="page-editor-table-header-cell">
              <button
                className="page-editor-table-track-header-button"
                onClick={() => {}}
              >
                Track Number
              </button>
            </div>
          </div>
          {sections.map(section => (
            <div key={`track-${section.id}`} className="page-editor-table-cell">
              <div className="page-editor-table-cell-content">
                <span className="page-editor-table-track-number">
                  {section.trackNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
