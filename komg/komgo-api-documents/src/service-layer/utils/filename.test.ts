import { getFilenameExt, getFilenameWithoutExt, isParseableToPDF, isNonPrintableFileExtension } from './filename'

describe('filename.ts', () => {
  it('should get the correct extension', async () => {
    expect(getFilenameExt('aaa.abc', true)).toEqual('.abc')
    expect(getFilenameExt('aaa.abc', false)).toEqual('abc')
  })

  it('shoud extract the name of the file correctly', async () => {
    expect(getFilenameWithoutExt('aaa.abc')).toEqual('aaa')
  })

  it('shoud detect correctly if a file extension is parseable into PDF or not', async () => {
    expect(isParseableToPDF('abc')).toBe(false)
    expect(isParseableToPDF('doc')).toBe(true)
    expect(isParseableToPDF('xls')).toBe(true)
    expect(isParseableToPDF('ppt')).toBe(true)
    expect(isParseableToPDF('docx')).toBe(true)
    expect(isParseableToPDF('xlsx')).toBe(true)
    expect(isParseableToPDF('pptx')).toBe(true)
  })

  it('shoud detect correctly if a file name is parseable into PDF or not', async () => {
    expect(isNonPrintableFileExtension('aaa.abc')).toBe(false)
    expect(isNonPrintableFileExtension('aaa.doc')).toBe(true)
    expect(isNonPrintableFileExtension('aaa.xls')).toBe(true)
    expect(isNonPrintableFileExtension('aaa.ppt')).toBe(true)
    expect(isNonPrintableFileExtension('aaa.docx')).toBe(true)
    expect(isNonPrintableFileExtension('aaa.xlsx')).toBe(true)
    expect(isNonPrintableFileExtension('aaa.pptx')).toBe(true)
  })
})
