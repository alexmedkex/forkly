/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { CounterpartyController } from './../../service-layer/controllers/CounterpartyController';
import { CompanyController } from './../../service-layer/controllers/CompanyController';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { CounterpartyProfileController } from './../../service-layer/controllers/CounterpartyProfileController';
import { expressAuthentication } from './../authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IX500Name": {
        "properties": {
            "CN": { "dataType": "string", "required": true },
            "O": { "dataType": "string", "required": true },
            "C": { "dataType": "string", "required": true },
            "L": { "dataType": "string", "required": true },
            "STREET": { "dataType": "string", "required": true },
            "PC": { "dataType": "string", "required": true },
        },
    },
    "ICounterpartyRequest": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "hasSWIFTKey": { "dataType": "boolean", "required": true },
            "isFinancialInstitution": { "dataType": "boolean", "required": true },
            "isMember": { "dataType": "boolean", "required": true },
            "x500Name": { "ref": "IX500Name", "required": true },
            "covered": { "dataType": "boolean" },
            "status": { "dataType": "string", "required": true },
            "coverageRequestId": { "dataType": "string" },
            "timestamp": { "dataType": "datetime" },
            "requestId": { "dataType": "string", "required": true },
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
    "IAddCounterpartiesRequest": {
        "properties": {
            "companyIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
    },
    "ICounterparty": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "hasSWIFTKey": { "dataType": "boolean", "required": true },
            "isFinancialInstitution": { "dataType": "boolean", "required": true },
            "isMember": { "dataType": "boolean", "required": true },
            "x500Name": { "ref": "IX500Name", "required": true },
            "covered": { "dataType": "boolean" },
            "status": { "dataType": "string", "required": true },
            "coverageRequestId": { "dataType": "string" },
            "timestamp": { "dataType": "datetime" },
        },
    },
    "ICompany": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "hasSWIFTKey": { "dataType": "boolean", "required": true },
            "isFinancialInstitution": { "dataType": "boolean", "required": true },
            "isMember": { "dataType": "boolean", "required": true },
            "komgoMnid": { "dataType": "string", "required": true },
            "x500Name": { "ref": "IX500Name", "required": true },
            "status": { "dataType": "string" },
        },
    },
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "api-notif": { "dataType": "string", "required": true },
            "api-registry": { "dataType": "string", "required": true },
            "rabbitMQ": { "dataType": "string", "required": true },
        },
    },
    "RiskLevel": {
        "enums": ["0", "low", "medium", "high"],
    },
    "ICounterpartyProfileResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "counterpartyId": { "dataType": "string", "required": true },
            "riskLevel": { "ref": "RiskLevel", "required": true },
            "renewalDate": { "dataType": "datetime", "required": true },
            "managedById": { "dataType": "string", "required": true },
        },
    },
    "CreateCounterpartyProfileRequest": {
        "properties": {
            "counterpartyId": { "dataType": "string", "required": true },
            "riskLevel": { "dataType": "string" },
            "renewalDate": { "dataType": "datetime" },
            "managedById": { "dataType": "string" },
        },
    },
    "UpdateCounterpartyProfileRequest": {
        "properties": {
            "riskLevel": { "dataType": "string" },
            "renewalDate": { "dataType": "datetime" },
            "managedById": { "dataType": "string" },
        },
    },
};
const validationService = new ValidationService(models);

export function RegisterRoutes(app: express.Express) {
    app.get('/v0/counterparties/requests/:requestId',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                requestId: { "in": "path", "name": "requestId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getRequest.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparties/add',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                req: { "in": "body", "name": "req", "required": true, "ref": "IAddCounterpartiesRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.addList.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparties/add/auto',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                req: { "in": "body", "name": "req", "required": true, "ref": "IAddCounterpartiesRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.autoAddList.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparties/:companyid/add',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                companyid: { "in": "path", "name": "companyid", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.add.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparties/:companyid/resend',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                companyid: { "in": "path", "name": "companyid", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.resend.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/counterparties',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                queryParams: { "in": "query", "name": "query", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/counterparties/all',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                queryParams: { "in": "query", "name": "query", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.findAll.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparties/:companyid/approve',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                companyid: { "in": "path", "name": "companyid", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.approve.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparties/:companyid/reject',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                companyid: { "in": "path", "name": "companyid", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyController>(CounterpartyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.reject.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/companies/not-covered',
        authenticateMiddleware([{ "withPermission": ["coverage", "manageCoverage", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                query: { "in": "query", "name": "query", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompanyController>(CompanyController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.find.apply(controller, validatedArgs as any);
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
    app.get('/v0/counterparty-profile/:counterpartyId',
        authenticateMiddleware([{ "withPermission": ["kyc", "manageDoc", "crudAndShare"] }, { "withPermission": ["kyc", "reviewDoc"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                counterpartyId: { "in": "path", "name": "counterpartyId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyProfileController>(CounterpartyProfileController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getCounterpartyProfile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/counterparty-profile',
        authenticateMiddleware([{ "withPermission": ["kyc", "manageDoc", "crudAndShare"] }, { "withPermission": ["kyc", "reviewDoc"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                newProfile: { "in": "body", "name": "newProfile", "required": true, "ref": "CreateCounterpartyProfileRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyProfileController>(CounterpartyProfileController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.postCounterpartyProfile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/counterparty-profile/:counterpartyId',
        authenticateMiddleware([{ "withPermission": ["kyc", "manageDoc", "crudAndShare"] }, { "withPermission": ["kyc", "reviewDoc"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                counterpartyId: { "in": "path", "name": "counterpartyId", "required": true, "dataType": "string" },
                updateProfile: { "in": "body", "name": "updateProfile", "required": true, "ref": "UpdateCounterpartyProfileRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CounterpartyProfileController>(CounterpartyProfileController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.patchCounterpartyProfile.apply(controller, validatedArgs as any);
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
