const Containers = require('@komgo/integration-test-utilities')

module.exports = async () => {
  console.log('Global setup running!!!')
  if (process.env.INTEGRATION_TEST === 'true') {
    if (process.env.USE_QUORUM_NODE === 'true') {
      const quorumContainer = new Containers.QuorumContainer()
      await quorumContainer.start()
      await quorumContainer.waitFor()
      await sleep(4000)
      global.__QUORUM_CONTAINER__ = quorumContainer
      console.log('Quorum ready and running')
    } else {
      const ganacheContainer = new Containers.GanacheContainer()
      await ganacheContainer.start()
      await ganacheContainer.waitFor()
      await sleep(4000)
      global.__GANACHE_CONTAINER__ = ganacheContainer
      console.log('Ganache ready and running')
    }
    const mongoContainer = new Containers.MongoContainer()
    await mongoContainer.start()
    await mongoContainer.waitFor()
    await sleep(4000)
    global.__MONGO_CONTAINER = mongoContainer
    console.log('mongo ready and running')
    const rabbitMqContainer = new Containers.RabbitMQContainer()
    await rabbitMqContainer.start()
    await rabbitMqContainer.waitFor()
    await sleep(4000)
    global.__RABBIT_CONTAINER = rabbitMqContainer
    console.log('RabbitMQ ready and running')
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
