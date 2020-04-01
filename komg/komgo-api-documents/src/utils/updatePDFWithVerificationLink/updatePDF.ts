import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import * as fs from 'fs'
import * as HummusRecipe from 'hummus-recipe'
import moment = require('moment')
import * as os from 'os'
import { v4 as uuid4 } from 'uuid'

import { ErrorName } from '../../utils/ErrorName'

const logger = getLogger('updatePDF')

// Interfaces
export interface IDocumentParams {
  pageCount: number
  pageWidth: number
  pageHeight: number
  smalestSideSize: number
  textWidth: number
  fontSize: number
}

export interface IBanerParams {
  fullPageHeigth: number
  headerHeigth: number
  qrStartPointX: number
  qrStartPointY: number
  qrWidth: number
  smallFontSize: number
  textPointX1: number
  text2PointX1: number
  textPointY1: number
  smallTextPointY: number
  linePointX: number
  linePointY1: number
  linePointY2: number
}

export interface IPhrases {
  registered: string
  withKomgo: string
  byCompanyName: string
  onDate: string
}

export interface IPDFBaner {
  smalestSideSize: number
  fontSize: number
  textWidth: number
  pageHeight: number
  pageWidth: number
  texts: IPhrases
}

// Constants
export const KOMGO_MAIN_COLOR = '#5700b5'
export const KOMGO_SECOND_COLOR = '#727272'
export const KOMGO_LINE_COLOR = '#c5c5c5'
export const DESIGN_WIDTH = 2480
export const DESIGN_HEIGHT = 240
export const FONT_NAME = 'arial'

export const getTmpFileName = () => {
  const tempDir = os.tmpdir()
  return `${tempDir}/${uuid4()}.pdf`
}

export const getOrigDocumentParams = (pdfWriter, registered): IDocumentParams => {
  const pdfMetadata = pdfWriter.info().metadata['1']
  const pageCount = pdfWriter.metadata.pages
  const pageWidth = Math.round(pdfMetadata.width)
  const pageHeight = Math.round(pdfMetadata.height)
  const smalestSideSize = pageWidth < pageHeight ? pageWidth : pageHeight
  const fontCoef = DESIGN_WIDTH / 60
  const fontSize = Math.round(smalestSideSize / fontCoef)

  const tmpFontObject = pdfWriter.writer.getFontForFile(pdfWriter.fonts[FONT_NAME])
  const textWidth = tmpFontObject.calculateTextDimensions(registered, fontSize).width

  return {
    pageCount,
    pageWidth,
    pageHeight,
    smalestSideSize,
    textWidth,
    fontSize
  }
}

export const getBannerParams = (
  smalestSideSize: number,
  fontSize: number,
  textWidth: number,
  pageHeight: number,
  pageWidth: number
): IBanerParams => {
  // Coefficients
  const headerHeigthCoef = DESIGN_WIDTH / DESIGN_HEIGHT
  const smallFontCoef = DESIGN_WIDTH / 50
  const fontLeftPaddingCoef = DESIGN_WIDTH / 120
  const fontTopPaddingCoef = DESIGN_WIDTH / 80
  const qrWidthCoef = DESIGN_WIDTH / 180
  const qrStartPointXCoef = DESIGN_WIDTH / 100
  const qrStartPointYCoef = DESIGN_WIDTH / 35
  const textSpaceCoef = DESIGN_WIDTH / (63 * 2)
  const linePaddingCoef = DESIGN_WIDTH / 69

  // banner params
  const headerHeigth = Math.round(smalestSideSize / headerHeigthCoef)
  const fullPageHeigth = pageHeight + headerHeigth
  const smallFontSize = Math.round(smalestSideSize / smallFontCoef)
  const qrWidth = Math.round(smalestSideSize / qrWidthCoef)
  const qrStartPointX = pageWidth - (Math.round(smalestSideSize / qrStartPointXCoef) + qrWidth)
  const qrStartPointY = Math.round(smalestSideSize / qrStartPointYCoef)
  const textPointX1 = Math.round(smalestSideSize / fontLeftPaddingCoef)
  const text2PointX1 = textPointX1 + textWidth + Math.round(smalestSideSize / textSpaceCoef)
  const textPointY1 = Math.round(smalestSideSize / fontTopPaddingCoef) + fontSize / 2
  const smallTextPointY = Math.round(smalestSideSize / fontTopPaddingCoef + smallFontSize * 2.2)
  const linePointY1 = textPointY1 - fontSize * 0.7
  const linePointY2 = smallTextPointY + smallFontSize * 0.05
  const linePointX = textPointX1 + textWidth + Math.round(smalestSideSize / linePaddingCoef)

  return {
    fullPageHeigth,
    headerHeigth,
    qrStartPointX,
    qrStartPointY,
    qrWidth,
    smallFontSize,
    textPointX1,
    textPointY1,
    text2PointX1,
    smallTextPointY,
    linePointX,
    linePointY1,
    linePointY2
  }
}

