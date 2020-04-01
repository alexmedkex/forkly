/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './../../inversify/ioc';
import { HealthController } from './../../service-layer/controllers/HealthController';
import { RequestActionController } from './../../service-layer/controllers/RequestActionController';
import { ResponseActionController } from './../../service-layer/controllers/ResponseActionController';
import { RejectActionController } from './../../service-layer/controllers/RejectActionController';
import { AcceptActionController } from './../../service-layer/controllers/AcceptActionController';
import { expressAuthentication } from './../authentication/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "rabbitMQ": { "dataType": "string", "required": true },
            "apiRegistry": { "dataType": "string", "required": true },
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
    "HttpException": {
        "properties": {
            "stack": { "dataType": "object" },
            "status": { "dataType": "double", "required": true },
            "errorObject": { "dataType": "object", "required": true },
            "message": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
    },
    "IRequestForProposalBase": {
        "properties": {
            "context": { "dataType": "any", "required": true },
            "productRequest": { "dataType": "any", "required": true },
            "documentIds": { "dataType": "array", "array": { "dataType": "string" } },
            "taskActionId": { "dataType": "string" },
        },
    },
    "CreateRFPRequest": {
        "properties": {
            "rfp": { "ref": "IRequestForProposalBase", "required": true },
            "participantStaticIds": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
        },
    },
    "ActionType": {
        "enums": ["Request", "Response", "Reject", "Decline", "Accept"],
    },
    "IAction": {
        "properties": {
            "rfpId": { "dataType": "string", "required": true },
            "recipientStaticID": { "dataType": "string", "required": true },
            "senderStaticID": { "dataType": "string", "required": true },
            "sentAt": { "dataType": "string" },
            "type": { "ref": "ActionType", "required": true },
            "status": { "ref": "ActionStatus", "required": true },
            "taskActionId": { "dataType": "string" },
            "data": { "dataType": "any" },
            "staticId": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "string" },
        },
    },
    "IActionsResponse": {
        "properties": {
            "actions": { "dataType": "array", "array": { "ref": "IAction" }, "required": true },
        },
    },
    "IRFPReplyResponse": {
        "properties": {
            "rfpId": { "dataType": "string", "required": true },
            "actionStatus": { "ref": "IOutboundActionResult", "required": true },
        },
    },
    "CreateRFPReplyRequest": {
        "properties": {
            "responseData": { "dataType": "any", "required": true },
        },
    },
    "IRFPAcceptResponse": {
        "properties": {
            "rfpId": { "dataType": "string", "required": true },
            "actionStatuses": { "dataType": "array", "array": { "ref": "IOutboundActionResult" }, "required": true },
        },
    },
    "CreateRFPAcceptRequest": {
        "properties": {
            "responseData": { "dataType": "any", "required": true },
            "participantStaticId": { "dataType": "string", "required": true },
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
    app.post('/v0/request',
        function(request: any, response: any, next: any) {
            const args = {
                rfpRequest: { "in": "body", "name": "rfpRequest", "required": true, "ref": "CreateRFPRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestActionController>(RequestActionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/request/:rfpId/actions',
        function(request: any, response: any, next: any) {
            const args = {
                rfpId: { "in": "path", "name": "rfpId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RequestActionController>(RequestActionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.getRequestActions.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/response/:rfpId',
        function(request: any, response: any, next: any) {
            const args = {
                rfpId: { "in": "path", "name": "rfpId", "required": true, "dataType": "any" },
                request: { "in": "body", "name": "request", "required": true, "ref": "CreateRFPReplyRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<ResponseActionController>(ResponseActionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/reject/:rfpId',
        function(request: any, response: any, next: any) {
            const args = {
                rfpId: { "in": "path", "name": "rfpId", "required": true, "dataType": "any" },
                request: { "in": "body", "name": "request", "required": true, "ref": "CreateRFPReplyRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<RejectActionController>(RejectActionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/accept/:rfpId',
        function(request: any, response: any, next: any) {
            const args = {
                rfpId: { "in": "path", "name": "rfpId", "required": true, "dataType": "any" },
                request: { "in": "body", "name": "request", "required": true, "ref": "CreateRFPAcceptRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<AcceptActionController>(AcceptActionController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.create.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });


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
