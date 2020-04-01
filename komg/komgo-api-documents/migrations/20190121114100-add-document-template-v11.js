'use strict';

const migrationHelper = require('../config/template-migration-helper')

const FILE_PATH = '../documents/defaults/letter-of-credit-template-v11.docx'
const MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const DEFAULT_TEMPLATE = '4c88f238-dd3d-11e8-9f8b-f2801f1b9fd1'
const FILE_NAME = 'default-document-template'
const COLLECTION_NAME = 'document-templates'


module.exports = {
  async up(db) {
    await migrationHelper.createDocumentTemplate(db, {
      filePath: FILE_PATH, 
      mimeType: MIME_TYPE, 
      template: DEFAULT_TEMPLATE, 
      fileName: FILE_NAME, 
      collectionName: COLLECTION_NAME
    })
  },

  async down(db) {
    await migrationHelper.removeDocumentTemplate(db, {
      fileName: FILE_NAME, 
      collectionName: COLLECTION_NAME, 
      template: DEFAULT_TEMPLATE
    })
  }
}
