import { Migrations } from "./migrations/Migrations";
import { ENSContracts } from "./migrations/ENSContracts";

const loadMigrations = async (): Promise<void> => {
    let ensAddress = process.env.ENS_REGISTRY_CONTRACT_ADDRESS;
    console.log("ENS ADDRESS", ensAddress)
    if (!ensAddress) {
        throw new Error("Invalid ENS Address, you need to setup the ENV variable");
    }
    const instance = new ENSContracts(ensAddress);
    const migrationsInstance = new Migrations(instance);
    await migrationsInstance.loadAll();
};

loadMigrations()
    .then(() => {
        console.log("Successfully loaded migrations")
    })
    .catch((e: Error) => {
        console.log(`Couldn't load migrations, there was an error: ${e.message}`);
    });

