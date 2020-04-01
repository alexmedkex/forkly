/* tslint:disable */
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { AuthorizationController } from './../../service-layer/controllers/AuthorizationController';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { keycloakProtectMiddlewareWrapper } from '../common/keycloak';
import swaggerData from '../common/swaggerData';
import checkPermission from '../common/checkPermission';

const middlewares = {
    swagger: () => swaggerData,
    keycloak: () => keycloakProtectMiddlewareWrapper,
    permissions: () => checkPermission
}
const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "keycloak": { "dataType": "string", "required": true },
            "apiRoles": { "dataType": "string", "required": true },
        },
    },
};

export async function RegisterRoutes(app: any) {
    app.get('/authorize',
        function(request: any, response: any, next: any) {
            const args = {
                baseUrl: { "in": "query", "name": "baseUrl", "required": true, "dataType": "string" },
                method: { "in": "query", "name": "method", "required": true, "dataType": "string" },
                path: { "in": "query", "name": "path", "required": true, "dataType": "string" },
                token: { "in": "header", "name": "Authorization", "dataType": "string" },
            };

            try {
                const validatedArgs: any[] = getValidatedArgs(args, request);

                request.locals = { validatedArgs }
                next()
            } catch (err) {
                next(err)
            }
        },
        await middlewares.swagger(),
        await middlewares.keycloak(),
        await middlewares.permissions(),
        function(request: any, response: any, next: any) {
            const controller = new AuthorizationController();

            const promise = controller.checkRolePermissions.apply(controller, request.locals.validatedArgs);
            promiseHandler(controller, promise, response, next);
        }
    );
    app.get('/is-signed-in',
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
            };

            try {
                const validatedArgs: any[] = getValidatedArgs(args, request);

                request.locals = { validatedArgs }
                next()
            } catch (err) {
                next(err)
            }
        },
        await middlewares.keycloak(),
        function(request: any, response: any, next: any) {
            const controller = new AuthorizationController();

            const promise = controller.isSignedIn.apply(controller, request.locals.validatedArgs);
            promiseHandler(controller, promise, response, next);
        }
    );
    app.get('/healthz',
        function(request: any, response: any, next: any) {
            const args = {
            };

            try {
                const validatedArgs: any[] = getValidatedArgs(args, request);

                request.locals = { validatedArgs }
                next()
            } catch (err) {
                next(err)
            }
        },
        function(request: any, response: any, next: any) {
            const controller = new HealthController();

            const promise = controller.Healthz.apply(controller, request.locals.validatedArgs);
            promiseHandler(controller, promise, response, next);
        }
    );
    app.get('/ready',
        function(request: any, response: any, next: any) {
            const args = {
            };

            try {
                const validatedArgs: any[] = getValidatedArgs(args, request);

                request.locals = { validatedArgs }
                next()
            } catch (err) {
                next(err)
            }
        },
        function(request: any, response: any, next: any) {
            const controller = new HealthController();

            const promise = controller.Ready.apply(controller, request.locals.validatedArgs);
            promiseHandler(controller, promise, response, next);
        }
    );

    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                if (controllerObj instanceof Controller) {
                    const controller = controllerObj as Controller
                    const headers = controller.getHeaders();
                    Object.keys(headers).forEach((name: string) => {
                        response.set(name, headers[name]);
                    });

                    statusCode = controller.getStatus();
                }

                if (data || data === false) {
                    response.status(statusCode || 200).json(data);
                } else {
                    response.status(statusCode || 204).end();
                }
            })
            .catch((error: any) => next(error));
    }

    function getValidatedArgs(args: any, request: any): any[] {
        const errorFields: FieldErrors = {};
        const values = Object.keys(args).map(function(key) {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return ValidateParam(args[key], request.query[name], models, name, errorFields);
                case 'path':
                    return ValidateParam(args[key], request.params[name], models, name, errorFields);
                case 'header':
                    return ValidateParam(args[key], request.header(name), models, name, errorFields);
                case 'body':
                    return ValidateParam(args[key], request.body, models, name, errorFields);
                case 'body-prop':
                    return ValidateParam(args[key], request.body[name], models, name, errorFields);
            }
        });

        if (Object.keys(errorFields).length > 0) {
            throw new ValidateError(errorFields, 'Invalid required parameters');
        }
        return values;
    }
}
