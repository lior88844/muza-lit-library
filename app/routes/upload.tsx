import React from "react";
import { useNavigate } from "react-router";
import { useUploadStore } from "~/appData/uploadStore";
import UploadHeader from "~/components/upload/UploadHeader";
import UploadStepOne from "~/components/upload/steps/UploadStepOne";
import UploadStepTwo from "~/components/upload/steps/UploadStepTwo";
import UploadStepThree from "~/components/upload/steps/UploadStepThree";
import UploadFooter from "~/components/upload/UploadFooter";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";
import "../components/upload/steps/UploadStepOne.scss";

export default function Upload() {
  const navigate = useNavigate();

  // Get state and actions from upload store
  const {
    currentStep,
    formData,
    musicians,
    audioFiles,
    trackMetadata,
    coverImage,
    isTestMode,

    // Actions
    updateFormData,
    updateMusician,
    addMusician,
    removeMusician,
    setCoverImage,
    setAudioFiles,
    updateTrackMetadata,
    deleteTrack,
    reorderTracks,
    validateCurrentStep,
    nextStep,
    previousStep,
    resetUpload,
    getUploadData,
    setTestMode,
    populateTestData,
  } = useUploadStore();

  const handleTestModeToggle = async (enabled: boolean) => {
    setTestMode(enabled);
    if (enabled && currentStep === 1) {
      // Immediately populate test data when test mode is enabled on step 1
      await populateTestData();
    }
  };

  const handleCancel = () => {
    // Reset test mode if it's currently enabled
    if (isTestMode) {
      setTestMode(false);
    }
    resetUpload();
    navigate("/");
  };

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateFormData(field as keyof typeof formData, e.target.value);
    };

  const handleMusicianChange =
    (index: number, field: keyof (typeof musicians)[0]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateMusician(index, field, e.target.value);
    };

  const handleFindAlbumDetails = () => {
    // TODO: Implement album details search functionality
    console.log(
      "Finding album details for:",
      formData.albumTitle,
      "by",
      formData.mainArtist
    );
    // This could call an API to search for album information
    // and populate the form fields automatically
  };

  const handleFileUpload = (files: File[]) => {
    setAudioFiles(files);
  };

  const handleCoverUpload = (file: File) => {
    setCoverImage(file);
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      // Final submit logic
      const albumData = getUploadData();
      console.log("Album data ready for upload:", albumData);
      alert(
        `Upload complete! Album: "${formData.albumTitle}" with ${trackMetadata.length} tracks`
      );
      // Reset test mode if it's currently enabled
      if (isTestMode) {
        setTestMode(false);
      }
      resetUpload();
      navigate("/");
    } else {
      await nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadStepOne
            formData={formData}
            musicians={musicians}
            audioFiles={audioFiles}
            onFormDataChange={handleInputChange}
            onMusicianChange={handleMusicianChange}
            onAddMusician={addMusician}
            onRemoveMusician={removeMusician}
            onCoverUpload={handleCoverUpload}
            onFileUpload={handleFileUpload}
            onFindAlbumDetails={handleFindAlbumDetails}
          />
        );
      case 2:
        return (
          <UploadStepTwo
            trackMetadata={trackMetadata}
            onTrackMetadataChange={updateTrackMetadata}
            onDeleteTrack={deleteTrack}
            onReorderTracks={reorderTracks}
          />
        );
      case 3:
        return (
          <UploadStepThree
            formData={formData}
            trackMetadata={trackMetadata}
            coverImage={coverImage}
            onSave={() => {
              // Handle save functionality if needed
              console.log("Save album data");
            }}
            onPublish={() => {
              // This will be handled by the footer's publish button
              console.log("Publish album");
            }}
          />
        );
      default:
        return null;
    }
  };

  const isNextDisabled = !validateCurrentStep();

  return (
    <div className="upload-page">
      <UploadHeader
        title="Album Upload"
        onCancel={handleCancel}
        isTestMode={isTestMode}
        onTestModeToggle={handleTestModeToggle}
      />

      {renderStepContent()}

      <UploadFooter
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isNextDisabled={isNextDisabled}
        showBack={currentStep > 1}
        nextLabel={currentStep === 3 ? "Publish" : "Next"}
      />
    </div>
  );
}
