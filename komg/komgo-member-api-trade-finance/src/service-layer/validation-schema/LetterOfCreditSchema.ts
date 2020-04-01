const IssueDueDateUnitDuration = 'Issue due date unit duration'

export const LetterOfCreditSchema = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://komgo.io/letter-of-credit',
  type: 'object',
  title: 'Letter of Credit',
  required: [
    'applicantId',
    'beneficiaryId',
    'issuingBankId',
    'direct',
    'tradeId',
    'type',
    'applicableRules',
    'feesPayableBy',
    'currency',
    'amount',
    'expiryDate',
    'expiryPlace',
    'availableWith',
    'availableBy',
    'documentPresentationDeadlineDays',
    'templateType'
  ],
  properties: {
    applicantId: {
      $id: '#/properties/applicantId',
      type: 'string',
      title: 'Applicant Id',
      default: '',
      examples: ['111'],
      pattern: '^(.*)$'
    },
    applicantContactPerson: {
      $id: '#/properties/applicantContactPerson',
      type: 'string',
      title: 'Applicant Contact Person',
      default: '',
      examples: ['Donald Duck'],
      maxLength: 60
    },
    beneficiaryId: {
      $id: '#/properties/beneficiaryId',
      type: 'string',
      title: 'Beneficiary Id',
      default: '',
      examples: ['222'],
      pattern: '^(.*)$'
    },
    beneficiaryContactPerson: {
      $id: '#/properties/beneficiaryContactPerson',
      type: 'string',
      title: 'Beneficiary Contact Person',
      default: '',
      examples: ['string'],
      maxLength: 60
    },
    issuingBankId: {
      $id: '#/properties/issuingBankId',
      type: 'string',
      title: 'Issuing Bank Id',
      default: '',
      examples: ['333'],
      pattern: '^(.*)$'
    },
    issuingBankContactPerson: {
      $id: '#/properties/issuingBankContactPerson',
      type: 'string',
      title: 'Issuing Bank Contact Person',
      default: '',
      examples: ['Scrooge'],
      maxLength: 60
    },
    direct: {
      $id: '#/properties/direct',
      type: 'boolean',
      title: 'Direct',
      default: false,
      examples: [false]
    },
    beneficiaryBankId: {
      $id: '#/properties/beneficiaryBankId',
      type: 'string',
      title: 'Beneficiary Bank Id',
      default: '',
      examples: ['444'],
      pattern: '^(.*)$'
    },
    beneficiaryBankContactPerson: {
      $id: '#/properties/beneficiaryBankContactPerson',
      type: 'string',
      title: 'Beneficiary Bank Contact Person',
      default: '',
      examples: ['Mickey Mouse'],
      maxLength: 60
    },
    beneficiaryBankRole: {
      $id: '#/properties/beneficiaryBankRole',
      type: 'string',
      enum: ['AdvisingBank'],
      title: 'Beneficiary Bank Role',
      default: '',
      examples: ['AdvisingBank'],
      pattern: '^(.*)$'
    },
    tradeId: {
      $id: '#/properties/tradeId',
      type: 'string',
      title: 'Trade Id',
      default: '',
      examples: ['555'],
      pattern: '^(.*)$'
    },
    type: {
      $id: '#/properties/type',
      type: 'string',
      title: 'Type',
      default: '',
      examples: ['IRREVOCABLE'],
      pattern: '^(.*)$'
    },
    applicableRules: {
      $id: '#/properties/applicableRules',
      type: 'string',
      title: 'Applicable Rules',
      default: '',
      examples: ['UCP latest version'],
      pattern: '^(.*)$'
    },
    feesPayableBy: {
      $id: '#/properties/feesPayableBy',
      type: 'string',
      enum: ['APPLICANT', 'BENEFICIARY', 'SPLIT'],
      title: 'Fees payable by',
      default: '',
      examples: ['APPLICANT'],
      pattern: '^(.*)$'
    },
    currency: {
      $id: '#/properties/currency',
      type: 'string',
      title: 'Currency',
      enum: ['EUR', 'USD'],
      default: '',
      examples: ['EUR'],
      pattern: '^(.*)$'
    },
    amount: {
      $id: '#/properties/amount',
      type: 'number',
      title: 'Amount',
      default: 0.0,
      minimum: 0.01,
      examples: [1000000.0]
    },
    expiryDate: {
      $id: '#/properties/expiryDate',
      type: 'string',
      title: 'Expiry date',
      default: '',
      examples: ['20200-12-31'],
      pattern: '^(.*)$',
      format: 'date'
    },
    expiryPlace: {
      $id: '#/properties/expiryPlace',
      type: 'string',
      title: 'Expiry Place',
      default: '',
      examples: ['ISSUING_BANK'],
      minLength: 1
    },
    availableWith: {
      $id: '#/properties/availableWith',
      type: 'string',
      title: 'Available With',
      default: '',
      enum: ['AdvisingBank', 'IssuingBank'],
      examples: ['AdvisingBank'],
      pattern: '^(.*)$'
    },
    availableBy: {
      $id: '#/properties/availableBy',
      type: 'string',
      enum: ['SIGHT_PAYMENT', 'DEFERRED_PAYMENT', 'ACCEPTANCE', 'NEGOTIATION'],
      title: 'Available By',
      default: 'DEFERRED_PAYMENT',
      examples: ['DEFERRED_PAYMENT'],
      pattern: '^(.*)$'
    },
    partialShipmentAllowed: {
      $id: '#/properties/partialShipmentAllowed',
      type: 'boolean',
      title: 'Partial shipment Allowed',
      default: false,
      examples: [true]
    },
    transhipmentAllowed: {
      $id: '#/properties/transhipmentAllowed',
      type: 'boolean',
      title: 'Transhipment Allowed',
      default: false,
      examples: [false]
    },
    documentPresentationDeadlineDays: {
      $id: '#/properties/documentPresentationDeadlineDays',
      type: 'integer',
      title: 'Document Presentation Deadline (in Days)',
      default: 0,
      minimum: 0,
      examples: [21]
    },
    comments: {
      $id: '#/properties/comments',
      type: 'string',
      title: 'Comments',
      default: '',
      examples: ['a comment'],
      maxLength: 500
    },
    reference: {
      $id: '#/properties/reference',
      type: 'string',
      title: 'Reference',
      default: '',
      examples: ['LC2018-MER-1'],
      pattern: '^(.*)$'
    },
    billOfLadingEndorsement: {
      $id: '#/properties/billOfLadingEndorsement',
      type: 'string',
      enum: ['Applicant', 'IssuingBank'],
      title: 'Bill of lading endorsement',
      default: 'IssuingBank'
    },
    invoiceRequirement: {
      $id: '#/properties/invoiceRequirement',
      type: 'string',
      enum: ['EXHAUSTIVE', 'SIMPLE'],
      description: "Controls the invoice's wording in the LC",
      default: 'EXHAUSTIVE',
      examples: ['SIMPLE']
    },
    templateType: {
      $id: '#/properties/templateType',
      type: 'string',
      enum: ['FREE_TEXT', 'KOMGO_BFOET'],
      title: 'Template type',
      default: 'KOMGO_BFOET'
    },
    freeTextLc: {
      $id: '#/properties/freeTextLc',
      type: 'string',
      maxLength: 18000
    },
    generatedPDF: {
      $id: '#/properties/generatedPDF',
      type: 'string',
      contentEncoding: 'base64'
    },
    LOI: {
      $id: '#/properties/LOI',
      type: 'string',
      maxLength: 5000,
      minLength: 1
    },
    LOIAllowed: {
      $id: '#/properties/direct',
      type: 'boolean',
      title: 'LOI Allowed',
      default: true
    },
    LOIType: {
      $id: '#/properties/LOIType',
      type: 'string',
      enum: ['KOMGO_LOI', 'FREE_TEXT'],
      title: 'LOI type',
      default: 'KOMGO_LOI',
      examples: ['FREE_TEXT']
    },
    issueDueDateUnit: {
      $id: '#/properties/issueDueDateUnit',
      type: 'string',
      enum: ['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'WEEKS'],
      title: 'Unit',
      description: IssueDueDateUnitDuration,
      default: 'DAYS',
      examples: ['WEEKS']
    },
    issueDueDateDuration: {
      $id: '#/properties/issueDueDateDuration',
      type: 'integer',
      title: IssueDueDateUnitDuration,
      description: IssueDueDateUnitDuration,
      examples: [1]
    }
  },
  dependencies: {
    issueDueDateUnit: { required: ['issueDueDateDuration'] },
    issueDueDateDuration: { required: ['issueDueDateUnit'] }
  },
  allOf: [
    {
      if: {
        properties: {
          direct: {
            enum: [false]
          }
        }
      },
      then: {
        required: ['beneficiaryBankId', 'beneficiaryBankRole']
      }
    },
    {
      if: {
        properties: {
          templateType: {
            enum: ['KOMGO_BFOET']
          }
        }
      },
      then: {
        required: ['LOI', 'LOIType', 'LOIAllowed', 'generatedPDF', 'invoiceRequirement']
      }
    }
  ]
}
