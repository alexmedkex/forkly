/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { IsPermittedController } from './../../service-layer/controllers/IsPermittedController';
import { PermissionsByRolesController } from './../../service-layer/controllers/PermissionsByRolesController';
import { RolesController } from './../../service-layer/controllers/RolesController';
import { RoleTemplatesController } from './../../service-layer/controllers/RoleTemplatesController';
import { expressAuthentication } from './../common/authentication/authentication';

import { KomgoRequestContextCreator } from '@komgo/microservice-config';

import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
        },
        "additionalProperties": true,
    },
    "IIsPermittedResponse": {
        "properties": {
            "isPermitted": { "dataType": "boolean", "required": true },
        },
        "additionalProperties": true,
    },
    "IPermittedRequest": {
        "properties": {
            "roles": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "permissions": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
        "additionalProperties": true,
    },
    "IRoleProductResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "label": { "dataType": "string" },
        },
        "additionalProperties": true,
    },
    "IRoleActionResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "label": { "dataType": "string" },
        },
        "additionalProperties": true,
    },
    "IRolePermissionResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "label": { "dataType": "string" },
        },
        "additionalProperties": true,
    },
    "IRolePermittedActionResponse": {
        "properties": {
            "product": { "ref": "IRoleProductResponse" },
            "action": { "ref": "IRoleActionResponse" },
            "permission": { "ref": "IRolePermissionResponse" },
        },
        "additionalProperties": true,
    },
    "IRoleResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "label": { "dataType": "string" },
            "description": { "dataType": "string" },
            "permittedActions": { "dataType": "array", "array": { "ref": "IRolePermittedActionResponse" } },
        },
        "additionalProperties": true,
    },
    "IRolePermittedActionRequest": {
        "properties": {
            "product": { "dataType": "string", "required": true },
            "action": { "dataType": "string" },
            "permission": { "dataType": "string" },
        },
        "additionalProperties": true,
    },
    "IRoleRequest": {
        "properties": {
            "label": { "dataType": "string", "required": true },
            "description": { "dataType": "string" },
            "permittedActions": { "dataType": "array", "array": { "ref": "IRolePermittedActionRequest" } },
        },
        "additionalProperties": true,
    },
    "IRoleRequestWithoutLabel": {
        "properties": {
            "description": { "dataType": "string" },
            "permittedActions": { "dataType": "array", "array": { "ref": "IRolePermittedActionRequest" } },
        },
        "additionalProperties": true,
    },
    "IActionPermissionsResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "label": { "dataType": "string" },
            "permissions": { "dataType": "array", "array": { "ref": "IRolePermissionResponse" } },
        },
        "additionalProperties": true,
    },
    "IProductActionsResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "label": { "dataType": "string" },
            "actions": { "dataType": "array", "array": { "ref": "IActionPermissionsResponse" } },
        },
        "additionalProperties": true,
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

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<HealthController>(HealthController);
            } finally {
                komgoReqCtxCreator.remove();
            }
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

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<HealthController>(HealthController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.Ready.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/is-permitted',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                body: { "in": "body", "name": "body", "required": true, "ref": "IPermittedRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<IsPermittedController>(IsPermittedController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetPermission.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/permissions-by-roles',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                rolesQuery: { "in": "query", "name": "roles", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<PermissionsByRolesController>(PermissionsByRolesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetPermissions.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/roles',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "query", "name": "productId", "dataType": "string" },
                actionId: { "in": "query", "name": "actionId", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<RolesController>(RolesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetRoles.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/roles',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                body: { "in": "body", "name": "body", "required": true, "ref": "IRoleRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<RolesController>(RolesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.CreateRoles.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/roles/:roleId',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                roleId: { "in": "path", "name": "roleId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<RolesController>(RolesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetRole.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/roles/:roleId',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                roleId: { "in": "path", "name": "roleId", "required": true, "dataType": "string" },
                body: { "in": "body", "name": "body", "required": true, "ref": "IRoleRequestWithoutLabel" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<RolesController>(RolesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.PutRole.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/v0/roles/:roleId',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                roleId: { "in": "path", "name": "roleId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<RolesController>(RolesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.DeleteRole.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/role-templates',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<RoleTemplatesController>(RoleTemplatesController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetTemplates.apply(controller, validatedArgs as any);
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
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, { "specVersion": 2 });
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, { "specVersion": 2 });
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, { "specVersion": 2 });
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, name + '.', { "specVersion": 2 });
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', { "specVersion": 2 });
            }
        });
        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
