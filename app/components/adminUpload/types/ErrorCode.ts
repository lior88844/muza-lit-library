export enum UploadErrorCodeEnum {
  ALL_FILES_INVALID = 1001,
  PARTIAL_UPLOAD = 1002,
  ALBUM_ALREADY_EXISTS = 1003,
  DISCOVERY_SERVICE_ERROR = 1004,
  UPLOAD_SERVICE_ERROR = 1005,
  COVER_ART_DOWNLOAD_ERROR = 1006,
  TRACK_MATCHING_ERROR = 1007,
  TRACK_UPLOAD_ERROR = 1008,
}

export const UPLOAD_ERROR_CODES = {
  [UploadErrorCodeEnum.ALL_FILES_INVALID]: {
    code: UploadErrorCodeEnum.ALL_FILES_INVALID,
    title: 'All Files Invalid',
    description:
      'No FLAC files found in this folder. All files were skipped because they are not in FLAC format.',
  },
  [UploadErrorCodeEnum.PARTIAL_UPLOAD]: {
    code: UploadErrorCodeEnum.PARTIAL_UPLOAD,
    title: 'Partial Upload',
    description:
      'Some files were skipped because they are not in FLAC format. Only FLAC files will be processed.',
  },
  [UploadErrorCodeEnum.ALBUM_ALREADY_EXISTS]: {
    code: UploadErrorCodeEnum.ALBUM_ALREADY_EXISTS,
    title: 'Album Already Exists',
    description: 'The album already exists in the database.',
  },
  [UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR]: {
    code: UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR,
    title: 'Error Connecting to Discovery Service',
    description: 'Error connecting to discovery service.',
  },
  [UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR]: {
    code: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
    title: 'Error Uploading Album',
    description: 'Error uploading album.',
  },
  [UploadErrorCodeEnum.COVER_ART_DOWNLOAD_ERROR]: {
    code: UploadErrorCodeEnum.COVER_ART_DOWNLOAD_ERROR,
    title: 'Error Downloading Cover Art',
    description: 'Error downloading cover art.',
  },
  [UploadErrorCodeEnum.TRACK_MATCHING_ERROR]: {
    code: UploadErrorCodeEnum.TRACK_MATCHING_ERROR,
    title: 'Error Matching Tracks',
    description: 'Error matching tracks.',
  },
  [UploadErrorCodeEnum.TRACK_UPLOAD_ERROR]: {
    code: UploadErrorCodeEnum.TRACK_UPLOAD_ERROR,
    title: 'Error Uploading Tracks',
    description: 'Error uploading tracks.',
  },
} as const
