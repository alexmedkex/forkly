'use strict'

const { createTypes, createType } = require('../src/migration-utils')

const COLLECTION_NAME_TYPES = 'types'
const COLLECTION_NAME_CATEGORIES = 'categories'

const PRODUCT_ID = 'tradeFinance'

const categories = [
  {
    _id: 'bank-facility',
    productId: PRODUCT_ID,
    name: 'Bank Facility',
    __v: 0
  },
  {
    _id: 'banking-details',
    productId: PRODUCT_ID,
    name: 'Banking Details',
    __v: 0
  },
  {
    _id: 'delivery-confirmation',
    productId: PRODUCT_ID,
    name: 'Delivery Confirmation',
    __v: 0
  },
  {
    _id: 'financial-instruments',
    productId: PRODUCT_ID,
    name: 'Financial Instruments',
    __v: 0
  },
  {
    _id: 'insurance-documents',
    productId: PRODUCT_ID,
    name: 'Insurance Documents',
    __v: 0
  },
  {
    _id: 'inventory-management',
    productId: PRODUCT_ID,
    name: 'Inventory Management',
    __v: 0
  },
  {
    _id: 'legal-documents',
    productId: PRODUCT_ID,
    name: 'Legal Documents',
    __v: 0
  },
  {
    _id: 'negotiable-instruments',
    productId: PRODUCT_ID,
    name: 'Negotiable Instruments',
    __v: 0
  },
  {
    _id: 'trade-confirmation',
    productId: PRODUCT_ID,
    name: 'Trade Confirmation',
    __v: 0
  },
  {
    _id: 'transport-documents',
    productId: PRODUCT_ID,
    name: 'Transport Documents',
    __v: 0
  },
  {
    _id: 'other',
    productId: PRODUCT_ID,
    name: 'Other',
    __v: 0
  }
]

const listsOfTypes = [
  bankFacilityTypes(),
  bankingDetailsTypes(),
  deliveryConfirmationTypes(),
  financialInstrumentsTypes(),
  insuranceDocumentsTypes(),
  inventoryManagementTypes(),
  legalDocumentsTypes(),
  negotiableInstrumentsTypes(),
  tradeConfirmationTypes(),
  transportDocumentsTypes(),
  otherTypes()
]

const types = listsOfTypes.reduce((x, y) => x.concat(y), [])

function bankFacilityTypes() {
  return createTypes(PRODUCT_ID, 'bank-facility', [
    createType('accountOpeningForm', 'Account Opening Form'),
    createType('facilityAgreement', 'Facility Agreement'),
    createType('bankFacilityGuarantees', 'Guarantees'),
    createType('securityDocuments', 'Security Documents'),
    createType('bankFacilityTermsheet', 'Termsheet'),
    createType('bankFacilityOther', 'Other')
  ])
}

function bankingDetailsTypes() {
  return createTypes(PRODUCT_ID, 'banking-details', [
    createType('bankingDetails', 'Banking Details')
  ])
}

function deliveryConfirmationTypes() {
  return createTypes(PRODUCT_ID, 'delivery-confirmation', [
    createType('deliveryReceipt', 'Delivery Receipt'),
    createType('inTankTransferCertificate', 'In-Tank Transfer Certificate'),
    createType('outturnCertificate', 'Outturn Certificate'),
    createType('pipelineTicket', 'Pipeline Ticket'),
    createType('deliveryConfirmationOther', 'Other')
  ])
}

function financialInstrumentsTypes() {
  return createTypes(PRODUCT_ID, 'financial-instruments', [
    createType('bankGuarantee', 'Bank Guarantee'),
    createType('bidBonds', 'Bid Bonds'),
    createType('performanceBonds', 'Performance Bonds'),
    createType('financialInstrumentsSblc', 'SBLC'),
    createType('financialInstrumentsOther', 'Other')
  ])
}

function insuranceDocumentsTypes() {
  return createTypes(PRODUCT_ID, 'insurance-documents', [
    createType('insuranceCertificate', 'Insurance Certificate'),
    createType('insuranceDocumentsPolicy', 'Insurance Policy'),
    createType('lossPayeeEvidence', 'Loss Payee Evidence'),
    createType('insuranceDocumentsProofOfInsurance', 'Proof of Insurance'),
    createType('insuranceDocumentsOther', 'Other')
  ])
}

function inventoryManagementTypes() {
  return createTypes(PRODUCT_ID, 'inventory-management', [
    createType('collateralManagementAgreement ', 'Collateral Management Agreement '),
    createType('stockMonitoringAgreement', 'Stock Monitoring Agreement'),
    createType('inventoryManagementOther', 'Other')
  ])
}

function legalDocumentsTypes() {
  return createTypes(PRODUCT_ID, 'legal-documents', [
    createType('appendix', 'Appendix'),
    createType('legalDocumentsAssignmentOfProceeds', 'Assignment of Proceeds'),
    createType('disclaimer', 'Disclaimer'),
    createType('legalOpinion', 'Legal opinion'),
    createType('legalDocumentsRenunciationOfRights', 'Renunciation of rights'),
    createType('trustReceipt', 'Trust receipt'),
    createType('waiver', 'Waiver'),
    createType('legalDocumentsOther', 'Other')
  ])
}

function negotiableInstrumentsTypes() {
  return createTypes(PRODUCT_ID, 'negotiable-instruments', [
    createType('billsOfExchange', 'Bills of Exchange'),
    createType('drafts', 'Drafts'),
    createType('negotiableInstrumentsPromissoryNote', 'Promissory Note'),
    createType('negotiableInstrumentsOther', 'Other')
  ])
}

function tradeConfirmationTypes() {
  return createTypes(PRODUCT_ID, 'trade-confirmation', [
    createType('dealTicket ', 'Deal ticket '),
    createType('tradePaymentConfirmation', 'Payment confirmation'),
    createType('purchaseConfirmation', 'Purchase confirmation'),
    createType('tradeParentCompanyGuarantee', 'Parent company guarantee'),
    createType('tradeConfirmationOther', 'Other')
  ])
}

function transportDocumentsTypes() {
  return createTypes(PRODUCT_ID, 'transport-documents', [
    createType('airWaybill', 'Air waybill'),
    createType('billOfLading', 'Bill of lading'),
    createType('fcr', 'FCR'),
    createType('matesReceipt', 'Mate\'s Receipt'),
    createType('railwayReceipt', 'Railway Receipt'),
    createType('transportDocumentsWarrantyOfTitle', 'Warranty of Title'),
    createType('transportDocumentsOther', 'Other')
  ])
}

function otherTypes() {
  return createTypes(PRODUCT_ID, 'other', [
    createType('otherType', 'Other')
  ])
}

module.exports = {
  async up(db) {
    for (const category of categories) {
      await db.collection(COLLECTION_NAME_CATEGORIES).insertOne(category)
    }
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).insertOne(type)
    }
  },

  async down(db) {
    for (const category of categories) {
      await db.collection(COLLECTION_NAME_CATEGORIES).remove({ _id: category.id })
    }
    for (const type of types) {
      await db.collection(COLLECTION_NAME_TYPES).remove({ id: type.id })
    }
  }
}
