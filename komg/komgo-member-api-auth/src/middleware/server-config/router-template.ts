/* tslint:disable */
{{#if canImportByAlias}}
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
{{else}}
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from '../../../src';
{{/if}}
{{#if iocModule}}
import { iocContainer } from '{{iocModule}}';
{{/if}}
{{#each controllers}}
import { {{name}} } from '{{modulePath}}';
{{/each}}
import { keycloakProtectMiddlewareWrapper } from '../common/keycloak';
import swaggerData from '../common/swaggerData';
import checkPermission from '../common/checkPermission';

const middlewares = {
  swagger: () => swaggerData,
  keycloak: () => keycloakProtectMiddlewareWrapper,
  permissions: () => checkPermission
}
const models: TsoaRoute.Models = {
    {{#each models}}
    "{{@key}}": {
        {{#if enums}}
        "enums": {{{json enums}}},
        {{/if}}
        {{#if properties}}
        "properties": {
            {{#each properties}}
            "{{@key}}": {{{json this}}},
            {{/each}}
        },
        {{/if}}
        {{#if additionalProperties}}
        "additionalProperties": {{{json additionalProperties}}},
        {{/if}}
    },
    {{/each}}
};

export async function RegisterRoutes(app: any) {
    {{#each controllers}}
    {{#each actions}}
        app.{{method}}('{{../path}}{{path}}',
            function (request: any, response: any, next: any) {
                const args = {
                    {{#each parameters}}
                      {{@key}}: {{{json this}}},
                    {{/each}}
                };

                try {
                    const validatedArgs: any[] = getValidatedArgs(args, request);

                    request.locals = { validatedArgs }
                    next()
                } catch (err) {
                    next(err)
                }
            },
            {{#each security}}
              {{#if middlewares}}
              {{#each middlewares}}
              await middlewares.{{this}}(),
              {{/each}}
              {{/if}}
            {{/each}}
            function (request: any, response: any, next: any) {
                {{#if ../../iocModule}}
                const controller = iocContainer.get<{{../name}}>({{../name}});
                {{else}}
                const controller = new {{../name}}();
                {{/if}}

                const promise = controller.{{name}}.apply(controller, request.locals.validatedArgs);
                promiseHandler(controller, promise, response, next);
            }
        );
    {{/each}}
    {{/each}}

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
