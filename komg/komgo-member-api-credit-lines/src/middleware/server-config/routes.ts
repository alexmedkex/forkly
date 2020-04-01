/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { CreditLineController } from './../../service-layer/controllers/CreditLineController';
import { DisclosedCreditLineController } from './../../service-layer/controllers/DisclosedCreditLineController';
import { RequestController } from './../../service-layer/controllers/RequestController';
import { DepositLoanController } from './../../service-layer/controllers/DepositLoanController';
import { DisclosedDepositLoanController } from './../../service-layer/controllers/DisclosedDepositLoanController';
import { DepositLoanRequestController } from './../../service-layer/controllers/DepositLoanRequestController';
import { expressAuthentication } from './../common/authentication/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "api-coverage": { "dataType": "string", "required": true },
            "api-registry": { "dataType": "string", "required": true },
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
    "IProductContext": {
        "properties": {
            "productId": { "dataType": "string", "required": true },
            "subProductId": { "dataType": "string" },
        },
    },
    "Currency": {
        "enums": ["AED", "CHF", "EUR", "GBP", "JPY", "USD"],
    },
    "IShared": {
        "properties": {
            "shared": { "dataType": "boolean", "required": true },
        },
    },
    "IInformationShared": {
        "properties": {
            "appetite": { "ref": "IShared" },
            "availability": { "ref": "IShared" },
            "availabilityAmount": { "ref": "IShared" },
            "creditLimit": { "ref": "IShared" },
            "fee": { "dataType": "any" },
            "maximumTenor": { "dataType": "any" },
            "margin": { "dataType": "any" },
        },
    },
    "ISharedCreditLineRequest": {
        "properties": {
            "staticId": { "dataType": "string" },
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "sharedWithStaticId": { "dataType": "string", "required": true },
            "data": { "ref": "IInformationShared", "required": true },
        },
    },
    "ICreditLineSaveRequest": {
        "properties": {
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "context": { "ref": "IProductContext", "required": true },
            "appetite": { "dataType": "boolean", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "creditLimit": { "dataType": "object" },
            "availability": { "dataType": "boolean", "required": true },
            "availabilityAmount": { "dataType": "object" },
            "sharedCreditLines": { "dataType": "array", "array": { "ref": "ISharedCreditLineRequest" } },
            "creditExpiryDate": { "dataType": "datetime" },
            "data": { "dataType": "any", "required": true },
        },
    },
    "ISharedCreditLineIInformationShared": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "sharedWithStaticId": { "dataType": "string", "required": true },
            "creditLineStaticId": { "dataType": "string", "required": true },
            "data": { "ref": "IInformationShared", "required": true },
        },
    },
    "ICreditLineResponse": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "context": { "ref": "IProductContext", "required": true },
            "appetite": { "dataType": "boolean", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "availability": { "dataType": "boolean", "required": true },
            "creditLimit": { "dataType": "double" },
            "availabilityAmount": { "dataType": "double" },
            "availabilityAmountUpdatedAt": { "dataType": "datetime" },
            "creditExpiryDate": { "dataType": "datetime" },
            "data": { "dataType": "any" },
            "sharedCreditLines": { "dataType": "array", "array": { "ref": "ISharedCreditLineIInformationShared" } },
            "updatedAt": { "dataType": "string", "required": true },
        },
    },
    "IDisclosedCreditLine": {
        "properties": {
            "ownerStaticId": { "dataType": "string", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "context": { "ref": "IProductContext", "required": true },
            "appetite": { "dataType": "boolean", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "availability": { "dataType": "boolean", "required": true },
            "availabilityAmount": { "dataType": "double" },
            "creditLimit": { "dataType": "double" },
            "data": { "dataType": "any" },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
            "deletedAt": { "dataType": "datetime" },
        },
    },
    "IDisclosedCreditLineSummary": {
        "properties": {
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "lowestRiskFee": { "dataType": "double", "required": true },
            "lowestFee": { "dataType": "double", "required": true },
            "availabilityCount": { "dataType": "double", "required": true },
            "appetiteCount": { "dataType": "double", "required": true },
        },
    },
    "ICreateCreditLineRequest": {
        "properties": {
            "context": { "ref": "IProductContext", "required": true },
            "comment": { "dataType": "string", "required": true },
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "companyIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
    },
    "CreditLineRequestType": {
        "enums": ["REQUESTED", "RECEIVED"],
    },
    "CreditLineRequestStatus": {
        "enums": ["PENDING", "DECLINED", "DISCLOSED"],
    },
    "ICreditLineRequestDocument": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "requestType": { "ref": "CreditLineRequestType", "required": true },
            "context": { "ref": "IProductContext", "required": true },
            "comment": { "dataType": "string", "required": true },
            "counterpartyStaticId": { "dataType": "string", "required": true },
            "companyStaticId": { "dataType": "string", "required": true },
            "status": { "ref": "CreditLineRequestStatus", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
            "deletedAt": { "dataType": "datetime" },
        },
    },
    "DepositLoanType": {
        "enums": ["DEPOSIT", "LOAN"],
    },
    "DepositLoanPeriod": {
        "enums": ["DAYS", "WEEKS", "MONTHS", "YEARS", "OVERNIGHT"],
    },
    "ISaveSharedDepositLoan": {
        "properties": {
            "appetite": { "ref": "IShared" },
            "sharedWithStaticId": { "dataType": "string", "required": true },
            "pricing": { "dataType": "any", "required": true },
        },
    },
    "ISaveDepositLoan": {
        "properties": {
            "appetite": { "dataType": "boolean", "required": true },
            "type": { "ref": "DepositLoanType", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "period": { "ref": "DepositLoanPeriod", "required": true },
            "periodDuration": { "dataType": "double" },
            "pricing": { "dataType": "object" },
            "sharedWith": { "dataType": "array", "array": { "ref": "ISaveSharedDepositLoan" }, "required": true },
        },
    },
    "ISharedDepositLoan": {
        "properties": {
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "appetite": { "ref": "IShared" },
            "staticId": { "dataType": "string", "required": true },
            "sharedWithStaticId": { "dataType": "string", "required": true },
            "depositLoanStaticId": { "dataType": "string", "required": true },
            "pricing": { "dataType": "any", "required": true },
        },
    },
    "IDepositLoanResponse": {
        "properties": {
            "appetite": { "dataType": "boolean", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "type": { "ref": "DepositLoanType", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "pricing": { "dataType": "object" },
            "pricingUpdatedAt": { "dataType": "string" },
            "period": { "ref": "DepositLoanPeriod", "required": true },
            "periodDuration": { "dataType": "double" },
            "updatedAt": { "dataType": "string", "required": true },
            "sharedWith": { "dataType": "array", "array": { "ref": "ISharedDepositLoan" }, "required": true },
        },
    },
    "IDisclosedDepositLoan": {
        "properties": {
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "appetite": { "dataType": "boolean", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "type": { "ref": "DepositLoanType", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "pricing": { "dataType": "object" },
            "pricingUpdatedAt": { "dataType": "string" },
            "period": { "ref": "DepositLoanPeriod", "required": true },
            "periodDuration": { "dataType": "double" },
            "ownerStaticId": { "dataType": "string", "required": true },
        },
    },
    "IDisclosedDepositLoanSummary": {
        "properties": {
            "type": { "ref": "DepositLoanType", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "period": { "ref": "DepositLoanPeriod", "required": true },
            "periodDuration": { "dataType": "double" },
            "lowestPricing": { "dataType": "double", "required": true },
            "appetiteCount": { "dataType": "double", "required": true },
            "lastUpdated": { "dataType": "string", "required": true },
        },
    },
    "ISaveDepositLoanRequest": {
        "properties": {
            "type": { "ref": "DepositLoanType", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "period": { "ref": "DepositLoanPeriod", "required": true },
            "periodDuration": { "dataType": "double" },
            "comment": { "dataType": "string", "required": true },
            "companyIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
    },
    "DepositLoanRequestType": {
        "enums": ["REQUESTED", "RECEIVED"],
    },
    "DepositLoanRequestStatus": {
        "enums": ["PENDING", "DECLINED", "DISCLOSED"],
    },
    "IDepositLoanRequestDocument": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "requestType": { "ref": "DepositLoanRequestType", "required": true },
            "type": { "ref": "DepositLoanType", "required": true },
            "currency": { "ref": "Currency", "required": true },
            "period": { "ref": "DepositLoanPeriod", "required": true },
            "periodDuration": { "dataType": "double" },
            "comment": { "dataType": "string", "required": true },
            "companyStaticId": { "dataType": "string", "required": true },
            "status": { "ref": "DepositLoanRequestStatus", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
            "deletedAt": { "dataType": "datetime" },
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
    app.post('/v0/credit-lines/product/:productId/sub-product/:subProductId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "crud"] }, { "withPermission": ["tradeFinance", "manageBankLines", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                creditLine: { "in": "body", "name": "creditLine", "required": true, "ref": "ICreditLineSaveRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CreditLineController>(CreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/credit-lines/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "crud"] }, { "withPermission": ["tradeFinance", "manageBankLines", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                creditLine: { "in": "body", "name": "creditLine", "required": true, "ref": "ICreditLineSaveRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CreditLineController>(CreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/credit-lines/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
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

            const controller = iocContainer.get<CreditLineController>(CreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/credit-lines/product/:productId/sub-product/:subproductId/:counterpartyStaticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subproductId", "required": true, "dataType": "string" },
                counterpartyStaticId: { "in": "path", "name": "counterpartyStaticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CreditLineController>(CreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getByProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/credit-lines/product/:productId/sub-product/:subProductId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CreditLineController>(CreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/credit-lines/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "crud"] }, { "withPermission": ["tradeFinance", "manageBankLines", "crud"] }]),
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

            const controller = iocContainer.get<CreditLineController>(CreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.delete.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-credit-lines/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
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

            const controller = iocContainer.get<DisclosedCreditLineController>(DisclosedCreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-credit-lines/product/:productId/sub-product/:subProductId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedCreditLineController>(DisclosedCreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-credit-lines/product/:productId/sub-product/:subproductId/summary',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subproductId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedCreditLineController>(DisclosedCreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getSummaryByProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-credit-lines/product/:productId/sub-product/:subproductId/:counterpartyStaticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageRD", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subproductId", "required": true, "dataType": "string" },
                counterpartyStaticId: { "in": "path", "name": "counterpartyStaticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedCreditLineController>(DisclosedCreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getByProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-credit-lines/summary/product/:productId/sub-product/:subProductId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                contextParams: { "in": "query", "name": "context", "required": true, "dataType": "string" },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedCreditLineController>(DisclosedCreditLineController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getSummary.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/requests/product/:productId/sub-product/:subProductId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "crud"] }, { "withPermission": ["tradeFinance", "manageBankLines", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                creditLineRequest: { "in": "body", "name": "creditLineRequest", "required": true, "ref": "ICreateCreditLineRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/sent/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
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

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/:productId/sub-product/:subproductId/:counterpartyStaticId/sent',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subproductId", "required": true, "dataType": "string" },
                counterpartyStaticId: { "in": "path", "name": "counterpartyStaticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getByProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/product/:productId/sub-product/:subProductId/:counterpartyStaticId/sent',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                counterpartyStaticId: { "in": "path", "name": "counterpartyStaticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getByCounterparty.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/product/:productId/sub-product/:subProductId/sent',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.findSent.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/received/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
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

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getReceivedById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/product/:productId/sub-product/:subProductId/:counterpartyStaticId/received',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                counterpartyStaticId: { "in": "path", "name": "counterpartyStaticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getReceivedByProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/requests/received/product/:productId/sub-product/:subProductId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "read"] }, { "withPermission": ["tradeFinance", "manageBankLines", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subProductId", "required": true, "dataType": "string" },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.findReceived.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/requests/:productId/sub-product/:subproductId/:counterpartyStaticId/decline',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageRiskCover", "crud"] }, { "withPermission": ["tradeFinance", "manageBankLines", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "path", "name": "productId", "required": true, "dataType": "string" },
                subProductId: { "in": "path", "name": "subproductId", "required": true, "dataType": "string" },
                counterpartyStaticId: { "in": "path", "name": "counterpartyStaticId", "required": true, "dataType": "string" },
                requestIds: { "in": "body", "name": "requestIds", "required": true, "dataType": "array", "array": { "dataType": "string" } },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestController>(RequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.declinePendingRequests.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/deposit-loan/:type',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                request: { "in": "body", "name": "request", "required": true, "ref": "ISaveDepositLoan" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanController>(DepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/deposit-loan/:type/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "ISaveDepositLoan" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanController>(DepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/deposit-loan/:type/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "read"] }, { "withPermission": ["tradeFinance", "manageLoan", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanController>(DepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/deposit-loan/:type',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "read"] }, { "withPermission": ["tradeFinance", "manageLoan", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanController>(DepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/deposit-loan/:type/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanController>(DepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.delete.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-deposit-loans/:type/:staticId',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedDepositLoanController>(DisclosedDepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-deposit-loans/:type',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedDepositLoanController>(DisclosedDepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/disclosed-deposit-loans/type/:type/summary',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DisclosedDepositLoanController>(DisclosedDepositLoanController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getSummary.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/deposit-loan-requests/:type',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                request: { "in": "body", "name": "request", "required": true, "ref": "ISaveDepositLoanRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanRequestController>(DepositLoanRequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/deposit-loan-requests/:type/request-type/:requestType/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                requestType: { "in": "path", "name": "requestType", "required": true, "dataType": "enum", "enums": ["requested", "received"] },
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanRequestController>(DepositLoanRequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/deposit-loan-requests/:type/request-type/:requestType',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                requestType: { "in": "path", "name": "requestType", "required": true, "dataType": "enum", "enums": ["requested", "received"] },
                queryParams: { "in": "query", "name": "query", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanRequestController>(DepositLoanRequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/deposit-loan-requests/:type/currency/:currency/period/:period/period-duration/:periodDuration/request-type/:requestType',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                currency: { "in": "path", "name": "currency", "required": true, "dataType": "enum", "enums": ["AED", "CHF", "EUR", "GBP", "JPY", "USD"] },
                period: { "in": "path", "name": "period", "required": true, "dataType": "enum", "enums": ["DAYS", "WEEKS", "MONTHS", "YEARS", "OVERNIGHT"] },
                periodDuration: { "in": "path", "name": "periodDuration", "required": true, "dataType": "double" },
                requestType: { "in": "path", "name": "requestType", "required": true, "dataType": "enum", "enums": ["requested", "received"] },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanRequestController>(DepositLoanRequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getByCurrencyPeriod.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/deposit-loan-requests/:type/decline',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageDeposit", "crud"] }, { "withPermission": ["tradeFinance", "manageLoan", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                type: { "in": "path", "name": "type", "required": true, "dataType": "enum", "enums": ["deposit", "loan"] },
                requestIds: { "in": "body", "name": "requestIds", "required": true, "dataType": "array", "array": { "dataType": "string" } },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DepositLoanRequestController>(DepositLoanRequestController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.declinePendingRequests.apply(controller, validatedArgs as any);
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
