// https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
export enum PERMITTED_MIME_TYPES {
  PNG_MIME_TYPE = 'image/png',
  JPEG_MIME_TYPE = 'image/jpeg',
  PDF_MIME_TYPE = 'application/pdf',
  DOC_MIME_TYPE = 'application/msword',
  DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS_MIME_TYPE = 'application/vnd.ms-excel',
  XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT_MIME_TYPE = 'application/vnd.ms-powerpoint',
  PPTX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}
