export const DOCUMENT_PRODUCT = {
  TradeFinance: 'tradeFinance'
}

export const DOCUMENT_SUB_PRODUCT = {
  LC: 'lc',
  SBLC: 'sblc',
  TRADE: 'trade'
}

export const DOCUMENT_CATEGORY = {
  TradeDocuments: 'trade-documents',
  TradeFinanceDocuments: 'trade-finance-documents',
  CommercialDocuments: 'commercial-documents'
}

export const DOCUMENT_TYPE = {
  LC: 'lc',
  SBLC: 'sblc',
  LC_Application: 'lcApplication',
  LC_Amendment: 'lcAmendment',
  COMMERCIAL_CONTRACT: 'commercialContract'
}

export const TRADE_FIN_DOCUMENTS = {
  productId: DOCUMENT_PRODUCT.TradeFinance,
  categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments
}

export const LC_DOC_TYPE = {
  ...TRADE_FIN_DOCUMENTS,
  typeId: DOCUMENT_TYPE.LC
}

export const LC_APPLICATION_DOC_TYPE = {
  ...TRADE_FIN_DOCUMENTS,
  typeId: DOCUMENT_TYPE.LC_Application
}
