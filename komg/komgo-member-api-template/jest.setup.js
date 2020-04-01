const Containers = require('@komgo/integration-test-utilities')

module.exports = async () => {
    console.log('Global setup running!!!')
    if (process.env.START_MONGO) {
        const mongoContainer = new Containers.MongoContainer()
        await mongoContainer.start()
        await mongoContainer.waitFor()
        await sleep(2000)
        global.__MONGODB_CONTAINER__ = mongoContainer
        console.log('MongoDB ready and running')
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
