jest.mock('hummus-recipe', () => MockedHummus)

const readFileSyncMock = jest.fn(() => new Buffer('Test'))
const unlinkSyncMock = jest.fn()
jest.mock('fs', () => ({ readFileSync: readFileSyncMock, unlinkSync: unlinkSyncMock }))

const file = new Buffer('Test')

const metadataMock = { '1': { width: 600, height: 800 }, pages: 3 }
const infoMock = jest.fn(() => ({ metadata: metadataMock }))
const attachURLLinktoCurrentPage = jest.fn(() => null)
const getFontForFile = jest.fn(() => ({ calculateTextDimensions: () => ({ width: 10 }) }))
const imageMock = jest.fn(() => new MockedHummus())
const textMock = jest.fn(() => new MockedHummus())
const lineMock = jest.fn(() => new MockedHummus())
const editPageMock = jest.fn(() => new MockedHummus())
const createPageMock = jest.fn(() => new MockedHummus())
const appendPageMock = jest.fn(() => new MockedHummus())
const overlayMock = jest.fn(() => new MockedHummus())
const constructorMock = jest.fn()
const endPageMock = jest.fn(() => new MockedHummus())
const endPDFMock = jest.fn(callback => callback('newTestData'))
class MockedHummus {
  writer = { attachURLLinktoCurrentPage, getFontForFile, metadata: metadataMock }
  info = infoMock
  endPage = endPageMock
  endPDF = endPDFMock
  editPage = editPageMock
  image = imageMock
  text = textMock
  line = lineMock
  fonts = {}
  metadata = metadataMock
  appendPage = appendPageMock
  createPage = createPageMock
  overlay = overlayMock
  constructor(...args) {
    constructorMock(...args)
  }
}

import {
  IPDFBaner,
  updatePDF,
  KOMGO_MAIN_COLOR,
  KOMGO_SECOND_COLOR,
  KOMGO_LINE_COLOR,
  FONT_NAME,
  getBannerParams,
  getTmpFileName,
  getOrigDocumentParams,
  storeFirstPage,
  addPagesToFirstPage,
  addBanerToFirstPage,
  deleteTmpFiles
} from './updatePDF'

import * as updateModules from './updatePDF'

