export const VaktTradeDocumentMessage = {
  version: 1,
  messageType: 'KOMGO.TradeDocument',
  contents: 'TWVldGluZyBtaW51dGVzOgoxKSBLT01HTyB3aWxsIHNlbmQgTENSZXF1ZX',
  documentType: 'Q88',
  lcId: '4444-11',
  vaktId: 'V93726453',
  filename: 'trade_document_v1.pdf',
  metadata: {
    property1: 'string',
    property2: 'string'
  }
}

export const InvalidVaktTradeDocumentMessage = {
  ...VaktTradeDocumentMessage,
  documentType: null
}

export const vaktTradeDocumentWithoutLcMessage = {
  ...VaktTradeDocumentMessage,
  lcId: null
}
