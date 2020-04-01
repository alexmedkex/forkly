module.exports = async () => {
    console.log('Global teardown running')
    if (process.env.START_MONGO) {
        const mongoContainer = global.__MONGODB_CONTAINER__
        await mongoContainer.stop()
        console.log('MongoDB stopping')
    }
}
