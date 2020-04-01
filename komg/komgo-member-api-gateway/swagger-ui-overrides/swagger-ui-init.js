window.onload = function initSwagger() {

  // Build a system
  const ui = SwaggerUIBundle({
    url: "",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout",
    responseInterceptor: resp => {
      // Don't intercept non-swagger.json responses
      if (!resp.body || resp.url.indexOf('swagger.json') === -1) {
        return resp
      }

      // amend OpenAPI spec so it can be used with API  Gateway
      let newResp = replaceHost(resp)
      newResp = replaceBasePath(newResp)
      newResp = updateDescription(newResp)
      newResp = updateSchemes(newResp)
      newResp = updateSecurityDefinitions(newResp)

      // this is necessary because Swagger UI reads API spec from this parameter
      newResp.text = JSON.stringify(newResp.body)
      return newResp
    }
  })

  window.ui = ui
}

/**
 * 1. Add prefix to basePath (e.g. "/api/roles")
 * @param {*} resp
 */
function replaceBasePath(resp) {
  const basePathPrefix = getQueryVariable('basePathPrefix')
  if (!basePathPrefix) {
    return {
      ok: false,
      statusText: '"basePathPrefix" is a required query argument.'
    }
  }
  resp.body.basePath = basePathPrefix + resp.body.basePath
  return resp
}

/**
 * 2. Set current host name in "host"
 * @param {*} resp
 */
function replaceHost(resp) {
  resp.body.host = window.location.host
  return resp
}

/**
 * 3. Update description with necessary permissions
 * @param {*} resp
 */
function updateDescription(resp) {
  const paths = resp.body.paths
  const pathsToDelete = []
  const swaggerSecurity = [{ Authorization: [] }]

  Object.keys(paths).forEach(pathName => {
    // map through method names
    Object.keys(paths[pathName]).forEach(methodName => {
      const route = paths[pathName][methodName]
      let security
      try {
        security = route.security[0]
      } catch (e) { }

      let description
      if (security && !security.internal) {
        switch (true) {
          case !!security.withPermission:
            const perm = security.withPermission
            description = `<div class="komgo-permissions">Required permissions:\n<ul><li>Product: ${
              perm[0]
            }</li><li>Action: ${perm[1]}</li>${
              perm[2] ? `<li>Permission: ${perm[2]}</li>` : ""
            }</ul></div>`
            route.security = swaggerSecurity
            break
          case !!security.signedIn:
            description = `<div class="komgo-permissions">This route is allowed for all signed in users</div>`
            route.security = swaggerSecurity
            break
          case !!security.public:
            description = `<div class="komgo-permissions">This route is public</div>`
            route.security = []
            break
        }
      } else {
        // we don't want to display internal routes
        pathsToDelete.push({ path: pathName, method: methodName })
      }
      if (description) {
        route.description = `${description}${route.description || ''}`
      }
    })
  })

  // delete internal paths
  pathsToDelete.forEach(p => {
    delete paths[p.path][p.method]
  })

  return resp
}

/**
 * 4. Update securityDefinitions
 * @param {*} resp
 */
function updateSecurityDefinitions(resp) {
  resp.body.securityDefinitions = {
    Authorization: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
  return resp
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1])
    }
  }
  console.log('Query variable %s not found', variable)
}

function updateSchemes(resp) {
  const scheme = window.location.href.startsWith('https') ? 'https' : 'http'
  resp.body.schemes = [scheme]
  return resp
}
