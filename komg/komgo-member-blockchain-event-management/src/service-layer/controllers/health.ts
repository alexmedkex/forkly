import { Request, Response, Router } from 'express'

import { iocContainer } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import IIsReadyChecker from '../../util/IIsReadyChecker'

const router: Router = Router()

router.get('/healthz', (req: Request, res: Response) => res.status(204).send())

router.get('/ready', ready)

export async function ready(req: Request, res: Response) {
  const checker = iocContainer.get<IIsReadyChecker>(TYPES.IsReadyChecker)
  const status = await checker.status()
  const statusCode = status.isReady ? 200 : 500
  return res.status(statusCode).send(status.details)
}

export default router
