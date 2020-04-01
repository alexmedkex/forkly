/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { iocContainer } from './inversify/ioc';
import { NotificationsController } from './service-layer/controllers/NotificationsController';
import { TasksController } from './service-layer/controllers/TasksController';
import { HealthController } from './service-layer/controllers/HealthController';
import { expressAuthentication } from './middleware/authentication';
import * as express from 'express';

const models: TsoaRoute.Models = {
    "NotificationLevel": {
        "enums": ["success", "info", "warning", "danger"],
    },
    "INotification": {
        "properties": {
            "_id": { "dataType": "string", "required": true },
            "productId": { "dataType": "string", "required": true },
            "type": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "level": { "ref": "NotificationLevel", "required": true },
            "isRead": { "dataType": "boolean", "required": true },
            "toUser": { "dataType": "string", "required": true },
            "context": { "dataType": "any", "required": true },
            "message": { "dataType": "string", "required": true },
        },
    },
    "IEmailTemplateData": {
        "properties": {
            "subject": { "dataType": "string", "required": true },
            "taskTitle": { "dataType": "string", "required": true },
            "taskLink": { "dataType": "string", "required": true },
        },
    },
    "IRequiredPermission": {
        "properties": {
            "productId": { "dataType": "string", "required": true },
            "actionId": { "dataType": "string", "required": true },
        },
    },
    "INotificationCreateRequest": {
        "properties": {
            "productId": { "dataType": "string", "required": true },
            "type": { "dataType": "string", "required": true },
            "level": { "ref": "NotificationLevel", "required": true },
            "toUser": { "dataType": "string" },
            "emailData": { "ref": "IEmailTemplateData" },
            "requiredPermission": { "ref": "IRequiredPermission" },
            "context": { "dataType": "any", "required": true },
            "message": { "dataType": "string", "required": true },
        },
    },
    "INotificationResponse": {
        "properties": {
            "total": { "dataType": "double", "required": true },
            "unread": { "dataType": "double", "required": true },
            "notifications": { "dataType": "array", "array": { "ref": "INotification" }, "required": true },
        },
    },
    "INotificationPatchIsRead": {
        "properties": {
            "isRead": { "dataType": "boolean", "required": true },
        },
    },
    "TaskType": {
        "enums": ["SBLC.ReviewIssued", "SBLC.ReviewRequested", "LC_AMENDMENT_REVIEW_TRADE", "LC_AMENDMENT_REVIEW_AMENDMENT", "LC.ReviewPresentation", "LC.ViewPresentedDocuments", "LC.ReviewDiscrepantPresentation", "LC.ReviewPresentationDiscrepancies", "LC.ReviewLCApplication", "LC.ReviewTrade", "LC.ReviewAppRefusal", "LC.ReviewIssuedLC", "LC.IssuedLCRefusal", "LC.ManagePresentation", "LC.ReviewTradeDocs", "LetterOfCredit.ReviewIssued", "LetterOfCredit.ReviewRequested", "RFP.ReviewRequest", "RFP.ReviewResponse", "RFP.ReviewAccept", "KYC.DocRequest", "KYC.ReviewDocuments", "Counterparty.info", "Counterparty.task", "CL.ReviewRequest", "CL.DepositLoan.ReviewRequest", "LetterOfCredit.ReviewRequested"],
    },
    "TaskStatus": {
        "enums": ["To Do", "In Progress", "Done", "Pending Confirmation"],
    },
    "ITaskContext": {
    },
    "ITask": {
        "properties": {
            "_id": { "dataType": "string", "required": true },
            "summary": { "dataType": "string", "required": true },
            "taskType": { "ref": "TaskType", "required": true },
            "status": { "ref": "TaskStatus", "required": true },
            "counterpartyStaticId": { "dataType": "string" },
            "assignee": { "dataType": "object", "required": true },
            "requiredPermission": { "ref": "IRequiredPermission", "required": true },
            "context": { "ref": "ITaskContext", "required": true },
            "comment": { "dataType": "string" },
            "outcome": { "dataType": "boolean" },
            "updatedAt": { "dataType": "datetime", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "dueAt": { "dataType": "datetime" },
        },
    },
    "IUser": {
        "properties": {
            "id": { "dataType": "string", "required": true },
            "username": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "double", "required": true },
            "email": { "dataType": "string", "required": true },
        },
    },
    "ITaskResponse": {
        "properties": {
            "task": { "ref": "ITask", "required": true },
            "user": { "ref": "IUser" },
        },
    },
    "ITaskCreateRequest": {
        "properties": {
            "outcome": { "dataType": "boolean" },
            "summary": { "dataType": "string", "required": true },
            "taskType": { "ref": "TaskType", "required": true },
            "status": { "ref": "TaskStatus" },
            "counterpartyStaticId": { "dataType": "string" },
            "emailData": { "ref": "IEmailTemplateData" },
            "context": { "ref": "ITaskContext", "required": true },
            "requiredPermission": { "ref": "IRequiredPermission", "required": true },
            "dueAt": { "dataType": "datetime" },
        },
    },
    "ITaskWithMessageCreateRequest": {
        "properties": {
            "task": { "ref": "ITaskCreateRequest", "required": true },
            "message": { "dataType": "string", "required": true },
        },
    },
    "ITaskUpdateAssigneeRequest": {
        "properties": {
            "assignee": { "dataType": "string" },
        },
    },
    "ITaskUpdateStatusRequest": {
        "properties": {
            "status": { "ref": "TaskStatus", "required": true },
            "taskType": { "dataType": "string", "required": true },
            "context": { "ref": "ITaskContext", "required": true },
            "comment": { "dataType": "string" },
            "outcome": { "dataType": "boolean" },
        },
    },
    "IHealthResponse": {
        "properties": {
            "mongo": { "dataType": "string", "required": true },
            "api-users": { "dataType": "string", "required": true },
            "api-roles": { "dataType": "string", "required": true },
        },
    },
};
const validationService = new ValidationService(models);

