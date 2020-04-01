import * as path from "path";
import * as fs from "fs";

import { ENSContracts, ContractType } from "./ENSContracts";
import { MigrationsInstance } from "../../types/contracts";

export class Migrations {

    private fileRootPath;
    private contractsInstance: ENSContracts;

    constructor(contractDeployer: ENSContracts, filePath?: string) {
        this.contractsInstance = contractDeployer;
        this.fileRootPath = filePath || path.join(process.cwd(), "build", "contracts");
    }

    async restore(versionToUpdate: number) {
        try {
            const defaultAccount = this.contractsInstance.getDefaultAccount();

            const migrationsContractInstance: MigrationsInstance = await this.contractsInstance.deployMigrations();

            await migrationsContractInstance.setCompleted(versionToUpdate, {
                from: defaultAccount
            })

            await this.contractsInstance.setMigrationsResolver(migrationsContractInstance);

        } catch (error) {
            throw new Error(`Error when trying to restore migrations ${error}`);
        }
    }

    async loadAll(): Promise<void> {
        try {
            console.log(`Loading networks information for contract artifacts`);
            try {
                this.load(ContractType.Migration);
            } catch (error) {
                console.log(`Couldn't load Migration contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.DocumentRegistry);
            } catch (error) {
                console.log(`Couldn't load DocumentRegistry contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.ENSRegistry);
            } catch (error) {
                console.log(`Couldn't load ENSRegistry contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.KomgoMetaResolver);
            } catch (error) {
                console.log(`Couldn't load KomgoMetaResolver contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.KomgoMetaResolverProxy);
            } catch (error) {
                console.log(`Couldn't load KomgoMetaResolverProxy contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.KomgoRegistrar);
            } catch (error) {
                console.log(`Couldn't load KomgoRegistrar contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.KomgoResolver);
            } catch (error) {
                console.log(`Couldn't load KomgoResolver contract`)
                throw new Error()
            }
            try {
                this.load(ContractType.PermissionChecker);
            } catch (error) {
                console.log(`Couldn't load PermissionChecker contract`)
            }
            try {
                this.load(ContractType.ContractLibrary);
            } catch (error) {
                console.log(`Couldn't load ContractLibrary contract`)
            }
            try {
                this.load(ContractType.KomgoOnboarder);
            } catch (error) {
                console.log(`Couldn't load KomgoOnboarder contract`)
            }
        } catch (error) {
            console.log("Error when trying to load migrations", error)
        }
    }

    async getInstance(type: ContractType) {
        return this.contractsInstance.getInstance(type);
    }

    async getAddress(fileName: ContractType) {
        const instance = await this.getInstance(fileName);

        return instance.address;
    }

    async load(fileName: ContractType) {
        console.log(`Loading networks information for ${fileName}`);
        const filePath = path.join(this.fileRootPath, fileName);
        const address = await this.getAddress(fileName);
        const networkId = await this.contractsInstance.getNetworkId();
        const jsonArtifactFile = require(filePath);
        jsonArtifactFile["networks"][`${networkId}`] = {
            "events": {},
            "links": {},
            "address": `${address}`
        }
        fs.writeFileSync(filePath, JSON.stringify(jsonArtifactFile, null, 2));
        console.log("Writing to artifacts successfully")
    }
}