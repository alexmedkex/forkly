'use strict';

const path = require('path')
const fs = require('fs')
const Grid = require('mongoose-gridfs')
const mongoose = require('mongoose')
const config = require('./db-migrations')

async function gridFs() {
    await mongoose.connect(process.env.DB_MONGO_URL, config.mongodb.options)
    return gridFs = Grid({
      collection: 'documents',
      model: 'DocumentFile',
      mongooseConnection: mongoose.connection
    })
  }

module.exports = {
    async createDocumentTemplate(db, {filePath, fileName, collectionName, template, mimeType} ) {
        await db.collection(collectionName).deleteOne({ _id: template })

        const gfs = await gridFs()
        const fp = path.resolve(__dirname, filePath)
        const fileId = await new Promise((resolve, reject) => {
          gfs.model.write(
            { filename: fileName, contentType: mimeType },
            fs.createReadStream(fp),
            (err, file) => {
              err ? reject(err) : resolve(file._id)
            })
        })
    
        const docTemplate = {
          _id: template,
          content: { fileId: fileId }
        }
        await db.collection(collectionName).insertOne(docTemplate)
    },

    async removeDocumentTemplate(db, {fileName, collectionName, template}) {
        var gfs = await gridFs()
        await new Promise((resolve, reject) => {
          gfs.model.findOne({ filename: fileName }, (error, content) => {
            if (error) reject(error)
    
            gfs.model.unlinkById(content._id, (unlinkError, deletedFile) => {
              unlinkError ? reject(unlinkError) : resolve(deletedFile)
            })
          })
        })
    
        await db.collection(collectionName)
          .deleteOne({ _id: template })
    }
}
