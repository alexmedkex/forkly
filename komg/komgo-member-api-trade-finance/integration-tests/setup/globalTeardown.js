module.exports = async () => {
  console.log('Global teardown running')
  if (process.env.INTEGRATION_TEST === 'true') {
    if (process.env.USE_QUORUM_NODE === 'true') {
      const quorumContainer = global.__QUORUM_CONTAINER__
      await quorumContainer.stop()
      console.log('Quorum stopping')
    } else {
      const ganacheContainer = global.__GANACHE_CONTAINER__
      await ganacheContainer.stop()
      console.log('Ganache stopping')
    }
    const mongoContainer = global.__MONGO_CONTAINER
    await mongoContainer.stop()
    console.log(`Mongo stopping`)
    const rabbitContainer = global.__RABBIT_CONTAINER
    await rabbitContainer.stop()
    console.log(`RabbitMQ stopping`)
  }
}
