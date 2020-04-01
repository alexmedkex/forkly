/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { SessionController } from './../../service-layer/controllers/SessionController';
import { DocumentsController } from './../../service-layer/controllers/DocumentsController';
import { expressAuthentication } from './../common/authentication/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "blockchain": { "dataType": "string", "required": true },
            "apiSigner": { "dataType": "string", "required": true },
            "apiRegistry": { "dataType": "string", "required": true },
        },
    },
    "ISessionResponse": {
        "properties": {
            "sessionId": { "dataType": "string", "required": true },
            "staticId": { "dataType": "string", "required": true },
            "merkle": { "dataType": "string" },
            "metadataHash": { "dataType": "string" },
            "timestamp": { "dataType": "string" },
            "activated": { "dataType": "boolean" },
        },
    },
    "ISessionRequest": {
        "properties": {
            "jws": { "dataType": "string", "required": true },
        },
    },
    "ISessionVerifyRequest": {
        "properties": {
            "merkleHash": { "dataType": "string", "required": true },
        },
    },
    "IPutSessionRequest": {
        "properties": {
            "merkle": { "dataType": "string" },
            "metadataHash": { "dataType": "string" },
            "timestamp": { "dataType": "string" },
            "activated": { "dataType": "boolean", "required": true },
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
    "IDocumentDeactivationRequest": {
        "properties": {
            "jws": { "dataType": "string", "required": true },
        },
    },
    "IKomgoStampDocument": {
        "properties": {
            "registered": { "dataType": "boolean" },
            "deactivated": { "dataType": "boolean", "required": true },
            "documentInfo": { "dataType": "any" },
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
    app.post('/v0/session',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                data: { "in": "body", "name": "data", "required": true, "ref": "ISessionRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SessionController>(SessionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.createSession.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/session/:sessionId/activate',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sessionId: { "in": "path", "name": "sessionId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "ISessionRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SessionController>(SessionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.activateSession.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/session/:sessionId/deactivate',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sessionId: { "in": "path", "name": "sessionId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "ISessionRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SessionController>(SessionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.deactivateSession.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/session/:sessionId',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sessionId: { "in": "path", "name": "sessionId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SessionController>(SessionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getSession.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/session/:sessionId/verify',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sessionId: { "in": "path", "name": "sessionId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "ISessionVerifyRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SessionController>(SessionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.verifyDocument.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/v0/session/:sessionId',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                sessionId: { "in": "path", "name": "sessionId", "required": true, "dataType": "string" },
                data: { "in": "body", "name": "data", "required": true, "ref": "IPutSessionRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<SessionController>(SessionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.putSession.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/documents',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                data: { "in": "body", "name": "data", "required": true, "ref": "IDocumentDeactivationRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DocumentsController>(DocumentsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.deactivate.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/documents/:hash',
        authenticateMiddleware([{ "public": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                hash: { "in": "path", "name": "hash", "required": true, "dataType": "string" },
                blockchainCheck: { "in": "query", "name": "blockchainCheck", "dataType": "boolean" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<DocumentsController>(DocumentsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.verifyDocument.apply(controller, validatedArgs as any);
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
