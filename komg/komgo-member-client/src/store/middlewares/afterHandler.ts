import { Middleware } from 'redux'

const afterHandlerMiddleware: Middleware = (storeAPI: any) => (next: any) => (action: any) => {
  if (action.afterHandler) {
    next(action)
    return action.afterHandler(storeAPI)
  }

  return next(action)
}

export default afterHandlerMiddleware
