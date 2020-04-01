/**
 * Creates a list of document types with specific product and category ids
 *
 * @param {string} productId product id of the types. Ex: tradeFinance
 * @param {string} categoryId category id of the types. Ex: trade-finance-documents
 * @param {Array} types List of types to be added to the product and category
 */
const createTypes = (productId, categoryId, types) => {
  return types.map(type => {
    return {
      productId,
      categoryId,
      ...type
    }
  })
}

const createType = (id, name, vaktId = null, fields = null) => {
  return {
    _id: id,
    name,
    vaktId,
    fields,
    __v: 0
  }
}

const createTradeFinanceType = (id, vaktId, name, fields) => {
  return {
    _id: id,
    name,
    vaktId,
    fields,
    __v: 0
  }
}

/**
 * Adds new types to the "tradeFinance" product id and "commercial-documents" category
 * @param {Array} types types to be added
 */
const newCommercialContractDocumentTypes = types => {
  return createTypes('tradeFinance', 'commercial-documents', types)
}

module.exports = { newCommercialContractDocumentTypes, createTradeFinanceType, createType, createTypes }
