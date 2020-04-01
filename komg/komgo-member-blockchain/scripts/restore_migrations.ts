import { Migrations } from "./migrations/Migrations";
import { ENSContracts } from "./migrations/ENSContracts";

const restoreMigrations = async (): Promise<void> => {
    let ensAddress = process.env.ENS_REGISTRY_CONTRACT_ADDRESS;
    console.log("ENS ADDRESS", ensAddress)
    if (!ensAddress) {
        throw new Error("Invalid ENS Address, you need to setup the ENV Address variable");
    }
    const instance = new ENSContracts(ensAddress);
    const migrationsInstance = new Migrations(instance);
    const versionToUpdate: number = Number(process.env.MIGRATIONS_VERSION) || 2;
    await migrationsInstance.restore(versionToUpdate);
};

restoreMigrations()
    .then(() => {
        console.log("Successfully restored and deployed migrations to ENS")
    })
    .catch((e: Error) => {
        console.log(`Couldn't restore migrations, there was an error: ${e.message}`);
    });