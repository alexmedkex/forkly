/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { TemplateController } from './../../service-layer/controllers/TemplateController';
import { TemplateBindingController } from './../../service-layer/controllers/TemplateBindingController';
import { expressAuthentication } from './../common/authentication/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
        },
    },
    "Product": {
        "enums": ["KYC", "TRADE_FINANCE", "LETTER_OF_CREDIT", "RECEIVABLE_DISCOUNTING"],
    },
    "SubProduct": {
        "enums": ["TRADE", "RECEIVABLE_DISCOUNT", "LETTER_OF_CREDIT", "STANDBY_LETTER_OF_CREDIT"],
    },
    "TemplateOrigin": {
        "enums": ["SYSTEM", "COMPANY"],
    },
    "ITemplate": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "name": { "dataType": "string", "required": true },
            "ownerCompanyStaticId": { "dataType": "string", "required": true },
            "templateBindingStaticId": { "dataType": "string", "required": true },
            "productId": { "ref": "Product", "required": true },
            "subProductId": { "ref": "SubProduct", "required": true },
            "commodity": { "dataType": "object" },
            "revision": { "dataType": "double", "required": true },
            "template": { "dataType": "any", "required": true },
            "origin": { "ref": "TemplateOrigin" },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "createdBy": { "dataType": "string", "required": true },
            "updatedBy": { "dataType": "string" },
            "deletedAt": { "dataType": "string" },
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
    "ITemplateBase": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "name": { "dataType": "string", "required": true },
            "ownerCompanyStaticId": { "dataType": "string", "required": true },
            "templateBindingStaticId": { "dataType": "string", "required": true },
            "productId": { "ref": "Product", "required": true },
            "subProductId": { "ref": "SubProduct", "required": true },
            "commodity": { "dataType": "object" },
            "revision": { "dataType": "double", "required": true },
            "template": { "dataType": "any", "required": true },
            "origin": { "ref": "TemplateOrigin" },
        },
    },
    "IPaginateITemplate[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "ITemplate" }, "required": true },
            "total": { "dataType": "double", "required": true },
        },
    },
    "ITemplateBinding": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "productId": { "ref": "Product", "required": true },
            "subProductId": { "ref": "SubProduct", "required": true },
            "bindings": { "dataType": "any", "required": true },
            "permissions": { "dataType": "any" },
            "dataSchemaId": { "dataType": "string", "required": true },
            "templateSchemaId": { "dataType": "string", "required": true },
            "example": { "dataType": "any", "required": true },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "deletedAt": { "dataType": "string" },
        },
    },
    "ITemplateBindingBase": {
        "properties": {
            "version": { "dataType": "double", "required": true },
            "productId": { "ref": "Product", "required": true },
            "subProductId": { "ref": "SubProduct", "required": true },
            "bindings": { "dataType": "any", "required": true },
            "permissions": { "dataType": "any" },
            "dataSchemaId": { "dataType": "string", "required": true },
            "templateSchemaId": { "dataType": "string", "required": true },
            "example": { "dataType": "any", "required": true },
        },
    },
    "IPaginateITemplateBinding[]": {
        "properties": {
            "limit": { "dataType": "double", "required": true },
            "skip": { "dataType": "double", "required": true },
            "items": { "dataType": "array", "array": { "ref": "ITemplateBinding" }, "required": true },
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
    app.post('/v0/templates',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                template: { "in": "body", "name": "template", "required": true, "ref": "ITemplateBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TemplateController>(TemplateController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/templates/:staticId',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                staticId: { "in": "path", "name": "staticId", "required": true, "dataType": "string" },
                template: { "in": "body", "name": "template", "required": true, "ref": "ITemplateBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TemplateController>(TemplateController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.update.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/templates/:staticId',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "crud"] }]),
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

            const controller = iocContainer.get<TemplateController>(TemplateController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.delete.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/templates/:staticId',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "read"] }]),
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

            const controller = iocContainer.get<TemplateController>(TemplateController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/templates',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "read"] }]),
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

            const controller = iocContainer.get<TemplateController>(TemplateController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getAll.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/templatebindings',
        function(request: any, response: any, next: any) {
            const args = {
                baseTemplateBinding: { "in": "body", "name": "baseTemplateBinding", "required": true, "ref": "ITemplateBindingBase" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TemplateBindingController>(TemplateBindingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/templatebindings/:staticId',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "read"] }]),
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

            const controller = iocContainer.get<TemplateBindingController>(TemplateBindingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.get.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/templatebindings',
        authenticateMiddleware([{ "withPermission": ["template", "manageTemplates", "read"] }]),
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

            const controller = iocContainer.get<TemplateBindingController>(TemplateBindingController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getAll.apply(controller, validatedArgs as any);
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
