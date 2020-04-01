/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { MiscellaneousController } from './../../service-layer/controllers/MiscellaneousController';
import { ProfileController } from './../../service-layer/controllers/ProfileController';
import { RolesController } from './../../service-layer/controllers/RolesController';
import { UsersController } from './../../service-layer/controllers/UsersController';
import { SettingsController } from './../../service-layer/controllers/SettingsController';
import { KeycloakController } from './../../service-layer/controllers/KeycloakController';
import { expressAuthentication } from './../common/authentication';

import { KomgoRequestContextCreator } from '@komgo/microservice-config';

import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "keycloak": { "dataType": "string", "required": true },
            "apiRoles": { "dataType": "string", "required": true },
            "mongo": { "dataType": "string", "required": true },
        },
        "additionalProperties": true,
    },
    "IUserSettings": {
        "properties": {
            "userId": { "dataType": "string", "required": true },
            "sendInformationNotificationsByEmail": { "dataType": "boolean", "required": true },
            "sendTaskNotificationsByEmail": { "dataType": "boolean", "required": true },
        },
        "additionalProperties": true,
    },
    "IUserProfileResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "username": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "roles": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "email": { "dataType": "string", "required": true },
            "company": { "dataType": "string", "required": true },
            "settings": { "ref": "IUserSettings", "required": true },
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
    "IUserResponse": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "username": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "double", "required": true },
            "email": { "dataType": "string", "required": true },
            "roles": { "dataType": "array", "array": { "dataType": "string" } },
        },
        "additionalProperties": true,
    },
    "IAssignRoleRequest": {
        "properties": {
            "added": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "removed": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
        "additionalProperties": true,
    },
    "IRoleDeletedResponse": {
        "properties": {
            "roleId": { "dataType": "string", "required": true },
        },
        "additionalProperties": true,
    },
    "RequiredUserActions": {
        "enums": ["VERIFY_EMAIL", "UPDATE_PROFILE", "CONFIGURE_TOTP", "UPDATE_PASSWORD", "TERMS_AND_CONDITIONS"],
        "additionalProperties": true,
    },
    "IUserCreateRequest": {
        "properties": {
            "username": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "email": { "dataType": "string", "required": true },
            "requiredActions": { "dataType": "array", "array": { "ref": "RequiredUserActions" } },
        },
        "additionalProperties": true,
    },
    "IChangePasswordRequest": {
        "properties": {
            "currentPassword": { "dataType": "string", "required": true },
            "newPassword": { "dataType": "string", "required": true },
            "confirmNewPassword": { "dataType": "string", "required": true },
        },
        "additionalProperties": true,
    },
    "IUserSettingsRequest": {
        "properties": {
            "sendInformationNotificationsByEmail": { "dataType": "boolean", "required": true },
            "sendTaskNotificationsByEmail": { "dataType": "boolean", "required": true },
        },
        "additionalProperties": true,
    },
    "IConfigureKeycloakRequest": {
        "properties": {
            "realmName": { "dataType": "string", "required": true },
            "allowedCorsOrigin": { "dataType": "string", "required": true },
            "sslRequired": { "dataType": "boolean", "required": true },
            "tenantId": { "dataType": "string", "required": true },
        },
        "additionalProperties": true,
    },
    "ICreateKeycloakUser": {
        "properties": {
            "username": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "email": { "dataType": "string", "required": true },
            "roleIDs": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "defaultPassword": { "dataType": "string", "required": true },
        },
        "additionalProperties": true,
    },
    "ICreateKeycloakUsersRequest": {
        "properties": {
            "realmName": { "dataType": "string", "required": true },
            "setTemporaryPasswords": { "dataType": "boolean", "required": true },
            "users": { "dataType": "array", "array": { "ref": "ICreateKeycloakUser" }, "required": true },
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
    app.get('/v0/misc/error-500',
        authenticateMiddleware([{ "signedIn": [] }]),
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
                controller = iocContainer.get<MiscellaneousController>(MiscellaneousController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.error500.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/profile',
        authenticateMiddleware([{ "signedIn": [] }]),
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

            const komgoReqCtxCreator = new KomgoRequestContextCreator(iocContainer, request)
            komgoReqCtxCreator.create();
            let controller
            try {
                controller = iocContainer.get<ProfileController>(ProfileController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getProfileByToken.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/roles',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "body", "name": "request", "required": true, "ref": "IRoleRequest" },
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


            const promise = controller.RegisterNewRole.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/roles/:roleId',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                roleId: { "in": "path", "name": "roleId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IRoleRequest" },
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


            const promise = controller.UpdateRole.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/roles/:roleId/users',
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


            const promise = controller.GetUsersByRole.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/roles/:roleId/assigned-users',
        authenticateMiddleware([{ "withPermission": ["administration", "manageRoles", "crud"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                roleId: { "in": "path", "name": "roleId", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IAssignRoleRequest" },
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


            const promise = controller.AssignRoleToUsers.apply(controller, validatedArgs as any);
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
    app.post('/v0/users',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "body", "name": "request", "required": true, "ref": "IUserCreateRequest" },
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
                controller = iocContainer.get<UsersController>(UsersController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.RegisterNewUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/users/:userId',
        authenticateMiddleware([{ "withPermission": ["administration", "manageUsers", "read"] }]),
        function(request: any, response: any, next: any) {
            const args = {
                userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
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
                controller = iocContainer.get<UsersController>(UsersController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetUserById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/users/:userId/reset-password',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                jwt: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
                password: { "in": "body", "name": "password", "required": true, "ref": "IChangePasswordRequest" },
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
                controller = iocContainer.get<UsersController>(UsersController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.ResetPassword.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/users',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                productId: { "in": "query", "name": "productId", "dataType": "string" },
                actionId: { "in": "query", "name": "actionId", "dataType": "string" },
                withRoles: { "in": "query", "name": "withRoles", "dataType": "boolean" },
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
                controller = iocContainer.get<UsersController>(UsersController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetUsers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/users/:userId/settings',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
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
                controller = iocContainer.get<SettingsController>(SettingsController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetSettingsByUserId.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/users/:userId/settings',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                request: { "in": "body", "name": "request", "required": true, "ref": "IUserSettingsRequest" },
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
                controller = iocContainer.get<SettingsController>(SettingsController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.UpdateSettingsByUserId.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/keycloak/configure',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "body", "name": "request", "required": true, "ref": "IConfigureKeycloakRequest" },
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
                controller = iocContainer.get<KeycloakController>(KeycloakController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.configureKeycloak.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/keycloak/users',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "body", "name": "request", "required": true, "ref": "ICreateKeycloakUsersRequest" },
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
                controller = iocContainer.get<KeycloakController>(KeycloakController);
            } finally {
                komgoReqCtxCreator.remove();
            }
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.createKeycloakUsers.apply(controller, validatedArgs as any);
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
