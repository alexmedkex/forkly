const listsOfTypes = [
    companyDetailsTypes(),
    managementAndDirectorsTypes(),
    shareholderTypes(),
    businessDescriptionTypes(),
    regulationAndComplianceTypes(),
    bankingDocumentsTypes(),
    // TODO uncomment when implementing custom types
    // miscellaneousTypes(),
    tradeDocumentsTypes(),
    tradeFinanceTypes(),
    commercialDocuments()
  ]
  
const types = listsOfTypes.reduce((x, y) => x.concat(y), [])

function companyDetailsTypes() {
return createTypes('kyc', 'company-details', [
    type('certificate-of-incorporation', 'Certificate of incorporation', [
    date('issuance-date',     'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name'),
    string('issued-by',       'Issued by')
    ]),
    type('proof-of-registration', 'Proof of registration', [
    date('issuance-date',                 'Issuance date'),
    date('registration-date',             'Registration date on Komgo'),
    string('company-name',                'Company name'),
    string('registered-business-address', 'Registered business Address'),
    string('type-of-document',            'Type of document'),
    string('issued-by',                   'Issued by')
    ]),
    type('memorandum-of-articles', 'Memorandum of articles', [
    date('issuance-date',    'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name'),
    string('issued-by',       'Issued by')
    ]),
    type('article-of-association', 'Article of association', [
    date('issuance-date',     'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name'),
    number('share-capital',   'Share capital'),
    string('issued-by',       'Issued by')
    ]),
    type('trade-license', 'Trade license', [
    date('issuance-date',     'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    date('expiry-date',       'Expiry date'),
    string('company-name',    'Company name'),
    string('issued-by',       'Issued by')
    ]),
    type('organization-chart', 'Organization chart', [
    date('signature-date',    'Signature-date'),
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name'),
    string('sign-by',         'Sign by')
    ]),
    type('third-party-reference', 'Third party reference', [
    date('issuance-date',     'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name')
    ]),
])
}

function managementAndDirectorsTypes() {
return createTypes('kyc', 'management-and-directors', [
    type('latest-board-of-directors-on-the-appointment-of-directors', 'Latest board of director on the appointment of directors', [
    date('issuance-date',               'Issuance date'),
    date('registration-date',           'Registration date on Komgo'),
    string('company-name',              'Company name'),
    stringArr('list-of-director-names', 'List of directors\' names')
    ]),
    type('complete-management-identification', 'Complete management identification', [
    string('issuance-date',            'Issuance date'),
    stringArr('list-of-manager-names', 'List of managers\' names')
    ]),
    type('list-of-directors', 'List of directors', [
    stringArr('director-names', 'Director names')
    ]),
    type('passports-of-directors', 'Passports of the directors', [
    date('issuance-date',     'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    date('expiry-date',       'Expiry date'),
    string('full-name',       'Full name'),
    string('issued-by',       'Issued by'),
    string('passport-number', 'Passport number'),
    string('nationality',     'Nationality')
    ]),
    type('management-and-directors-resume', 'Resumes', [
    string('name',            'Name'),
    date('last-version-date', 'Date of the latest version')
    ]),
    type('management-and-directors-proof-of-residency', 'Proof of residency', [
    date('issuance-date',    'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    string('issued-by',       'Issued by'),
    string('full-address',    'Full address'),
    string('country',         'Country')
    ])
])
}

function shareholderTypes() {
return createTypes('kyc', 'shareholders', [
    type('shareholder-chard-signed-including-ubos', 'Shareholder chart signed including UBOs', [
    date('signature-date',                 'Signature date'),
    date('registration-date',              'Registration date on Komgo'),
    string('signed-by',                    'Signed by'),
    stringArr('list-on-shareholder-chart', 'List of individuals on shareholder chart'),
    string('authenticated-by-third-party', 'Authentication by a 3rd party')
    ]),
    type('passports-of-ubos', 'Passports of UBOs', [
    date('issuance-date',    'Issuance date'),
    date('registration-date', 'Registration date on Komgo'),
    date('expiry-date',       'Expiry date'),
    string('full-name',       'Full name'),
    string('issued-by',       'Issued by'),
    string('passport-number', 'Passport number'),
    string('nationality',     'Nationality')
    ]),
    type('shareholders-resume', 'Resumes', [
    string('name',            'Name'),
    date('last-version-date', 'Date of the latest version')
    ]),
    type('direct-parent-company-proof-of-existance', 'Proof of existence of Direct Parent Company', [
    date('issuance-date',   'Issuance date'),
    string('company-name',  'Company name'),
    string('issued-by',     'Issued by'),
    string('document-name', 'Name of the document'),
    string('document-type', 'Type of the document')
    ]),
    type('shareholders-proof-of-residency', 'Proof of residency', [
    date('issuance-date',     'Issuance date'),
    string('issued-by',       'Issued by'),
    string('full-address',    'Full address'),
    string('individual-name', 'Individual name')
    ]),
    type('aml-letter', 'AML Letter', [
    date('issuance-date',  'Issuance date'),
    string('signed-by',    'Signed by'),
    string('company-name', 'Company name')
    ]),
    type('ubo-form', 'UBO form', [
    date('signature-date',        'Signature date'),
    string('investor-name',       'Investor name'),
    string('contry-of-residence', 'Country of residence'),
    string('full-address',        'Full address')
    ]),
    type('source-of-wealth', 'Source of wealth', [
    date('signature-date',    'Signature date'),
    string('investor-name',   'Investor name'),
    date('registration-date', 'Registration date on Komgo')
    ])
])
}

function businessDescriptionTypes() {
return createTypes('kyc', 'business-description', [
    type('company-profile-signed', 'Company profile signed', [
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name')
    ]),
    type('business-description', 'Description of the business', [
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name')
    ]),
    type('main-buyers-and-sellers', 'Main buyers and sellers', [
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name')
    ]),
    type('products-traded', 'List of products traded', [
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',    'Company name')
    ]),
    type('bank-lines', 'Bank lines', [
    date('registration-date', 'Registration date on Komgo'),
    string('company-name',  'Company name'),
    stringArr('banks-list', 'List of banks')
    ]),
    type('latest-audited-financials', 'Latest audited financials', [
    date('closure-date-of-accounts', 'Closure date of the accounts'),
    date('issuance-date',  'Issuance date'),
    string('issued-by',    'Issued by'),
    string('company-name', 'Company name')
    ])
])
}

function regulationAndComplianceTypes() {
return createTypes('kyc', 'regulation-and-compliance', [
    type('crs', 'CRS', [
    string('account-holder',            'Account holder'),
    string('account-number',            'Account number'),
    string('tax-residence-country',     'Tax residence country'),
    string('crs-status',                'CRS status'),
    string('tax-identification-number', 'Tax Identification Number'),
    date('issuance-date',               'Issuance date')
    ]),
    type('fatca', 'FATCA', [
    string('account-holder', 'Account holder'),
    date('issuance-date',    'Issuance date'),
    string('fatca-status',   'FATCA status')
    ]),
    type('form-a', 'Form A', [
    string('company-name',         'Company name'),
    string('full-name',            'Full name'),
    stringArr('beneficial-owners', 'Beneficial owner names'),
    string('full-address',         'Full address'),
    string('nationality',          'Nationality'),
    string('contry-of-residence',  'Country of residence'),
    date('signature-date',         'Signature date'),
    date('registration-date',      'Registration date on Komgo')
    ]),
    type('form-k', 'Form K', [
    string('company-name',      'Company name'),
    string('full-name',         'Full name'),
    date('issuance-date',       'Issuance date'),
    date('signature-date',      'Signature date'),
    string('individual-listed', 'Individual listed')
    ]),
    type('form-t', 'Form T', [
    string('company-name',       'Company name'),
    string('trust-name',         'Trust name'),
    string('type-of-trust',      'Type of trust'),
    string('trust-revocability', 'Revocability of trust'),

    string('settlor-full-name',   'Settlor of trust, full name'),
    string('settlor-address',     'Settlor of trust, address'),
    string('settlor-country',     'Settlor of trust, country'),
    date('settlor-date-of-birth', 'Settlor of trust, date of birth'),
    string('settlor-nationality', 'Settlor of trust, nationality'),

    string('beneficiary-full-name',   'Beneficiary of trust, full name'),
    string('beneficiary-address',     'Beneficiary of trust, address'),
    string('beneficiary-country',     'Beneficiary of trust, country'),
    date('beneficiary-date-of-birth', 'Beneficiary of trust, date of birth'),
    string('beneficiary-nationality', 'Beneficiary of trust, nationality'),

    string('protector-full-name',   'Protector of trust, full name'),
    string('protector-address',     'Protector of trust, address'),
    string('protector-country',     'Protector of trust, country'),
    date('protector-date-of-birth', 'Protector of trust, date of birth'),
    string('protector-nationality', 'Protector of trust, nationality')
    ]),
    type('sanction-questionnaire', 'Sanction questionnaire', [
    string('company-name', 'Company name'),
    date('signature-date', 'Signature date')
    ]),
    type('waiver-banking-secrecy', 'Waiver banking secrecy', [
    string('company-name', 'Company name'),
    date('issuance-date',  'Issuance date')
    ]),
    type('bank-fiduciary-mandate', 'Bank\'s fiduciary mandate', [
    date('issuance-date', 'Issuance date')
    ])
])
}

function bankingDocumentsTypes() {
return createTypes('kyc', 'banking-documents', [
    type('board-resolution', 'Board resolution', [
    string('company-name', 'Company name'),
    date('issuance-date',  'Issuance date')
    ]),
    type('gtcs', 'GTCs', [
    date('signature-date', 'Signature date'),
    string('bank',         'Bank'),
    string('company-name', 'Company name'),
    ]),
    type('pledge', 'Pledge', [
    stringArr('account-numbers', 'Account numbers'),
    string('bank',               'Bank'),
    string('company-name',       'Company name'),
    ]),
    type('general-assignment', 'General assignment', [
    string('bank',         'Bank'),
    string('company-name', 'Company name'),
    date('signature-date', 'Signature date')
    ]),
    type('termsheet', 'Termsheet', [
    string('bank', 'Bank'),
    string('company-name', 'Company name'),
    date('signature-date', 'Signature date')
    ]),
    type('signature-card', 'Signature card', [
    string('company-name',           'Company name'),
    string('bank',                   'Bank'),
    date('issuance-date',            'Issuance date'),
    stringArr('list-of-signatories', 'List of signatories')
    ])
])
}

function tradeDocumentsTypes() {
    return createTypes('tradeFinance', 'trade-documents', [
        createTradeFinanceType('letterOfIndemnity', 'LETTER_OF_INDEMNITY', 'LOI'),
        createTradeFinanceType('warrantyOfTitle', 'WARRANTY_OF_TITLE', 'Warranty of Title'),
        createTradeFinanceType('q88', 'Q88', 'Q88'),
        createTradeFinanceType('bl', 'BILL_OF_LADING', 'B/L'),
        createTradeFinanceType('certificateOfPumpover', 'CERTIFICATE_OF_PUMPOVER', 'Certificate of Pumpover'),
        createTradeFinanceType('cqq', 'QUALITY_AND_QUANTITY_REPORT', 'Q&Q Report '),
        createTradeFinanceType('proofOfInsurance', 'CERTIFICATE_OF_INSURANCE', 'Proof of Insurance'),
        createTradeFinanceType('coo', 'CERTIFICATE_OF_ORIGIN', 'Certificate of Origin'),
        createTradeFinanceType('invoice', 'INVOICE', 'Invoice'),
        createTradeFinanceType('other', 'OTHER', 'Other')
    ])
}

function tradeFinanceTypes() {
    return createTypes('tradeFinance', 'trade-finance-documents', [
        createTradeFinanceType('lc', 'LETTER_OF_CREDIT', 'L/C'),
        createTradeFinanceType('lcApplication', ' ', 'L/C Application (Komgo template)')
    ])
}

function commercialDocuments() {
    return createTypes('tradeFinance', 'commercial-documents', [
        createTradeFinanceType('commercialContract', 'COMMERCIAL_CONTRACT', 'Commercial Contract')
    ])
}

function miscellaneousTypes() {
return createTypes('kyc', 'miscellaneous', [])
}

function createTypes(productId, categoryId, types) {
return types.map((type) => {
    return {
    productId,
    categoryId,
    ...type
    }
})
}

function type(id, name, fields) {
    return {
        _id: id,
        name,
        fields,
        __v: 0
    }
}

function createTradeFinanceType(id, vaktId, name, fields) {
    return {
        _id: id,
        name,
        vaktId,
        fields,
        __v: 0
    }
}

function string(id, name) {
return {
    id,
    name,
    type: 'string',
    isArray: false
}
}

function stringArr(id, name) {
return {
    id,
    name,
    type: 'string',
    isArray: true
}
}

function number(id, name) {
return {
    id,
    name,
    type: 'number',
    isArray: false
}
}

function date(id, name) {
return {
    id,
    name,
    type: 'date',
    isArray: false
}
}

module.exports = {types}