export function RegisterRoutes(app: express.Express) {
    app.post('/v0/notifications',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "body", "name": "request", "required": true, "ref": "INotificationCreateRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<NotificationsController>(NotificationsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.CreateNewNotification.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/notifications',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                offset: { "default": 0, "in": "query", "name": "offset", "dataType": "double" },
                limit: { "default": 10, "in": "query", "name": "limit", "dataType": "double" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<NotificationsController>(NotificationsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetNotifications.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/notifications/:notifId',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                notifId: { "in": "path", "name": "notifId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<NotificationsController>(NotificationsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetNotificationById.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/notifications/is-read/:notifId',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                notifId: { "in": "path", "name": "notifId", "required": true, "dataType": "string" },
                req: { "in": "body", "name": "req", "required": true, "ref": "INotificationPatchIsRead" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<NotificationsController>(NotificationsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.UpdateNotifIsRead.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/notifications/is-read',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                authHeader: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                req: { "in": "body", "name": "req", "required": true, "ref": "INotificationPatchIsRead" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<NotificationsController>(NotificationsController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.UpdateNotifsIsRead.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/tasks',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                status: { "in": "query", "name": "status", "dataType": "enum", "enums": ["To Do", "In Progress", "Done", "Pending Confirmation"] },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TasksController>(TasksController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetTasks.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/tasks/internal',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                status: { "in": "query", "name": "status", "dataType": "enum", "enums": ["To Do", "In Progress", "Done", "Pending Confirmation"] },
                taskType: { "in": "query", "name": "taskType", "dataType": "string" },
                context: { "in": "query", "name": "context", "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TasksController>(TasksController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetTasksInternal.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/v0/tasks/:taskId',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                taskId: { "in": "path", "name": "taskId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TasksController>(TasksController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.GetTask.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/v0/tasks',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                body: { "in": "body", "name": "body", "required": true, "ref": "ITaskWithMessageCreateRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TasksController>(TasksController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.CreateNewTask.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/tasks/:taskId/assignee',
        authenticateMiddleware([{ "signedIn": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                token: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
                taskId: { "in": "path", "name": "taskId", "required": true, "dataType": "string" },
                req: { "in": "body", "name": "req", "required": true, "ref": "ITaskUpdateAssigneeRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TasksController>(TasksController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.UpdateTaskAssignee.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.patch('/v0/tasks',
        authenticateMiddleware([{ "internal": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                req: { "in": "body", "name": "req", "required": true, "ref": "ITaskUpdateStatusRequest" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            const controller = iocContainer.get<TasksController>(TasksController);
            if (typeof controller['setStatus'] === 'function') {
                (<any>controller).setStatus(undefined);
            }


            const promise = controller.UpdateTaskStatus.apply(controller, validatedArgs as any);
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
