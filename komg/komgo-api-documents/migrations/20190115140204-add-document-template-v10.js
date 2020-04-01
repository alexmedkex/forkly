'use strict';

const path = require('path')
const fs = require('fs')
const Grid = require('mongoose-gridfs')
const mongoose = require('mongoose')
const config = require('../config/db-migrations')

const MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const FILE_PATH = '../documents/defaults/letter-of-credit-template-v10.docx'
const DEFAULT_TEMPLATE = '4c88f238-dd3d-11e8-9f8b-f2801f1b9fd1'
const FILE_NAME = 'default-document-template'
const COLLECTION_NAME = 'document-templates'

module.exports = {
  async up(db) {
    // delete faulty template in qa
    await db.collection(COLLECTION_NAME).deleteOne({ _id: DEFAULT_TEMPLATE })

    const gfs = await gridFs()
    const fp = path.resolve(__dirname, FILE_PATH)
    const fileId = await new Promise((resolve, reject) => {
      gfs.model.write(
        { filename: FILE_NAME, contentType: MIME_TYPE },
        fs.createReadStream(fp),
        (err, file) => {
          err ? reject(err) : resolve(file._id)
        })
    })

    const docTemplate = {
      _id: DEFAULT_TEMPLATE,
      content: { fileId: fileId }
    }
    await db.collection(COLLECTION_NAME).insertOne(docTemplate)
  },

  async down(db) {
    var gfs = await gridFs()
    await new Promise((resolve, reject) => {
      gfs.model.findOne({ filename: FILE_NAME }, (error, content) => {
        if (error) reject(error)

        gfs.model.unlinkById(content._id, (unlinkError, deletedFile) => {
          unlinkError ? reject(unlinkError) : resolve(deletedFile)
        })
      })
    })

    await db.collection(COLLECTION_NAME)
      .deleteOne({ _id: DEFAULT_TEMPLATE })
  }
}

async function gridFs() {
  await mongoose.connect(process.env.DB_MONGO_URL, config.mongodb.options)
  return gridFs = Grid({
    collection: 'documents',
    model: 'DocumentFile',
    mongooseConnection: mongoose.connection
  })
}
