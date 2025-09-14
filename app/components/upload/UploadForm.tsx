import React from "react";
import MuzaInputField from "~/controls/MuzaInputField";
import MuzaIcon from "~/icons/MuzaIcon";
import type { UploadFormData, Musician } from "~/appData/uploadStore";
import "./UploadForm.scss";

interface UploadFormProps {
  formData: UploadFormData;
  musicians: Musician[];
  onFormDataChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMusicianChange: (
    index: number,
    field: keyof Musician
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddMusician: () => void;
  onRemoveMusician: (index: number) => void;
  onFindAlbumDetails?: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  musicians,
  onFormDataChange,
  onMusicianChange,
  onAddMusician,
  onRemoveMusician,
  onFindAlbumDetails,
}) => {
  return (
    <div className="upload-form">
      <div className="upload-form-container">
        {/* General Info Section */}
        <div className="form-card">
          <div className="form-card-header">
            <span className="form-card-title">General Info</span>
          </div>

          <div className="form-fields">
            <MuzaInputField
              name="albumTitle"
              label="Album Title"
              placeholder="Your album's title"
              value={formData.albumTitle}
              onChange={onFormDataChange("albumTitle")}
            />

            <MuzaInputField
              name="mainArtist"
              label="Main Artist"
              placeholder="The artist's name"
              value={formData.mainArtist}
              onChange={onFormDataChange("mainArtist")}
            />
          </div>

          <div className="section-description-row">
            <span className="section-description">
              We add details if we find a match; otherwise fill in manually.
            </span>
            <button className="find-album-button" onClick={onFindAlbumDetails}>
              <MuzaIcon iconName="sparkles" className="sparkles-icon" />
              <span>Find Album Details</span>
            </button>
          </div>
        </div>

        {/* Recording Details Section */}
        <div className="form-card">
          <div className="section-header-row">
            <span className="section-title">Recording Details</span>
            <div className="section-divider"></div>
          </div>

          <div className="form-fields">
            <MuzaInputField
              name="bandName"
              label="Band Name (Optional)"
              placeholder="Your band's name"
              value={formData.bandName}
              onChange={onFormDataChange("bandName")}
            />

            <div className="date-field">
              <MuzaInputField
                name="recordingDate"
                label="Recording Date"
                placeholder="Select Date"
                type="date"
                value={formData.recordingDate}
                onChange={onFormDataChange("recordingDate")}
                leadingIcon="calendar"
              />
            </div>
          </div>
        </div>

        {/* Additional Musicians - Individual Cards */}
        {musicians.map((musician, index) => (
          <div key={index} className="form-card musician-card">
            <div className="section-header-row">
              <span className="section-title">Additional Musicians</span>
              <div className="section-divider"></div>
            </div>

            <div className="musician-fields">
              <div className="musician-inputs">
                <MuzaInputField
                  name={`musicianName-${index}`}
                  label="Musician's Name"
                  placeholder="Musician's Name"
                  value={musician.name}
                  onChange={onMusicianChange(index, "name")}
                />

                <MuzaInputField
                  name={`musicianInstruments-${index}`}
                  label="Instruments"
                  placeholder="type in instruments"
                  helperText="Separate multiple instruments with commas."
                  value={musician.instruments}
                  onChange={onMusicianChange(index, "instruments")}
                />
              </div>

              {musicians.length > 1 && index > 0 && (
                <div className="musician-actions">
                  <button
                    className="delete-musician-button"
                    onClick={() => onRemoveMusician(index)}
                    type="button"
                  >
                    <MuzaIcon iconName="trash" className="trash-icon" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Musician Button - Outside cards */}
        <div className="add-musician-container">
          <button className="add-musician-button" onClick={onAddMusician}>
            <MuzaIcon iconName="plus" className="plus-icon" />
            <span>Add Musician</span>
          </button>
        </div>

        {/* Notes & Credits Section */}
        <div className="form-card">
          <div className="section-header-row">
            <span className="section-title">Notes & Credits</span>
            <div className="section-divider"></div>
          </div>

          <div className="form-fields">
            <div className="textarea-field">
              <label htmlFor="linerNotes">Liner Notes</label>
              <textarea
                id="linerNotes"
                placeholder=""
                value={formData.linerNotes}
                onChange={onFormDataChange("linerNotes")}
                rows={4}
              />
            </div>

            <div className="textarea-field">
              <label htmlFor="otherCredits">Other Credits</label>
              <textarea
                id="otherCredits"
                placeholder=""
                value={formData.otherCredits}
                onChange={onFormDataChange("otherCredits")}
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
export type { UploadFormData, Musician };
