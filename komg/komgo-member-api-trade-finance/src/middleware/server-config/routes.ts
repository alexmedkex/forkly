/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { LCController } from './../../service-layer/controllers/LCController';
import { LCPresentationController } from './../../service-layer/controllers/LCPresentationController';
import { LCAmendmentController } from './../../service-layer/controllers/LCAmendmentController';
import { SBLCController } from './../../service-layer/controllers/SBLCController';
import { LetterOfCreditController } from './../../service-layer/controllers/LetterOfCreditController';
import { expressAuthentication } from './../authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "blockchain": { "dataType": "string", "required": true },
            "rabbitMQ": { "dataType": "string", "required": true },
            "api-notif": { "dataType": "string", "required": true },
            "api-signer": { "dataType": "string", "required": true },
            "api-registry": { "dataType": "string", "required": true },
            "api-documents": { "dataType": "string", "required": true },
            "api-trade-cargo": { "dataType": "string", "required": true },
        },
    },
    "IProductResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
    },
    "ICategoryResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "product": { "ref": "IProductResponse", "required": true },
            "name": { "dataType": "string", "required": true },
        },
    },
    "FieldType": {
        "enums": ["string", "date", "number"],
    },
    "IFieldResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
            "type": { "ref": "FieldType", "required": true },
            "isArray": { "dataType": "boolean", "required": true },
        },
    },
    "ITypeResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "product": { "ref": "IProductResponse", "required": true },
            "category": { "ref": "ICategoryResponse", "required": true },
            "name": { "dataType": "string", "required": true },
            "vaktId": { "dataType": "string" },
            "fields": { "dataType": "array", "array": { "ref": "IFieldResponse" }, "required": true },
            "predefined": { "dataType": "boolean", "required": true },
        },
    },
    "IOwnerResponse": {
        "properties": {
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "companyId": { "dataType": "string", "required": true },
        },
    },
    "IContentResponse": {
        "properties": {
            "fileId": { "dataType": "string", "required": true },
            "signature": { "dataType": "string", "required": true },
        },
    },
    "KeyValueResponse": {
        "properties": {
            "name": { "dataType": "string", "required": true },
            "value": { "dataType": "string", "required": true },
        },
    },
    "IDocumentRegisterResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "context": { "dataType": "any", "required": true },
            "name": { "dataType": "string", "required": true },
            "product": { "ref": "IProductResponse", "required": true },
            "category": { "ref": "ICategoryResponse", "required": true },
            "type": { "ref": "ITypeResponse", "required": true },
            "owner": { "ref": "IOwnerResponse", "required": true },
            "hash": { "dataType": "string", "required": true },
            "registrationDate": { "dataType": "datetime", "required": true },
            "content": { "ref": "IContentResponse", "required": true },
            "metadata": { "dataType": "array", "array": { "ref": "KeyValueResponse" }, "required": true },
            "sharedWith": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "sharedBy": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
        },
    },
    "IRejectLCRequest": {
        "properties": {
            "reason": { "dataType": "string", "required": true },
        },
    },
    "ICreateLCResponse": {
        "properties": {
            "_id": { "dataType": "string", "required": true },
            "reference": { "dataType": "string", "required": true },
        },
    },
    "TimerDurationUnit": {
        "enums": ["SECONDS", "MINUTES", "HOURS", "DAYS", "WEEKS"],
    },
    "ICreateLCRequest": {
        "properties": {
            "applicantId": { "dataType": "string", "required": true },
            "applicantContactPerson": { "dataType": "string" },
            "beneficiaryId": { "dataType": "string", "required": true },
            "beneficiaryContactPerson": { "dataType": "string" },
            "issuingBankId": { "dataType": "string", "required": true },
            "issuingBankContactPerson": { "dataType": "string" },
            "direct": { "dataType": "boolean", "required": true },
            "beneficiaryBankId": { "dataType": "string" },
            "beneficiaryBankContactPerson": { "dataType": "string" },
            "beneficiaryBankRole": { "dataType": "string" },
            "feesPayableBy": { "dataType": "string", "required": true },
            "type": { "dataType": "string", "required": true },
            "applicableRules": { "dataType": "string", "required": true },
            "tradeId": { "dataType": "string", "required": true },
            "currency": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "expiryDate": { "dataType": "object", "required": true },
            "expiryPlace": { "dataType": "string", "required": true },
            "availableWith": { "dataType": "string", "required": true },
            "availableBy": { "dataType": "string", "required": true },
            "partialShipmentAllowed": { "dataType": "boolean" },
            "transhipmentAllowed": { "dataType": "boolean" },
            "documentPresentationDeadlineDays": { "dataType": "double", "required": true },
            "comments": { "dataType": "string" },
            "cargoIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "reference": { "dataType": "string" },
            "billOfLadingEndorsement": { "dataType": "string" },
            "invoiceRequirement": { "dataType": "string" },
            "templateType": { "dataType": "string" },
            "freeTextLc": { "dataType": "string" },
            "generatedPDF": { "dataType": "string" },
            "LOI": { "dataType": "string" },
            "LOIAllowed": { "dataType": "boolean" },
            "LOIType": { "dataType": "string" },
            "issueDueDateUnit": { "ref": "TimerDurationUnit" },
            "issueDueDateDuration": { "dataType": "double" },
        },
    },
    "LCPresentationDocumentStatus": {
        "enums": ["DRAFT", "SUBMITTED"],
    },
    "ILCPresentationDocument": {
        "properties": {
            "documentId": { "dataType": "string" },
            "documentHash": { "dataType": "string", "required": true },
            "status": { "ref": "LCPresentationDocumentStatus" },
            "documentTypeId": { "dataType": "string", "required": true },
            "dateProvided": { "dataType": "datetime", "required": true },
        },
    },
    "LCPresentationStatus": {
        "enums": ["DRAFT", "DOCUMENTS_PRESENTED", "DOCUMENTS_COMPLIANT_BY_ISSUING_BANK", "DOCUMENTS_COMPLIANT_BY_NOMINATED_BANK", "DOCUMENTS_DISCREPANT_BY_NOMINATED_BANK", "DOCUMENTS_DISCREPANT_BY_ISSUING_BANK", "DOCUMENTS_RELEASED_TO_APPLICANT", "DISCREPANCIES_ADVISED_BY_NOMINATED_BANK", "DISCREPANCIES_ADVISED_BY_ISSUING_BANK", "DISCREPANCIES_ACCEPTED_BY_ISSUING_BANK", "DISCREPANCIES_REJECTED_BY_ISSUING_BANK", "DOCUMENTS_ACCEPTED_BY_APPLICANT", "DISCREPANCIES_REJECTED_BY_APPLICANT"],
    },
    "IStateTransition": {
        "properties": {
            "fromState": { "dataType": "string" },
            "toState": { "dataType": "string", "required": true },
            "performer": { "dataType": "string", "required": true },
            "date": { "dataType": "datetime", "required": true },
        },
    },
    "IContractReference": {
        "properties": {
            "contractAddress": { "dataType": "string" },
            "transactionHash": { "dataType": "string" },
            "key": { "dataType": "string", "required": true },
        },
    },
    "ILCPresentation": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "beneficiaryId": { "dataType": "string", "required": true },
            "applicantId": { "dataType": "string", "required": true },
            "issuingBankId": { "dataType": "string", "required": true },
            "nominatedBankId": { "dataType": "string" },
            "LCReference": { "dataType": "string", "required": true },
            "reference": { "dataType": "string", "required": true },
            "documents": { "dataType": "array", "array": { "ref": "ILCPresentationDocument" } },
            "applicantComments": { "dataType": "string" },
            "beneficiaryComments": { "dataType": "string" },
            "nominatedBankComments": { "dataType": "string" },
            "issuingBankComments": { "dataType": "string" },
            "status": { "ref": "LCPresentationStatus", "required": true },
            "stateHistory": { "dataType": "array", "array": { "ref": "IStateTransition" } },
            "submittedAt": { "dataType": "datetime" },
            "contracts": { "dataType": "array", "array": { "ref": "IContractReference" } },
            "destinationState": { "ref": "LCPresentationStatus" },
        },
    },
    "ITimerDataResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "timerId": { "dataType": "string" },
            "time": { "dataType": "datetime", "required": true },
            "status": { "dataType": "string" },
            "retry": { "dataType": "double" },
        },
    },
    "ITimerResponse": {
        "properties": {
            "submissionDateTime": { "dataType": "datetime", "required": true },
            "status": { "dataType": "string" },
            "timerData": { "dataType": "array", "array": { "ref": "ITimerDataResponse" }, "required": true },
        },
    },
    "TradeSource": {
        "enums": ["KOMGO", "VAKT"],
    },
    "ITradeAndCargoSnapshot": {
        "properties": {
            "_id": { "dataType": "string" },
            "source": { "ref": "TradeSource", "required": true },
            "sourceId": { "dataType": "string", "required": true },
            "trade": { "dataType": "any", "required": true },
            "cargo": { "dataType": "any", "required": true },
            "createdAt": { "dataType": "object" },
            "updatedAt": { "dataType": "object" },
        },
    },
    "IReferenceObject": {
        "properties": {
            "trigram": { "dataType": "string", "required": true },
            "year": { "dataType": "double", "required": true },
            "value": { "dataType": "double", "required": true },
        },
    },
    "ITaskModel": {
        "properties": {
            "name": { "dataType": "string", "required": true },
            "roles": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
    },
    "ILCResponse": {
        "properties": {
            "_id": { "dataType": "string" },
            "transactionHash": { "dataType": "string" },
            "applicantId": { "dataType": "string", "required": true },
            "applicantContactPerson": { "dataType": "string" },
            "beneficiaryId": { "dataType": "string", "required": true },
            "beneficiaryContactPerson": { "dataType": "string" },
            "issuingBankId": { "dataType": "string", "required": true },
            "issuingBankContactPerson": { "dataType": "string" },
            "direct": { "dataType": "boolean", "required": true },
            "beneficiaryBankId": { "dataType": "string" },
            "beneficiaryBankContactPerson": { "dataType": "string" },
            "beneficiaryBankRole": { "dataType": "string" },
            "tradeAndCargoSnapshot": { "ref": "ITradeAndCargoSnapshot" },
            "feesPayableBy": { "dataType": "string", "required": true },
            "type": { "dataType": "string", "required": true },
            "applicableRules": { "dataType": "string", "required": true },
            "currency": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "expiryDate": { "dataType": "object", "required": true },
            "expiryPlace": { "dataType": "string", "required": true },
            "availableWith": { "dataType": "string", "required": true },
            "availableBy": { "dataType": "string", "required": true },
            "partialShipmentAllowed": { "dataType": "boolean" },
            "transhipmentAllowed": { "dataType": "boolean" },
            "documentPresentationDeadlineDays": { "dataType": "double", "required": true },
            "comments": { "dataType": "string" },
            "templateType": { "dataType": "string" },
            "reason": { "dataType": "string" },
            "amendmentId": { "dataType": "string" },
            "parcelId": { "dataType": "string" },
            "contractAddress": { "dataType": "string" },
            "cargoIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "reference": { "dataType": "string" },
            "referenceObject": { "ref": "IReferenceObject" },
            "issuingBankReference": { "dataType": "string" },
            "status": { "dataType": "string" },
            "tasks": { "dataType": "array", "array": { "ref": "ITaskModel" } },
            "template": { "dataType": "string" },
            "issuingBankComments": { "dataType": "string" },
            "advisingBankComments": { "dataType": "string" },
            "beneficiaryComments": { "dataType": "string" },
            "billOfLadingEndorsement": { "dataType": "string" },
            "invoiceRequirement": { "dataType": "string" },
            "commercialContractDocumentHash": { "dataType": "string" },
            "draftLCDocumentHash": { "dataType": "string" },
            "stateHistory": { "dataType": "array", "array": { "ref": "IStateTransition" } },
            "LOI": { "dataType": "string" },
            "LOIAllowed": { "dataType": "boolean" },
            "LOIType": { "dataType": "string" },
            "freeText": { "dataType": "string" },
            "destinationState": { "dataType": "string" },
            "nonce": { "dataType": "double" },
            "issueDueDate": { "dataType": "any" },
            "createdAt": { "dataType": "string" },
            "updatedAt": { "dataType": "string" },
            "presentations": { "dataType": "array", "array": { "ref": "ILCPresentation" } },
            "timer": { "ref": "ITimerResponse" },
        },
    },
    "IPaginateILCResponse[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "ILCResponse" }, "required": true },
            "total": { "dataType": "double", "required": true },
        },
    },
    "IComment": {
        "properties": {
            "comment": { "dataType": "string", "required": true },
        },
    },
    "ILCPresentationActionCommentRequest": {
        "properties": {
            "comment": { "dataType": "string", "required": true },
        },
    },
    "IDocumentFedbackResponse": {
        "properties": {
            "document": { "ref": "IDocumentRegisterResponse", "required": true },
            "status": { "dataType": "string", "required": true },
            "note": { "dataType": "string", "required": true },
        },
    },
    "IPresentationSharedDocuments": {
        "properties": {
            "companyId": { "dataType": "string", "required": true },
            "documents": { "dataType": "array", "array": { "ref": "IDocumentFedbackResponse" }, "required": true },
            "feedbackReceived": { "dataType": "boolean", "required": true },
        },
    },
    "IDiff": {
        "properties": {
            "op": { "dataType": "enum", "enums": ["_get", "test", "copy", "move", "replace", "remove", "add"], "required": true },
            "path": { "dataType": "string", "required": true },
            "from": { "dataType": "string" },
            "value": { "dataType": "any", "required": true },
            "oldValue": { "dataType": "any", "required": true },
            "type": { "dataType": "string", "required": true },
        },
    },
    "ILCAmendmentBase": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "lcStaticId": { "dataType": "string", "required": true },
            "lcReference": { "dataType": "string", "required": true },
            "diffs": { "dataType": "array", "array": { "ref": "IDiff" }, "required": true },
        },
    },
    "ILCAmendmentRejection": {
        "properties": {
            "comment": { "dataType": "string" },
        },
    },
    "LCAmendmentStatus": {
        "enums": ["REQUESTED", "APPROVED_BY_ISSUING_BANK", "REJECTED_BY_ISSUING_BANK", "APPROVED_BY_ADVISING_BANK", "REJECTED_BY_ADVISING_BANK", "ACCEPTED_BY_BENEFICIARY", "REJECTED_BY_BENEFICIARY", "PENDING", "FAILED"],
    },
    "IState": {
        "properties": {
            "fromState": { "dataType": "string", "required": true },
            "toState": { "dataType": "string", "required": true },
            "performer": { "dataType": "string", "required": true },
            "date": { "dataType": "string", "required": true },
        },
    },
    "ILCAmendmentDocument": {
        "properties": {
            "documentId": { "dataType": "string" },
            "documentHash": { "dataType": "string", "required": true },
        },
    },
    "ILCAmendment": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "lcStaticId": { "dataType": "string", "required": true },
            "lcReference": { "dataType": "string", "required": true },
            "diffs": { "dataType": "array", "array": { "ref": "IDiff" }, "required": true },
            "status": { "ref": "LCAmendmentStatus", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
            "documentHash": { "dataType": "string" },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "reference": { "dataType": "string" },
            "stateHistory": { "dataType": "array", "array": { "ref": "IState" } },
            "transactionHash": { "dataType": "string" },
            "contractAddress": { "dataType": "string" },
            "documents": { "dataType": "array", "array": { "ref": "ILCAmendmentDocument" } },
        },
    },
    "BeneficiaryBankRole": {
        "enums": ["ADVISING_BANK", "CONFIRMING_BANK", "NEGOTIATING_BANK"],
    },
    "CompanyRoles": {
        "enums": ["APPLICANT", "BENEFICIARY", "ISSUING", "ADVISING", "NEGOTIATING", "NOT_PARTY"],
    },
    "Currency": {
        "enums": ["AED", "CHF", "EUR", "GBP", "JPY", "USD"],
    },
    "DuplicateClause": {
        "enums": ["YES", "NO"],
    },
    "Fee": {
        "enums": ["APPLICANT", "BENEFICIARY", "SPLIT"],
    },
    "IStandbyLetterOfCreditBase": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "tradeId": { "dataType": "any", "required": true },
            "issuingBankId": { "dataType": "string", "required": true },
            "beneficiaryBankId": { "dataType": "string" },
            "beneficiaryBankRole": { "ref": "BeneficiaryBankRole" },
            "beneficiaryId": { "dataType": "string", "required": true },
            "applicantId": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "expiryDate": { "dataType": "object", "required": true },
            "availableWith": { "ref": "CompanyRoles" },
            "contractDate": { "dataType": "object", "required": true },
            "contractReference": { "dataType": "string", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "duplicateClause": { "ref": "DuplicateClause", "required": true },
            "feesPayableBy": { "ref": "Fee", "required": true },
            "additionalInformation": { "dataType": "string" },
            "overrideStandardTemplate": { "dataType": "string", "required": true },
        },
    },
    "IPeriod": {
        "properties": {
            "startDate": { "dataType": "object", "required": true },
            "endDate": { "dataType": "object", "required": true },
        },
    },
    "PaymentTermsOption": {
        "enums": ["DEFERRED", "SIGHT"],
    },
    "PaymentTermsWhen": {
        "enums": ["FROM", "AFTER"],
    },
    "PaymentTermsTimeUnit": {
        "enums": ["DAYS", "MONTHS", "YEARS"],
    },
    "PaymentTermsDayType": {
        "enums": ["CALENDAR", "WORKING DAYS"],
    },
    "IPaymentTerms": {
        "properties": {
            "eventBase": { "dataType": "object", "required": true },
            "when": { "ref": "PaymentTermsWhen", "required": true },
            "time": { "dataType": "double", "required": true },
            "timeUnit": { "ref": "PaymentTermsTimeUnit", "required": true },
            "dayType": { "ref": "PaymentTermsDayType", "required": true },
        },
    },
    "PriceUnit": {
        "enums": ["BBL", "MT", "GAL", "M3", "DMT", "WMT", "KG", "MMBTU"],
    },
    "InvoiceQuantity": {
        "enums": ["LOAD", "DISCHARGE"],
    },
    "CreditRequirements": {
        "enums": ["DOCUMENTARY_LETTER_OF_CREDIT", "STANDBY_LETTER_OF_CREDIT", "OPEN_CREDIT", "OFFSET", "CREDIT_PENDING"],
    },
    "PriceOption": {
        "enums": ["FIX", "FLOATING"],
    },
    "TRADE_SCHEMA_VERSION": {
        "enums": ["1", "2"],
    },
    "ITrade": {
        "properties": {
            "source": { "ref": "TradeSource", "required": true },
            "commodity": { "dataType": "object" },
            "seller": { "dataType": "string", "required": true },
            "sellerEtrmId": { "dataType": "string" },
            "buyer": { "dataType": "string", "required": true },
            "buyerEtrmId": { "dataType": "string" },
            "dealDate": { "dataType": "object", "required": true },
            "deliveryPeriod": { "ref": "IPeriod" },
            "paymentTermsOption": { "ref": "PaymentTermsOption" },
            "paymentTerms": { "ref": "IPaymentTerms" },
            "price": { "dataType": "double" },
            "currency": { "ref": "Currency", "required": true },
            "priceUnit": { "ref": "PriceUnit" },
            "quantity": { "dataType": "double" },
            "deliveryTerms": { "dataType": "object", "required": true },
            "deliveryLocation": { "dataType": "string" },
            "minTolerance": { "dataType": "double" },
            "maxTolerance": { "dataType": "double" },
            "invoiceQuantity": { "ref": "InvoiceQuantity" },
            "generalTermsAndConditions": { "dataType": "string" },
            "laytime": { "dataType": "string" },
            "demurrageTerms": { "dataType": "string" },
            "law": { "dataType": "object" },
            "requiredDocuments": { "dataType": "array", "array": { "dataType": "string" } },
            "creditRequirement": { "ref": "CreditRequirements", "required": true },
            "contractReference": { "dataType": "string" },
            "contractDate": { "dataType": "object" },
            "priceOption": { "ref": "PriceOption" },
            "priceFormula": { "dataType": "string" },
            "version": { "ref": "TRADE_SCHEMA_VERSION" },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "sourceId": { "dataType": "string", "required": true },
            "_id": { "dataType": "string", "required": true },
            "status": { "dataType": "string", "required": true },
            "deletedAt": { "dataType": "string" },
        },
    },
    "PARCEL_SCHEMA_VERSION": {
        "enums": ["1", "2"],
    },
    "IParcel": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "laycanPeriod": { "ref": "IPeriod", "required": true },
            "modeOfTransport": { "dataType": "object" },
            "vesselIMO": { "dataType": "double" },
            "vesselName": { "dataType": "string" },
            "loadingPort": { "dataType": "string" },
            "loadingPlace": { "dataType": "string" },
            "dischargeArea": { "dataType": "string" },
            "destinationPlace": { "dataType": "string" },
            "inspector": { "dataType": "string" },
            "deemedBLDate": { "dataType": "object" },
            "quantity": { "dataType": "double", "required": true },
            "tankFarmOperatorName": { "dataType": "string" },
            "pipelineName": { "dataType": "string" },
            "warehouseOperatorName": { "dataType": "string" },
            "version": { "ref": "PARCEL_SCHEMA_VERSION" },
        },
    },
    "CARGO_SCHEMA_VERSION": {
        "enums": ["1", "2"],
    },
    "ICargo": {
        "properties": {
            "source": { "ref": "TradeSource", "required": true },
            "sourceId": { "dataType": "string", "required": true },
            "grade": { "dataType": "object" },
            "quality": { "dataType": "string" },
            "originOfGoods": { "dataType": "string" },
            "parcels": { "dataType": "array", "array": { "ref": "IParcel" }, "required": true },
            "cargoId": { "dataType": "string", "required": true },
            "version": { "ref": "CARGO_SCHEMA_VERSION" },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "_id": { "dataType": "string", "required": true },
            "status": { "dataType": "string", "required": true },
            "deletedAt": { "dataType": "string" },
        },
    },
    "StandbyLetterOfCreditStatus": {
        "enums": ["REQUESTED", "REQUEST_REJECTED", "ISSUED_REJECTED", "ISSUED", "ADVISED", "ACKNOWLEDGED", "COLLECTING", "PENDING", "DRAFT", "FAILED"],
    },
    "IStandbyLetterOfCredit": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "tradeId": { "dataType": "any", "required": true },
            "issuingBankId": { "dataType": "string", "required": true },
            "beneficiaryBankId": { "dataType": "string" },
            "beneficiaryBankRole": { "ref": "BeneficiaryBankRole" },
            "beneficiaryId": { "dataType": "string", "required": true },
            "applicantId": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "expiryDate": { "dataType": "object", "required": true },
            "availableWith": { "ref": "CompanyRoles" },
            "contractDate": { "dataType": "object", "required": true },
            "contractReference": { "dataType": "string", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "duplicateClause": { "ref": "DuplicateClause", "required": true },
            "feesPayableBy": { "ref": "Fee", "required": true },
            "additionalInformation": { "dataType": "string" },
            "overrideStandardTemplate": { "dataType": "string", "required": true },
            "reference": { "dataType": "string", "required": true },
            "documentHash": { "dataType": "string" },
            "commercialContractDocumentHash": { "dataType": "string" },
            "issuingBankPostalAddress": { "dataType": "string" },
            "issuingBankComment": { "dataType": "string" },
            "issuingBankReference": { "dataType": "string" },
            "stateHistory": { "dataType": "array", "array": { "ref": "IState" }, "required": true },
            "staticId": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
            "transactionHash": { "dataType": "string" },
            "contractAddress": { "dataType": "string" },
            "tradeSnapshot": { "ref": "ITrade", "required": true },
            "cargoSnapshot": { "ref": "ICargo", "required": true },
            "updatedAt": { "dataType": "object", "required": true },
            "createdAt": { "dataType": "object", "required": true },
            "status": { "ref": "StandbyLetterOfCreditStatus", "required": true },
            "nonce": { "dataType": "double" },
        },
    },
    "ISBLCRejectRequest": {
        "properties": {
            "issuingBankReference": { "dataType": "string" },
        },
    },
    "IPaginateIStandbyLetterOfCredit[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "IStandbyLetterOfCredit" }, "required": true },
            "total": { "dataType": "double", "required": true },
        },
    },
    "LetterOfCreditStatus": {
        "enums": ["REQUESTED", "REQUESTED_VERIFICATION_PENDING", "REQUESTED_VERIFICATION_FAILED", "REQUEST_REJECTED", "REQUEST_REJECTED_PENDING", "REQUEST_REJECTED_VERIFICATION_FAILED", "ISSUED", "ISSUED_VERIFICATION_PENDING", "ISSUED_VERIFICATION_FAILED", "ISSUED_REJECTED", "ADVISED", "ACKNOWLEDGED", "COLLECTING", "PENDING", "DRAFT", "FAILED"],
    },
    "T": {
    },
    "ITemplateInstanceT": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "templateStaticId": { "dataType": "string", "required": true },
            "template": { "dataType": "any", "required": true },
            "templateSchemaId": { "dataType": "string", "required": true },
            "data": { "ref": "T", "required": true },
            "dataSchemaId": { "dataType": "string", "required": true },
            "bindings": { "dataType": "any", "required": true },
        },
    },
    "LetterOfCreditType": {
        "enums": ["STANDBY", "DOCUMENTARY"],
    },
    "ILetterOfCreditIDataLetterOfCredit": {
        "properties": {
            "version": { "dataType": "double" },
            "templateInstance": { "ref": "ITemplateInstanceT" },
            "type": { "ref": "LetterOfCreditType", "required": true },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "reference": { "dataType": "string", "required": true },
            "stateHistory": { "dataType": "array", "array": { "ref": "IState" } },
            "staticId": { "dataType": "string" },
            "transactionHash": { "dataType": "string" },
            "contractAddress": { "dataType": "string" },
            "deletedAt": { "dataType": "string" },
            "status": { "ref": "LetterOfCreditStatus", "required": true },
            "nonce": { "dataType": "double" },
            "hashedData": { "dataType": "string" },
            "issuingDocumentHash": { "dataType": "string" },
        },
    },
    "HttpException": {
        "properties": {
            "stack": { "dataType": "object" },
            "status": { "dataType": "double", "required": true },
            "errorObject": { "dataType": "object", "required": true },
            "message": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
    },
    "ILetterOfCreditBaseIDataLetterOfCreditBase": {
        "properties": {
            "version": { "dataType": "double" },
            "templateInstance": { "ref": "ITemplateInstanceT" },
            "type": { "ref": "LetterOfCreditType", "required": true },
        },
    },
    "IPaginateArray": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "ILetterOfCreditIDataLetterOfCredit" }, "required": true },
            "total": { "dataType": "double", "required": true },
        },
    },
};
const validationService = new ValidationService(models);

