import { CheckerInstance, ICheckedStatus } from '@komgo/health-check'
import { Request, Response, Router } from 'express'

const router: Router = Router()

router.get('/healthz', healthz)
router.get('/ready', ready)

export function healthz(req: Request, res: Response) {
  return res.status(204).send()
}

export async function ready(req: Request, res: Response) {
  const connections = await Promise.all([
    CheckerInstance.checkService(process.env.API_AUTH_BASE_URL as string, '/healthz'),
    CheckerInstance.checkRabbitMQ(
      process.env.INTERNAL_MQ_HOST as string,
      process.env.INTERNAL_MQ_USERNAME as string,
      process.env.INTERNAL_MQ_PASSWORD as string
    )
  ])

  const [apiAuth, rabbitMQ] = connections

  const someDisconnected = connections.some((connection: ICheckedStatus) => !connection.connected)
  if (someDisconnected) {
    return res.status(500).send({
      apiAuth: apiAuth.error || 'OK',
      rabbitMQ: rabbitMQ.error || 'OK'
    })
  }
  return res.status(204).send({
    apiAuth: 'OK',
    rabbitMQ: 'OK'
  })
}

export default router
