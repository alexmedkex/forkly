/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { CompaniesController } from './../../service-layer/controllers/CompaniesController';
import { MembersController } from './../../service-layer/controllers/MembersController';
import { expressAuthentication } from './../common/authentication/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "apiUsers": { "dataType": "string", "required": true },
            "apiRegistry": { "dataType": "string", "required": true },
            "commonMessagingAgent": { "dataType": "string", "required": true },
            "harbor": { "dataType": "string", "required": true },
        },
    },
    "Status": {
        "enums": ["Draft", "Pending", "Ready", "Revoked", "Onboarded", "Registered"],
    },
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
    "MemberType": {
        "enums": ["FMS", "SMS", "LMS", "3"],
    },
    "IRSAKey": {
        "properties": {
            "kty": { "dataType": "string", "required": true },
            "kid": { "dataType": "string", "required": true },
            "n": { "dataType": "string", "required": true },
            "e": { "dataType": "string", "required": true },
        },
    },
    "IMessagingPublicKey": {
        "properties": {
            "validFrom": { "dataType": "string", "required": true },
            "validTo": { "dataType": "string", "required": true },
            "key": { "ref": "IRSAKey", "required": true },
        },
    },
    "IEthereumPublicKey": {
        "properties": {
            "validFrom": { "dataType": "string", "required": true },
            "validTo": { "dataType": "string", "required": true },
            "address": { "dataType": "string", "required": true },
            "key": { "dataType": "string", "required": true },
        },
    },
    "IVakt": {
        "properties": {
            "staticId": { "dataType": "string", "required": true },
            "mnid": { "dataType": "string", "required": true },
            "messagingPublicKey": { "ref": "IMessagingPublicKey", "required": true },
        },
    },
    "ICompanyModel": {
        "properties": {
            "rabbitMQCommonUser": { "dataType": "string" },
            "rabbitMQCommonPassword": { "dataType": "string" },
            "harborUser": { "dataType": "string" },
            "harborEmail": { "dataType": "string" },
            "harborPassword": { "dataType": "string" },
            "status": { "ref": "Status", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "komgoMnid": { "dataType": "string", "required": true },
            "x500Name": { "ref": "IX500Name", "required": true },
            "hasSWIFTKey": { "dataType": "boolean", "required": true },
            "isFinancialInstitution": { "dataType": "boolean", "required": true },
            "isMember": { "dataType": "boolean", "required": true },
            "companyAdminEmail": { "dataType": "string" },
            "memberType": { "ref": "MemberType" },
            "messagingPublicKey": { "ref": "IMessagingPublicKey" },
            "ethereumPublicKey": { "ref": "IEthereumPublicKey" },
            "keycloakUserId": { "dataType": "string" },
            "nodeKeys": { "dataType": "string" },
            "addedToENS": { "dataType": "boolean" },
            "addedToMQ": { "dataType": "boolean" },
            "vakt": { "ref": "IVakt" },
            "isDeactivated": { "dataType": "boolean" },
        },
    },
    "ICompanyRequest": {
        "properties": {
            "x500Name": { "ref": "IX500Name", "required": true },
            "hasSWIFTKey": { "dataType": "boolean", "required": true },
            "isFinancialInstitution": { "dataType": "boolean", "required": true },
            "isMember": { "dataType": "boolean", "required": true },
            "memberType": { "ref": "MemberType" },
            "vakt": { "ref": "IVakt" },
            "companyAdminEmail": { "dataType": "string" },
        },
    },
    "IBottomSheetId": {
        "properties": {
            "bottomsheetId": { "dataType": "string", "required": true },
        },
    },
    "IActivateCompanyRequest": {
        "properties": {
            "active": { "dataType": "boolean", "required": true },
        },
    },
    "IUpdateCompany": {
        "properties": {
            "x500Name": { "ref": "IX500Name", "required": true },
            "hasSWIFTKey": { "dataType": "boolean", "required": true },
            "isFinancialInstitution": { "dataType": "boolean", "required": true },
            "isMember": { "dataType": "boolean", "required": true },
            "memberType": { "ref": "MemberType" },
            "vakt": { "ref": "IVakt" },
            "companyAdminEmail": { "dataType": "string" },
            "bottomsheetId": { "dataType": "string", "required": true },
        },
    },
    "IMemberPackage": {
        "properties": {
            "rabbitMQCommonUser": { "dataType": "string" },
            "rabbitMQCommonPassword": { "dataType": "string" },
            "harborUser": { "dataType": "string" },
            "harborEmail": { "dataType": "string" },
            "harborPassword": { "dataType": "string" },
            "ensAddress": { "dataType": "string", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "komgoMnid": { "dataType": "string", "required": true },
        },
    },
    "IPublicKeyRequest": {
        "properties": {
            "messagingPublicKey": { "ref": "IMessagingPublicKey" },
            "ethereumPublicKey": { "ref": "IEthereumPublicKey" },
            "nodeKeys": { "dataType": "string" },
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
    app.get('/v0/companies',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerNonMembers"] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getCompanies.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/companies',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerNonMembers"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                data: { "in": "body", "name": "data", "required": true, "ref": "ICompanyRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.createCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/companies/:staticId',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerNonMembers"] }]),
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

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/companies/:staticId/member-package',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerAndOnboardAnyMember"] }]),
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

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.generateMemberPackage.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/companies/:staticId/ens',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerAnyMember"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "IBottomSheetId" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.addCompanyToENS.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/companies/:staticId/configure-mq',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerAnyMember"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "IBottomSheetId" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.configureMQRoute.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/companies/:staticId/is-active',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerAnyMember"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "IActivateCompanyRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.activateCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/companies/:staticId',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerAnyMember"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "IUpdateCompany" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.updateCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/companies/:staticId',
        authenticateMiddleware([{ "withPermission": ["administration", "onboard", "registerAnyMember"] }]),
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

            const controller = iocContainer.get<CompaniesController>(CompaniesController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.deleteCompany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/members/member-package',
        authenticateMiddleware([{ "withPermission": ["administration", "manageCustomerData", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<MembersController>(MembersController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.downloadMemberPackage.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/members/public-keys',
        authenticateMiddleware([{ "withPermission": ["administration", "manageCustomerData", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "IPublicKeyRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<MembersController>(MembersController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.addPublicKeys.apply(controller, validatedArgs as any);
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
