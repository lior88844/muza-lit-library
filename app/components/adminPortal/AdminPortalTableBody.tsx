import MuzaIcon from "~/icons/MuzaIcon";

interface SectionData {
  id: number;
  name: string;
  type: string;
  content: string;
  trackNumber: number;
}

interface AdminPortalTableBodyProps {
  sections: SectionData[];
  handleSectionNameChange: (id: number, newName: string) => void;
  handleSectionTypeChange: (id: number, newType: string) => void;
}

export default function AdminPortalTableBody({
  sections,
  handleSectionNameChange,
  handleSectionTypeChange,
}: AdminPortalTableBodyProps) {
  return (
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
                  <MuzaIcon iconName="ChevronDown" />
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
  );
}
