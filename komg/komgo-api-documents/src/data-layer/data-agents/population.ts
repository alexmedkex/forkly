export const POPULATE_PRODUCT = {
  path: 'productId'
}

export const POPULATE_FULL_CATEGORY = {
  path: 'categoryId',
  populate: POPULATE_PRODUCT
}

export const POPULATE_CATEGORY = {
  path: 'categoryId',
  populate: POPULATE_PRODUCT
}

export const POPULATE_TYPE = {
  path: 'typeId',
  populate: [POPULATE_PRODUCT, POPULATE_CATEGORY]
}

export const POPULATE_TYPES = {
  path: 'types',
  populate: [POPULATE_PRODUCT, POPULATE_CATEGORY]
}

export const POPULATE_DOCUMENTS = {
  path: 'documents',
  populate: [POPULATE_PRODUCT, POPULATE_CATEGORY, POPULATE_TYPE]
}

export const POPULATE_DOCUMENT_REVIEWS = {
  path: 'documents.documentId',
  populate: [POPULATE_PRODUCT, POPULATE_CATEGORY, POPULATE_TYPE]
}

export const POPULATE_DOCUMENT_FEEDBACK = {
  path: 'documents.documentId',
  populate: [POPULATE_PRODUCT, POPULATE_CATEGORY, POPULATE_TYPE]
}

export const POPULATE_OUTGOING_REQUEST = {
  path: 'requestId',
  populate: [POPULATE_PRODUCT, POPULATE_TYPES, POPULATE_DOCUMENT_REVIEWS]
}

export const POPULATE_INCOMING_REQUEST = {
  path: 'requestId',
  populate: [POPULATE_PRODUCT, POPULATE_TYPES, POPULATE_DOCUMENTS]
}
