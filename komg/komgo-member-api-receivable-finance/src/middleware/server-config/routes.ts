/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { ReceivablesDiscountingController } from './../../service-layer/controllers/ReceivablesDiscountingController';
import { RFPController } from './../../service-layer/controllers/RFPController';
import { RDQuotesController } from './../../service-layer/controllers/RDQuotesController';
import { TradeSnapshotController } from './../../service-layer/controllers/TradeSnapshotController';
import { AggregatedInformationController } from './../../service-layer/controllers/AggregatedInformationController';
import { expressAuthentication } from './../authentication/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "rabbitMQ": { "dataType": "string", "required": true },
            "apiRFP": { "dataType": "string", "required": true },
            "apiRegistry": { "dataType": "string", "required": true },
            "apiTradeCargo": { "dataType": "string", "required": true },
            "apiNotif": { "dataType": "string", "required": true },
        },
    },
    "IReceivablesDiscountingCreated": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
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
    "ITradeReference": {
        "properties": {
            "sourceId": { "dataType": "string", "required": true },
            "sellerEtrmId": { "dataType": "string", "required": true },
            "source": { "dataType": "string", "required": true },
        },
    },
    "RequestType": {
        "enums": ["RISK_COVER", "RISK_COVER_DISCOUNTING", "DISCOUNT"],
    },
    "DiscountingType": {
        "enums": ["WITHOUT_RECOURSE", "RECOURSE", "BLENDED"],
    },
    "Currency": {
        "enums": ["AED", "CHF", "EUR", "GBP", "JPY", "USD"],
    },
    "InvoiceType": {
        "enums": ["INDICATIVE", "PROVISIONAL", "FINAL"],
    },
    "SupportingInstrument": {
        "enums": ["CREDIT_INSURANCE", "FINANCIAL_INSTRUMENT", "PAYMENT_CONFIRMATION", "PARENT_COMPANY_GUARANTEE", "PAYMENT_UNDERTAKING", "BILL_OF_EXCHANGE", "PROMISSORY_NOTE"],
    },
    "FinancialInstrument": {
        "enums": ["STANDBY_LETTER_OF_CREDIT", "LETTER_OF_CREDIT", "OTHER"],
    },
    "IFinancialInstrumentInfo": {
        "properties": {
            "financialInstrument": { "ref": "FinancialInstrument", "required": true },
            "financialInstrumentIssuerName": { "dataType": "string", "required": true },
            "financialInstrumentIfOther": { "dataType": "string" },
        },
    },
    "IReceivablesDiscountingBase": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "tradeReference": { "ref": "ITradeReference", "required": true },
            "requestType": { "ref": "RequestType", "required": true },
            "discountingType": { "ref": "DiscountingType" },
            "invoiceAmount": { "dataType": "double", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "invoiceType": { "ref": "InvoiceType", "required": true },
            "supportingInstruments": { "dataType": "array", "array": { "ref": "SupportingInstrument" }, "required": true },
            "advancedRate": { "dataType": "double" },
            "dateOfPerformance": { "dataType": "string" },
            "discountingDate": { "dataType": "string" },
            "riskCoverDate": { "dataType": "string" },
            "numberOfDaysRiskCover": { "dataType": "double" },
            "numberOfDaysDiscounting": { "dataType": "double" },
            "financialInstrumentInfo": { "ref": "IFinancialInstrumentInfo" },
            "guarantor": { "dataType": "string" },
            "comment": { "dataType": "string" },
        },
    },
    "IReceivablesDiscounting": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "tradeReference": { "ref": "ITradeReference", "required": true },
            "requestType": { "ref": "RequestType", "required": true },
            "discountingType": { "ref": "DiscountingType" },
            "invoiceAmount": { "dataType": "double", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "invoiceType": { "ref": "InvoiceType", "required": true },
            "supportingInstruments": { "dataType": "array", "array": { "ref": "SupportingInstrument" }, "required": true },
            "advancedRate": { "dataType": "double" },
            "dateOfPerformance": { "dataType": "string" },
            "discountingDate": { "dataType": "string" },
            "riskCoverDate": { "dataType": "string" },
            "numberOfDaysRiskCover": { "dataType": "double" },
            "numberOfDaysDiscounting": { "dataType": "double" },
            "financialInstrumentInfo": { "ref": "IFinancialInstrumentInfo" },
            "guarantor": { "dataType": "string" },
            "comment": { "dataType": "string" },
            "staticId": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "string" },
            "updatedAt": { "dataType": "string" },
        },
    },
    "IHistoryEntryT": {
    },
    "IHistoryIReceivablesDiscounting": {
        "properties": {
            "id": { "dataType": "string" },
            "historyEntry": { "ref": "IHistoryEntryT" },
        },
    },
    "ParticipantRFPStatus": {
        "enums": ["REQUESTED", "REQUEST_DECLINED", "REQUEST_EXPIRED", "QUOTE_SUBMITTED", "QUOTE_DECLINED", "QUOTE_ACCEPTED"],
    },
    "ReplyType": {
        "enums": ["SUBMITTED", "REJECTED", "ACCEPTED", "DECLINED", "ADD_DISCOUNTING_REQUEST", "ACCEPT_DISCOUNTING_REQUEST", "DECLINE_DISCOUNTING_REQUEST"],
    },
    "PricingType": {
        "enums": ["RISK_FEE", "FLAT_FEE", "SPLIT", "ALL_IN", "MARGIN"],
    },
    "IMonetaryAmount": {
        "properties": {
            "amount": { "dataType": "double", "required": true },
            "currency": { "ref": "Currency", "required": true },
        },
    },
    "InterestType": {
        "enums": ["COST_OF_FUNDS", "LIBOR", "ADD_ON_LIBOR"],
    },
    "LiborType": {
        "enums": ["PUBLISHED", "INTERPOLATED"],
    },
    "FeeCalculationType": {
        "enums": ["STRAIGHT", "YIELD", "OTHER"],
    },
    "IQuote": {
        "properties": {
            "advanceRate": { "dataType": "double", "required": true },
            "pricingType": { "ref": "PricingType", "required": true },
            "pricingAllIn": { "dataType": "double" },
            "pricingFlatFeeAmount": { "ref": "IMonetaryAmount" },
            "pricingRiskFee": { "dataType": "double" },
            "pricingMargin": { "dataType": "double" },
            "numberOfDaysRiskCover": { "dataType": "double" },
            "numberOfDaysDiscounting": { "dataType": "double" },
            "interestType": { "ref": "InterestType" },
            "indicativeCof": { "dataType": "double" },
            "addOnValue": { "dataType": "double" },
            "liborType": { "ref": "LiborType" },
            "daysUntilMaturity": { "dataType": "double" },
            "feeCalculationType": { "ref": "FeeCalculationType" },
            "otherFeeCalculationAmount": { "ref": "IMonetaryAmount" },
            "comment": { "dataType": "string" },
            "staticId": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string" },
        },
    },
    "IParticipantRFPReply": {
        "properties": {
            "type": { "ref": "ReplyType", "required": true },
            "createdAt": { "dataType": "string", "required": true },
            "senderStaticId": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
            "quote": { "ref": "IQuote" },
        },
    },
    "IParticipantRFPSummary": {
        "properties": {
            "participantStaticId": { "dataType": "string", "required": true },
            "status": { "ref": "ParticipantRFPStatus", "required": true },
            "replies": { "dataType": "array", "array": { "ref": "IParticipantRFPReply" }, "required": true },
        },
    },
    "IRFPSummariesResponse": {
        "properties": {
            "summaries": { "dataType": "array", "array": { "ref": "IParticipantRFPSummary" }, "required": true },
        },
    },
    "ActionStatus": {
        "enums": ["Created", "Processed", "Failed"],
    },
    "IOutboundActionResult": {
        "properties": {
            "recipientStaticId": { "dataType": "string", "required": true },
            "status": { "ref": "ActionStatus", "required": true },
        },
    },
    "IRFPRequestResponse": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "actionStatuses": { "dataType": "array", "array": { "ref": "IOutboundActionResult" }, "required": true },
        },
    },
    "ReceivablesDiscountingRFPRequest": {
        "properties": {
            "rdId": { "dataType": "string", "required": true },
            "participantStaticIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
    },
    "IRFPReplyResponse": {
        "properties": {
            "rfpId": { "dataType": "string", "required": true },
            "actionStatus": { "ref": "IOutboundActionResult", "required": true },
        },
    },
    "QuoteSubmission": {
        "properties": {
            "rdId": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
            "quoteId": { "dataType": "string", "required": true },
        },
    },
    "RFPReply": {
        "properties": {
            "rdId": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
        },
    },
    "IRFPAcceptResponse": {
        "properties": {
            "rfpId": { "dataType": "string", "required": true },
            "actionStatuses": { "dataType": "array", "array": { "ref": "IOutboundActionResult" }, "required": true },
        },
    },
    "QuoteAccept": {
        "properties": {
            "rdId": { "dataType": "string", "required": true },
            "comment": { "dataType": "string" },
            "quoteId": { "dataType": "string", "required": true },
            "participantStaticId": { "dataType": "string", "required": true },
        },
    },
    "IStaticIdResponse": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
        },
    },
    "IQuoteBase": {
        "properties": {
            "advanceRate": { "dataType": "double", "required": true },
            "pricingType": { "ref": "PricingType", "required": true },
            "pricingAllIn": { "dataType": "double" },
            "pricingFlatFeeAmount": { "ref": "IMonetaryAmount" },
            "pricingRiskFee": { "dataType": "double" },
            "pricingMargin": { "dataType": "double" },
            "numberOfDaysRiskCover": { "dataType": "double" },
            "numberOfDaysDiscounting": { "dataType": "double" },
            "interestType": { "ref": "InterestType" },
            "indicativeCof": { "dataType": "double" },
            "addOnValue": { "dataType": "double" },
            "liborType": { "ref": "LiborType" },
            "daysUntilMaturity": { "dataType": "double" },
            "feeCalculationType": { "ref": "FeeCalculationType" },
            "otherFeeCalculationAmount": { "ref": "IMonetaryAmount" },
            "comment": { "dataType": "string" },
        },
    },
    "IHistoryIQuote": {
        "properties": {
            "id": { "dataType": "string" },
            "historyEntry": { "ref": "IHistoryEntryT" },
        },
    },
    "IHistoryITradeSnapshot": {
        "properties": {
            "id": { "dataType": "string" },
            "historyEntry": { "ref": "IHistoryEntryT" },
        },
    },
    "TradeSource": {
        "enums": ["KOMGO", "VAKT"],
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
            "paymentTerms": { "dataType": "any" },
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
            "_id": { "dataType": "string" },
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
    "ITradeSnapshot": {
        "properties": {
            "source": { "dataType": "string", "required": true },
            "sourceId": { "dataType": "string", "required": true },
            "trade": { "ref": "ITrade", "required": true },
            "movements": { "dataType": "array", "array": { "ref": "ICargo" }, "required": true },
            "createdAt": { "dataType": "string" },
            "updatedAt": { "dataType": "string" },
        },
    },
    "RDStatus": {
        "enums": ["PENDING_REQUEST", "REQUESTED", "REQUEST_DECLINED", "REQUEST_EXPIRED", "QUOTE_SUBMITTED", "QUOTE_DECLINED", "QUOTE_ACCEPTED"],
    },
    "IReceivablesDiscountingInfo": {
        "properties": {
            "rd": { "ref": "IReceivablesDiscounting", "required": true },
            "tradeSnapshot": { "ref": "ITradeSnapshot" },
            "status": { "ref": "RDStatus", "required": true },
            "rfp": { "dataType": "any" },
            "acceptedParticipantStaticId": { "dataType": "string" },
        },
    },
    "IPaginateIReceivablesDiscountingInfo[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "IReceivablesDiscountingInfo" }, "required": true },
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
    app.post('/v0/rd',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rdBase: { "in": "body", "name": "rdBase", "required": true, "ref": "IReceivablesDiscountingBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/rd/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                rdBase: { "in": "body", "name": "rdBase", "required": true, "dataType": "any" },
                replace: { "default": false, "in": "query", "name": "replace", "dataType": "boolean" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/rd/:id/history',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
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

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getHistory.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/rd/:rdId/request-for-proposal',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rdId: { "in": "path", "name": "rdId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getRFP.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/rd/:rdId/request-for-proposal/:participantId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rdId: { "in": "path", "name": "rdId", "required": true, "dataType": "string" },
                participantId: { "in": "path", "name": "participantId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getParticipantRFP.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/rd/:rdId/share',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rdId: { "in": "path", "name": "rdId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.share.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/rd/:rdId/add-discounting',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rdId: { "in": "path", "name": "rdId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ReceivablesDiscountingController>(ReceivablesDiscountingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.addDiscounting.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/request-for-proposal/request',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rfpRequest: { "in": "body", "name": "rfpRequest", "required": true, "ref": "ReceivablesDiscountingRFPRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RFPController>(RFPController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/request-for-proposal/submit-quote',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRDRequest", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                quoteSubmission: { "in": "body", "name": "quoteSubmission", "required": true, "ref": "QuoteSubmission" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RFPController>(RFPController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.submitQuote.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/request-for-proposal/reject',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRDRequest", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                rfpRejection: { "in": "body", "name": "rfpRejection", "required": true, "ref": "RFPReply" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RFPController>(RFPController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.reject.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/request-for-proposal/accept-quote',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                quoteAccept: { "in": "body", "name": "quoteAccept", "required": true, "ref": "QuoteAccept" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RFPController>(RFPController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.acceptQuote.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/quote/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
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

            const controller = iocContainer.get<RDQuotesController>(RDQuotesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/quote',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "crud"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                quote: { "in": "body", "name": "quote", "required": true, "ref": "IQuoteBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RDQuotesController>(RDQuotesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/quote/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRDRequest", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                quote: { "in": "body", "name": "quote", "required": true, "ref": "IQuoteBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RDQuotesController>(RDQuotesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/quote/:staticId/share',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRDRequest", "crud"] }]),
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

            const controller = iocContainer.get<RDQuotesController>(RDQuotesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.share.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/quote/:staticId/history',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
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

            const controller = iocContainer.get<RDQuotesController>(RDQuotesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getHistory.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/trade/:sourceId/history',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sourceId: { "in": "path", "name": "sourceId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TradeSnapshotController>(TradeSnapshotController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getHistory.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/info/rd/:rdId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rdId: { "in": "path", "name": "rdId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<AggregatedInformationController>(AggregatedInformationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getRdInfo.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/info/rd',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageRDRequest", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "default": "", "in": "query", "name": "filter", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<AggregatedInformationController>(AggregatedInformationController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.findRdInfo.apply(controller, validatedArgs as any);
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
