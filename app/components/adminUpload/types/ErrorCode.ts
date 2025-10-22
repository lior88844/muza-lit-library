export enum UploadErrorCodeEnum {
  ALL_FILES_INVALID = 1001,
  PARTIAL_UPLOAD = 1002,
  ALBUM_ALREADY_EXISTS = 1003,
  DISCOVERY_SERVICE_ERROR = 1004,
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
} as const