describe('updatePDF', () => {
  it('should return params for banner - getBannerParams/portrait', () => {
    const result = getBannerParams(612, 15, 70.245, 792, 792)
    const mockResult = {
      fullPageHeigth: 851,
      headerHeigth: 59,
      qrStartPointX: 723,
      qrStartPointY: 9,
      qrWidth: 44,
      smallFontSize: 12,
      textPointX1: 30,
      textPointY1: 27.5,
      text2PointX1: 131.245,
      smallTextPointY: 46,
      linePointX: 117.245,
      linePointY1: 17,
      linePointY2: 46.6
    }
    expect(result).toEqual(mockResult)
  })

  it('should return params for banner - getBannerParams/landscape', () => {
    const result = getBannerParams(612, 15, 70.245, 792, 1123)
    const mockResult = {
      fullPageHeigth: 851,
      headerHeigth: 59,
      qrStartPointX: 1054,
      qrStartPointY: 9,
      qrWidth: 44,
      smallFontSize: 12,
      textPointX1: 30,
      textPointY1: 27.5,
      text2PointX1: 131.245,
      smallTextPointY: 46,
      linePointX: 117.245,
      linePointY1: 17,
      linePointY2: 46.6
    }
    expect(result).toEqual(mockResult)
  })

  it('should return temp file name - getTmpFileName', () => {
    expect(getTmpFileName()).toContain('.pdf')
  })

  it('should return origin document parameters - getOrigDocumentParams', () => {
    const tmpFileName = getTmpFileName()

    const registered = 'Registered'
    const mockResult = {
      pageCount: 3,
      pageWidth: 600,
      pageHeight: 800,
      smalestSideSize: 600,
      textWidth: 10,
      fontSize: 15
    }
    const pdfReader = new MockedHummus()
    const result = getOrigDocumentParams(pdfReader, registered)
    expect(result).toEqual(mockResult)
  })

  it('should store first page from document - storeFirstPage', () => {
    const tmpResultFileName = getTmpFileName()
    const tmpSourceFileName = getTmpFileName()
    storeFirstPage(tmpSourceFileName, tmpResultFileName)

    expect(constructorMock).toHaveBeenCalledWith('new', tmpResultFileName)
    expect(appendPageMock).toHaveBeenCalledWith(tmpSourceFileName, [1])
    expect(endPageMock).toHaveBeenCalled()
    expect(endPDFMock).toHaveBeenCalled()
  })

  it('should add all other pages to first page - addPagesToFirstPage', () => {
    const firstPageFileName = getTmpFileName()
    const sourceFileName = getTmpFileName()
    const resultFileName = getTmpFileName()
    addPagesToFirstPage(firstPageFileName, sourceFileName, resultFileName, 3)

    expect(constructorMock).toHaveBeenCalledWith(firstPageFileName, resultFileName)
    expect(appendPageMock).toHaveBeenCalledWith(sourceFileName, [2, 3])
    expect(endPageMock).toHaveBeenCalled()
    expect(endPDFMock).toHaveBeenCalled()
  })

  it('should delete all tmpFiles by names - addPagesToFirstPage', () => {
    const nameArr = ['./1.pdf', './2pdf']
    deleteTmpFiles(nameArr)
    expect(unlinkSyncMock).toHaveBeenCalledTimes(2)
  })

  it('should add banner to first page - addBanerToFirstPage', () => {
    const banerParams: IPDFBaner = {
      smalestSideSize: 200,
      fontSize: 10,
      textWidth: 30,
      pageHeight: 400,
      pageWidth: 200,
      texts: { registered: 'text1', withKomgo: 'text2', byCompanyName: 'text3', onDate: 'text4' }
    }

    const bigTextParams = { color: KOMGO_MAIN_COLOR, font: FONT_NAME, size: 10 }
    const smallTextParams = { color: KOMGO_SECOND_COLOR, font: FONT_NAME, size: 4 }
    const lineParams = { color: KOMGO_LINE_COLOR, lineWidth: 0.5 }

    const fileFirstPage = getTmpFileName()
    const resultFileName = getTmpFileName()
    addBanerToFirstPage(fileFirstPage, resultFileName, banerParams)

    expect(constructorMock).toHaveBeenCalledWith('new', resultFileName)
    expect(createPageMock).toHaveBeenCalledWith(200, 419)
    expect(imageMock).toHaveBeenCalledWith('./src/utils/updatePDFWithVerificationLink/QR-code.png', 177, 3, {
      keepAspectRatio: true,
      width: 15
    })
    expect(textMock).toHaveBeenNthCalledWith(1, 'text1', 10, 11, bigTextParams)
    expect(textMock).toHaveBeenNthCalledWith(3, 'text3', 50, 11, bigTextParams)
    expect(textMock).toHaveBeenNthCalledWith(2, 'text2', 10, 15, smallTextParams)
    expect(textMock).toHaveBeenNthCalledWith(4, 'text4', 50, 15, smallTextParams)

    expect(lineMock).toHaveBeenCalledWith([[46, 4], [46, 15.2]], lineParams)

    expect(overlayMock).toHaveBeenCalledWith(fileFirstPage, 0, 19, { scale: 1 })
    expect(endPageMock).toHaveBeenCalled()
    expect(endPDFMock).toHaveBeenCalled()
  })

  it('should update pdf - updatePDF', () => {
    const counter = 4

    const getTmpFileNameMock = jest.spyOn(updateModules, 'getTmpFileName')
    const getOrigDocumentParamsMock = jest.spyOn(updateModules, 'getOrigDocumentParams')
    const storeFirstPageMock = jest.spyOn(updateModules, 'storeFirstPage')
    const addBanerToFirstPageMock = jest.spyOn(updateModules, 'addBanerToFirstPage')
    const addPagesToFirstPageMock = jest.spyOn(updateModules, 'addPagesToFirstPage')
    const deleteTmpFilesMock = jest.spyOn(updateModules, 'deleteTmpFiles')

    updatePDF(file, 'Test')

    expect(getTmpFileNameMock).toHaveBeenCalledTimes(counter)
    expect(getOrigDocumentParamsMock).toHaveBeenCalled()
    expect(storeFirstPageMock).toHaveBeenCalled()
    expect(addBanerToFirstPageMock).toHaveBeenCalled()
    expect(addPagesToFirstPageMock).toHaveBeenCalled()
    expect(deleteTmpFilesMock).toHaveBeenCalled()
    expect(unlinkSyncMock).toHaveBeenCalledTimes(counter)
    expect(endPageMock).toHaveBeenCalled()
    expect(endPDFMock).toHaveBeenCalled()

    getTmpFileNameMock.mockClear()
    getOrigDocumentParamsMock.mockClear()
    storeFirstPageMock.mockClear()
    addBanerToFirstPageMock.mockClear()
    addPagesToFirstPageMock.mockClear()
    jest.clearAllMocks()
  })
})