export const storeFirstPage = (sourceFileName: string, resultFileName: string): void => {
  const firstPageSource = new HummusRecipe('new', resultFileName)
  firstPageSource.appendPage(sourceFileName, [1])
  firstPageSource.endPage().endPDF(newPdf => newPdf)
}

export const addBanerToFirstPage = (fileFirstPage: string, fileNameResult: string, banerParams: IPDFBaner): void => {
  const { smalestSideSize, fontSize, textWidth, pageHeight, pageWidth, texts } = banerParams
  const { registered, withKomgo, byCompanyName, onDate } = texts

  const {
    fullPageHeigth,
    headerHeigth,
    qrStartPointX,
    qrStartPointY,
    qrWidth,
    smallFontSize,
    textPointX1,
    text2PointX1,
    textPointY1,
    smallTextPointY,
    linePointX,
    linePointY1,
    linePointY2
  } = getBannerParams(smalestSideSize, fontSize, textWidth, pageHeight, pageWidth)

  const pdfWriterResult = new HummusRecipe('new', fileNameResult)

  pdfWriterResult
    .createPage(pageWidth, fullPageHeigth)
    .image('./src/utils/updatePDFWithVerificationLink/QR-code.png', qrStartPointX, qrStartPointY, {
      width: qrWidth,
      keepAspectRatio: true
    })
    .text(registered, textPointX1, textPointY1, {
      color: KOMGO_MAIN_COLOR,
      size: fontSize,
      font: FONT_NAME
    })
    .text(withKomgo, textPointX1, smallTextPointY, {
      color: KOMGO_SECOND_COLOR,
      size: smallFontSize,
      font: FONT_NAME
    })
    .line([[linePointX, linePointY1], [linePointX, linePointY2]], {
      color: KOMGO_LINE_COLOR,
      lineWidth: 0.5
    })
    .text(byCompanyName, text2PointX1, textPointY1, {
      color: KOMGO_MAIN_COLOR,
      size: fontSize,
      font: FONT_NAME
    })
    .text(onDate, text2PointX1, smallTextPointY, {
      color: KOMGO_SECOND_COLOR,
      size: smallFontSize,
      font: FONT_NAME
    })
    .overlay(fileFirstPage, 0, headerHeigth, { scale: 1 })
  pdfWriterResult.endPage().endPDF(newPdf => newPdf)
}

export const addPagesToFirstPage = (
  firstPageFileName: string,
  sourceFileName: string,
  resultFileName: string,
  pageAmount: number
): void => {
  const allPagesArr = []
  const pdfWriterMultiPage = new HummusRecipe(firstPageFileName, resultFileName)
  // create array of page numbers
  for (let index = 2; index <= pageAmount; index++) {
    allPagesArr.push(index)
  }
  pdfWriterMultiPage.appendPage(sourceFileName, allPagesArr)
  pdfWriterMultiPage.endPage().endPDF(newPdf => newPdf)
}

export const deleteTmpFiles = fileNameArr => {
  fileNameArr.forEach(fileName => {
    try {
      fs.unlinkSync(fileName)
      // file removed
    } catch (err) {
      logger.error(ErrorCode.DatabaseInvalidData, ErrorName.DeleteDocumentError, 'Failed to delete document', {
        fileName,
        errorMessage: err.message
      })
    }
  })
}

export const updatePDF = (file: Buffer, companyName: string): Buffer => {
  const fileNameArr = []

  try {
    const fileNameSource = getTmpFileName()
    fileNameArr.push(fileNameSource)
    const fileNameResult = getTmpFileName()
    fileNameArr.push(fileNameResult)
    const fileFirstPage = getTmpFileName()
    fileNameArr.push(fileFirstPage)

    const date = moment().format('DD MMM YYYY')
    const registered = 'Registered'
    const withKomgo = 'with komgo'
    const byCompanyName = `By ${companyName}`
    const onDate = `on ${date}`
    const texts = { registered, withKomgo, byCompanyName, onDate }

    const pdfWriter = new HummusRecipe(file, fileNameSource)
    const { pageCount, pageWidth, pageHeight, smalestSideSize, textWidth, fontSize } = getOrigDocumentParams(
      pdfWriter,
      registered
    )
    pdfWriter.endPage().endPDF(newPdf => newPdf)

    const paramsForBanner: IPDFBaner = { smalestSideSize, fontSize, textWidth, pageHeight, pageWidth, texts }

    storeFirstPage(fileNameSource, fileFirstPage)
    addBanerToFirstPage(fileFirstPage, fileNameResult, paramsForBanner)

    let finalSource = fileNameResult

    // add all pages from original source to file with logo if exist
    if (pageCount > 1) {
      const fileWithAllPages = getTmpFileName()
      fileNameArr.push(fileWithAllPages)
      addPagesToFirstPage(fileNameResult, fileNameSource, fileWithAllPages, pageCount)
      finalSource = fileWithAllPages
    }

    // read file to return it like stream
    return fs.readFileSync(finalSource)
  } finally {
    // Remove all files from tmp path
    deleteTmpFiles(fileNameArr)
  }
}
