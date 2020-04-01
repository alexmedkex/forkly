/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './inversify/ioc';
import { CargoController } from './service-layer/controllers/CargoController';
import { TradeController } from './service-layer/controllers/TradeController';
import { HealthController } from './service-layer/controllers/HealthController';
import { expressAuthentication } from './middleware/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IIdentifier": {
        "properties": {
            "_id": { "dataType": "string", "required": true },
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
    "TradeSource": {
        "enums": ["KOMGO", "VAKT"],
    },
    "IPeriod": {
        "properties": {
            "startDate": { "dataType": "object", "required": true },
            "endDate": { "dataType": "object", "required": true },
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
    "ICargoBase": {
        "properties": {
            "source": { "ref": "TradeSource", "required": true },
            "sourceId": { "dataType": "string", "required": true },
            "grade": { "dataType": "object" },
            "quality": { "dataType": "string" },
            "originOfGoods": { "dataType": "string" },
            "parcels": { "dataType": "array", "array": { "ref": "IParcel" }, "required": true },
            "cargoId": { "dataType": "string", "required": true },
            "version": { "ref": "CARGO_SCHEMA_VERSION" },
        },
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
    "IPaginateICargo[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "ICargo" }, "required": true },
            "total": { "dataType": "double", "required": true },
        },
    },
    "ICreateTradeResponse": {
        "properties": {
            "_id": { "dataType": "string", "required": true },
            "source": { "dataType": "string", "required": true },
            "sourceId": { "dataType": "string", "required": true },
        },
    },
    "PaymentTermsOption": {
        "enums": ["DEFERRED", "SIGHT"],
    },
    "Currency": {
        "enums": ["AED", "CHF", "EUR", "GBP", "JPY", "USD"],
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
    "ITradeBase": {
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
        },
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
    "IPaginateITrade[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "ITrade" }, "required": true },
            "total": { "dataType": "double", "required": true },
        },
    },
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "rabbitMQ": { "dataType": "string", "required": true },
            "api-notif": { "dataType": "string", "required": true },
            "api-registry": { "dataType": "string", "required": true },
            "api-coverage": { "dataType": "string", "required": true },
        },
    },
};
const validationService = new ValidationService(models);

export function RegisterRoutes(app: express.Express) {
    app.post('/v0/movements',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                receivedRequest: { "in": "body", "name": "receivedRequest", "required": true, "ref": "ICargoBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CargoController>(CargoController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/movements/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                source: { "in": "query", "name": "source", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CargoController>(CargoController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.delete.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/movements/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                receivedRequest: { "in": "body", "name": "receivedRequest", "required": true, "ref": "ICargo" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CargoController>(CargoController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/movements/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                source: { "in": "query", "name": "source", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CargoController>(CargoController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/movements',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "default": {}, "in": "query", "name": "filter", "dataType": "any" },
                source: { "in": "query", "name": "source", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CargoController>(CargoController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/trades',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                receivedTradeRequest: { "in": "body", "name": "receivedTradeRequest", "required": true, "ref": "ITradeBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TradeController>(TradeController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/trades/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "read"] }]),
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

            const controller = iocContainer.get<TradeController>(TradeController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/trades',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "default": {}, "in": "query", "name": "filter", "dataType": "any" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TradeController>(TradeController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/trades/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "crud"] }]),
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

            const controller = iocContainer.get<TradeController>(TradeController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.delete.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/trades/:id',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
                receivedTradeRequest: { "in": "body", "name": "receivedTradeRequest", "required": true, "ref": "ITrade" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TradeController>(TradeController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/trades/:id/movements',
        authenticateMiddleware([{ "withPermission": ["tradeFinance", "manageTrades", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                filter: { "default": {}, "in": "query", "name": "filter", "dataType": "any" },
                id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TradeController>(TradeController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.fetchMovements.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
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
                    return request.query[name];
                case 'path':
                    return request.params[name]
                case 'header':
                    return request.header(name);
                case 'body':
                    return request.body
                case 'body-prop':
                    return request.body[name];
            }
        });
        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
