import * as path from 'path'

const nonPrintableFileExtensions: Set<string> = new Set(['doc', 'xls', 'ppt', 'docx', 'xlsx', 'pptx'])

export function getFilenameExt(fileName: string, includeDot: boolean): string {
  const ext = path.extname(fileName)
  return includeDot ? ext : ext.substring(1)
}

export function getFilenameWithoutExt(fileNameWithExt: string): string {
  const ext = getFilenameExt(fileNameWithExt, true)
  return path.basename(fileNameWithExt, ext)
}

export function isParseableToPDF(fileExt: string): boolean {
  return nonPrintableFileExtensions.has(fileExt)
}

export function isNonPrintableFileExtension(fileName: string): boolean {
  return nonPrintableFileExtensions.has(getFilenameExt(fileName, false).toLowerCase())
}
