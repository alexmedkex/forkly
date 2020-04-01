# API Gateway

API Gateway is built using OpenResty that proxies API requests to target microservices
by first checking authorization with Authorization microservice.

> OpenResty® is a full-fledged web platform that integrates the standard Nginx core,
> LuaJIT, many carefully written Lua libraries, lots of high quality 3rd-party Nginx modules,
> and most of their external dependencies. It is designed to help developers easily build scalable
> web applications, web services, and dynamic web gateways.

# Access to Internal Routes Witout Authorization

Run API Gateway with env var `ENABLE_UNAUTHORIZED_ACCESS` set to `true`.
Then make an HTTP request to any route with `X-Skip-Auth` header set to `true` in order bypass authorization check.


# Authorization Service API

Authorization service (defined by API_AUTH_BASE_URL and API_AUTH_PATH env vars) must return one of the following

- 204 (No Content) if user is authorized to request the resource
- 403 With content type application/json and "message" string in JSON explaining the reason to a user

Nginx passes the following data to the Authorization service:

- Unmodified headers from the original request
- Additional query params: baseUrl, path (without query params), and method in query string (see example below)

  ```
  GET /authorize?baseUrl=http://api-users&path=/users/123&method=GET
  ```