export function RegisterRoutes(app: express.Express) {
    app.get('/v0/healthz',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<HealthController>(HealthController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.Healthz.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/ready',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<HealthController>(HealthController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.Ready.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/documents/:documentId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "read"] }, { "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "manageCollection"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                documentId: { "in": "path", "name": "documentId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLCDocument.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/documents/:documentId/content',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "read"] }, { "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "manageCollection"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                documentId: { "in": "path", "name": "documentId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLCDocumentContent.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/task/issue',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewLCApplication", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.issueLC.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/task/requestReject',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewLCApplication", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IRejectLCRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.requestReject.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/task/advise',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewIssuedLC", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.advise.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/task/acknowledge',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewIssuedLC", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.acknowledge.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/task/rejectBeneficiary',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewIssuedLC", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IRejectLCRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.rejectBeneficiary.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/task/rejectAdvising',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewIssuedLC", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IRejectLCRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.rejectAdvising.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "body", "name": "request", "required": true, "ref": "ICreateLCRequest" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.createLC.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "read"] }, { "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "manageCollection"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLC.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/:id/documents',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "read"] }, { "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "manageCollection"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLCDocuments.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "read"] }, { "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "manageCollection"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "in": "query", "name": "filter", "required": true, "dataType": "any" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCController>(LCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLCs.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentations',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                lcId: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.addPresentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/:id/presentations/:presentationId/documents',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getPresentationDocuments.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/:id/presentations/:presentationId/vaktDocuments',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getPresentationVaktDocuments.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentation/:presentationId/upload',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.uploadPresentationDocument.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/lc/presentations/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.deletePresentationById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/lc/presentations/:id/documents/:documentId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                documentId: { "in": "path", "name": "documentId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.deletePresentationDocument.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/presentations/:presentationId/submit',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IComment" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.submitPresentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/lc/:id/presentations/:presentationId/addDocuments',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "dataType": "array", "array": { "dataType": "string" } },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.addDocuments.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentations/:presentationId/compliant',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.markCompliant.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentations/:presentationId/discrepant',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "ILCPresentationActionCommentRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.markDiscrepant.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentations/:presentationId/adviseDiscrepancies',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "ILCPresentationActionCommentRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.adviseDsicrepancies.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentations/:presentationId/acceptDiscrepancies',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "ILCPresentationActionCommentRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.acceptDiscrepancies.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:id/presentations/:presentationId/rejectDiscrepancies',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }, { "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "ILCPresentationActionCommentRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.rejectDiscrepancies.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/:id/presentations/:presentationId/received-documents',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewPresentation", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getPresentationDocumentReview.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/:id/presentations/:presentationId/documents-feedback',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "managePresentation"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                presentationId: { "in": "path", "name": "presentationId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCPresentationController>(LCPresentationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getPresentationFeedback.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/:lcStaticId/amendments',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                lcStaticId: { "in": "path", "name": "lcStaticId", "required": true, "dataType": "string" },
                amendment: { "in": "body", "name": "amendment", "required": true, "ref": "ILCAmendmentBase" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCAmendmentController>(LCAmendmentController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/amendments/:lcAmendmentStaticId/approve',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                lcAmendmentStaticId: { "in": "path", "name": "lcAmendmentStaticId", "required": true, "dataType": "string" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCAmendmentController>(LCAmendmentController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.approve.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/lc/amendments/:lcAmendmentStaticId/reject',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                lcAmendmentStaticId: { "in": "path", "name": "lcAmendmentStaticId", "required": true, "dataType": "string" },
                rejection: { "in": "body", "name": "rejection", "required": true, "ref": "ILCAmendmentRejection" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCAmendmentController>(LCAmendmentController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.reject.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/lc/amendments/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageCollection"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LCAmendmentController>(LCAmendmentController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/standby-letters-of-credit',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageSBLCRequest"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sblc: { "in": "body", "name": "sblc", "required": true, "ref": "IStandbyLetterOfCreditBase" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/standby-letters-of-credit/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageSBLCRequest"] }, { "withPermission": ["tradeFinance", "reviewSBLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/standby-letters-of-credit/:sblcStaticId/issue',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewSBLC", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sblcStaticId: { "in": "path", "name": "sblcStaticId", "required": true, "dataType": "string" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.issueSBLC.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/standby-letters-of-credit/:sblcStaticId/rejectrequest',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewSBLC", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sblcStaticId: { "in": "path", "name": "sblcStaticId", "required": true, "dataType": "string" },
                sblcRejectIssueRequest: { "in": "body", "name": "sblcRejectIssueRequest", "required": true, "ref": "ISBLCRejectRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.rejectIssueSBLC.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/standby-letters-of-credit/:id/documents',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageSBLCRequest"] }, { "withPermission": ["tradeFinance", "reviewSBLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getDocuments.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/standby-letters-of-credit/documents/:documentId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageSBLCRequest"] }, { "withPermission": ["tradeFinance", "reviewSBLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                documentId: { "in": "path", "name": "documentId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLCDocument.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/standby-letters-of-credit/documents/:documentId/content',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageSBLCRequest"] }, { "withPermission": ["tradeFinance", "reviewSBLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                documentId: { "in": "path", "name": "documentId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getLCDocumentContent.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/standby-letters-of-credit',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageSBLCRequest"] }, { "withPermission": ["tradeFinance", "reviewSBLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "default": {}, "in": "query", "name": "filter", "dataType": "any" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SBLCController>(SBLCController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/letterofcredit',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "manageLCRequest"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                letterOfCredit: { "in": "body", "name": "letterOfCredit", "required": true, "ref": "ILetterOfCreditBaseIDataLetterOfCreditBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LetterOfCreditController>(LetterOfCreditController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/letterofcredit/:staticId/issue',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewLCApplication", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LetterOfCreditController>(LetterOfCreditController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.issue.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/letterofcredit/:staticId/rejectrequest',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "reviewLCApplication", "readWrite"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                letterOfCreditBase: { "in": "body", "name": "letterOfCreditBase", "required": true, "ref": "ILetterOfCreditBaseIDataLetterOfCreditBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LetterOfCreditController>(LetterOfCreditController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.rejectRequest.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/letterofcredit/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LetterOfCreditController>(LetterOfCreditController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/letterofcredit/type/:type',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LetterOfCreditController>(LetterOfCreditController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getAll.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/letterofcredit',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageLCRequest"] }, { "withPermission": ["tradeFinance", "reviewLCApplication", "read"] }, { "withPermission": ["tradeFinance", "reviewIssuedLC", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "default": {}, "in": "query", "name": "filter", "dataType": "any" },
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<LetterOfCreditController>(LetterOfCreditController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return (request: any, _response: any, next: any) => {
            let responded = 0;
            let success = false;

            const succeed = function(user: any) {
                if (!success) {
                    success = true;
                    responded++;
                    request['user'] = user;
                    next();
                }
            }

            const fail = function(error: any) {
                responded++;
                if (responded == security.length && !success) {
                    error.status = 401;
                    next(error)
                }
            }

            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    let promises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        promises.push(expressAuthentication(request, name, secMethod[name]));
                    }

                    Promise.all(promises)
                        .then((users) => { succeed(users[0]); })
                        .catch(fail);
                } else {
                    for (const name in secMethod) {
                        expressAuthentication(request, name, secMethod[name])
                            .then(succeed)
                            .catch(fail);
                    }
                }
            }
        }
    }

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                if (isController(controllerObj)) {
                    const headers = controllerObj.getHeaders();
                    Object.keys(headers).forEach((name: string) => {
                        response.set(name, headers[name]);
                    });

                    statusCode = controllerObj.getStatus();
                }

                if (data || data === false) { // === false allows boolean result
                    response.status(statusCode || 200).json(data);
                } else {
                    response.status(statusCode || 204).end();
                }
            })
            .catch((error: any) => next(error));
    }

    function getValidatedArgs(args: any, request: any): any[] {
        const fieldErrors: FieldErrors = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors);
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors);
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors);
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, name + '.');
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.');
            }
        });
        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
