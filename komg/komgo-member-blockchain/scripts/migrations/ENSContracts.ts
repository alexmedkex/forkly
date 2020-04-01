const { web3Instance, address } = require("../../web3Provider");

import { TruffleContract } from 'truffle-contract'
import { ENSRegistryInstance, KomgoResolverInstance, MigrationsInstance, KomgoRegistrarInstance, KomgoMetaResolverInstance, DocumentRegistryInstance, PermissionCheckerInstance, KomgoOnboarderInstance, ContractLibraryInstance } from '../../types/contracts';
import { ENSRegistryContract, MigrationsContract, KomgoRegistrarContract, DocumentRegistryContract, KomgoResolverContract, KomgoMetaResolverContract, PermissionCheckerContract, KomgoOnboarderContract, ContractLibraryContract, KomgoMetaResolverProxyContract } from "./ContractArtifacts";

const namehash = require("eth-ens-namehash");
const web3Utils = require("web3-utils");

const KOMGO_ROOT_LABEL = "komgo";
const CONTRACTS_LABEL = "contract";
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`
const CONTRACTS_NODE = namehash.hash(CONTRACTS_ROOT_LABEL);
const MIGRATIONS_LABEL = "migrations";
const MIGRATIONS_NODE = namehash.hash(`${MIGRATIONS_LABEL}.${CONTRACTS_ROOT_LABEL}`)

const KOMGO_RESOLVER_DOMAIN = 'komgoresolver.contract.komgo';
const KOMGO_REGISTRAR_DOMAIN = 'komgoregistrar.contract.komgo';
const KOMGO_META_RESOLVER_DOMAIN = 'komgometaresolver.contract.komgo';
const PERMISSION_CHECKER_DOMAIN = 'permissionchecker.contract.komgo'
const KOMGO_ONBOARDER_DOMAIN = 'komgoonboarder.contract.komgo'
const DOCUMENT_REGISTRY_DOMAIN = 'documentregistry.contract.komgo'
const MIGRATIONS_DOMAIN = 'migrations.contract.komgo';
const CONTRACT_LIBRARY_DOMAIN = 'contractlibrary.contract.komgo';

export enum ContractType {
    Migration = "Migrations.json",
    KomgoResolver = "KomgoResolver.json",
    KomgoRegistrar = "KomgoRegistrar.json",
    KomgoMetaResolver = "KomgoMetaResolver.json",
    KomgoMetaResolverProxy = "KomgoMetaResolverProxy.json",
    PermissionChecker = "PermissionChecker.json",
    KomgoOnboarder = "KomgoOnboarder.json",
    ENSRegistry = "ENSRegistry.json",
    ContractLibrary = "ContractLibrary.json",
    DocumentRegistry = "DocumentRegistry.json"
}

export class ENSContracts {
    private ensAddress: string;
    constructor(ensAddress: string) {
        this.ensAddress = ensAddress;
    }

    getDefaultAccount(): string {
        const defaultAccount = address;
        console.log(`Default account: ${defaultAccount}`)
        return defaultAccount;
    }

    async setMigrationsResolver(migrationsContractInstance: MigrationsInstance): Promise<void> {
        console.log("Setting up migrations resolver")

        const defaultAccount = this.getDefaultAccount();
        const ens = await this.getENSRegistry();
        const resolver = await this.getKomgoResolverInstance();
        try {
            await ens.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(MIGRATIONS_LABEL), defaultAccount, {
                from: defaultAccount
            });
            await ens.setResolver(MIGRATIONS_NODE, resolver.address, {
                from: defaultAccount
            });
            await resolver.setAddr(MIGRATIONS_NODE, migrationsContractInstance.address, {
                from: defaultAccount
            });
            await resolver.setABI(MIGRATIONS_NODE, 1, web3Utils.toHex(MigrationsContract.abi), {
                from: defaultAccount
            });
            console.log("Migrations resolver deployed successfully")
        } catch (error) {
            console.log(`Coudln't deploy the migrations resolver ${error}`);
            throw new Error(`Coudln't deploy the migrations resolver ${error}`)
        }
    }

    async deployMigrations(): Promise<MigrationsInstance> {
        console.log("Deploying migrations")
        const defaultAccount = this.getDefaultAccount();
        const migrationsContractInstance: MigrationsInstance = await MigrationsContract.new({
            from: defaultAccount
        });
        console.log(`Migrations contract deployed successfully at address:`, migrationsContractInstance.address)
        return migrationsContractInstance;
    }

    async getENSRegistry(): Promise<ENSRegistryInstance> {
        console.log(`Initializing ENSRegistry contract with address=${this.ensAddress}`)
        const ensContractInstance = await ENSRegistryContract.at(this.ensAddress);
        console.log(`ENSRegistry contract initialized successfully`)
        return ensContractInstance;
    }

    async getNetworkId(): Promise<number> {
        const networkId = web3Instance.version.network;
        console.log("The network id is", networkId);
        return networkId;
    }

    async getMigrationsInstance(): Promise<MigrationsInstance> {
        const migrationsNode = namehash.hash(MIGRATIONS_DOMAIN)
        const addr = await this.findAddress(MIGRATIONS_DOMAIN, migrationsNode, 1)
        console.log('Migrations address retrieved from ENS', { contractAdress: addr })
        const migrationsContract = await MigrationsContract.at(addr);
        console.log(`Migrations contract initialized successfully`)
        return migrationsContract
    }

    async getKomgoResolverInstance(): Promise<KomgoResolverInstance> {
        console.log("THIS getKomgoResolverInstance", this)
        const resolverNode = namehash.hash(KOMGO_RESOLVER_DOMAIN)
        const addr = await this.findAddress(KOMGO_RESOLVER_DOMAIN, resolverNode, 1)
        console.log('KomgoResolver address retrieved from ENS', { contractAdress: addr })
        const komgoResolverContract = await KomgoResolverContract.at(addr);
        console.log(`KomgoResolver contract initialized successfully`)
        return komgoResolverContract
    }

    async getKomgoRegistrarInstance(): Promise<KomgoRegistrarInstance> {
        const registrarNode = namehash.hash(KOMGO_REGISTRAR_DOMAIN)
        const addr = await this.findAddress(KOMGO_REGISTRAR_DOMAIN, registrarNode, 1)
        console.log('KomgoRegistrar address retrieved from ENS', { contractAdress: addr })
        const komgoRegistrarContract = await KomgoRegistrarContract.at(addr);
        console.log(`KomgoRegistrar contract initialized successfully`)
        return komgoRegistrarContract
    }

    async getPermissionCheckerInstance(): Promise<PermissionCheckerInstance> {
        const permissionCheckerNode = namehash.hash(PERMISSION_CHECKER_DOMAIN)
        const addr = await this.findAddress(PERMISSION_CHECKER_DOMAIN, permissionCheckerNode, 1)
        console.log('PermissionChecker address retrieved from ENS', { contractAdress: addr })
        const permissionCheckerContract = await PermissionCheckerContract.at(addr);
        console.log(`PermissionChecker contract initialized successfully`)
        return permissionCheckerContract
    }

    async getKomgoOnboarderInstance(): Promise<KomgoOnboarderInstance> {
        const komgoOnboarderNode = namehash.hash(KOMGO_ONBOARDER_DOMAIN)
        const addr = await this.findAddress(KOMGO_ONBOARDER_DOMAIN, komgoOnboarderNode, 1)
        console.log('KomgoOnboarder address retrieved from ENS', { contractAdress: addr })
        const komgoOnboarderContract = await KomgoOnboarderContract.at(addr);
        console.log(`KomgoOnboarder contract initialized successfully`)
        return komgoOnboarderContract
    }

    async getKomgoMetaResolverInstance(): Promise<KomgoMetaResolverInstance> {
        const metaResolverNode = namehash.hash(KOMGO_META_RESOLVER_DOMAIN)
        const addr = await this.findAddress(KOMGO_META_RESOLVER_DOMAIN, metaResolverNode, 2)
        console.log('KomgoMetaResolver address retrieved from ENS', { contractAdress: addr })
        const komgoMetaResolverContract = await KomgoMetaResolverContract.at(addr);
        console.log(`KomgoMetaResolver contract initialized successfully`)
        return komgoMetaResolverContract
    }

    async getKomgoMetaResolverProxyInstance(): Promise<KomgoMetaResolverInstance> {
        const metaResolverNode = namehash.hash(KOMGO_META_RESOLVER_DOMAIN)
        const addr = await this.findAddress(KOMGO_META_RESOLVER_DOMAIN, metaResolverNode, 2)
        console.log('KomgoMetaResolverProxy address retrieved from ENS', { contractAdress: addr })
        const komgoMetaResolverProxyContract = await KomgoMetaResolverProxyContract.at(addr);
        console.log(`komgoMetaResolverProxyContract contract initialized successfully`)
        return komgoMetaResolverProxyContract
    }

    async getDocumentRegistryInstance(): Promise<DocumentRegistryInstance> {
        const documentRegistryNode = namehash.hash(DOCUMENT_REGISTRY_DOMAIN)
        const addr = await this.findAddress(DOCUMENT_REGISTRY_DOMAIN, documentRegistryNode, 1)
        console.log('DocumentRegistry address retrieved from ENS', { contractAdress: addr })
        const documentRegistryContract = await DocumentRegistryContract.at(addr);
        console.log(`DocumentRegistry contract initialized successfully`)
        return documentRegistryContract
    }

    async getContractLibraryInstance(): Promise<ContractLibraryInstance> {
        return this.getContractInstance<ContractLibraryInstance>(
            CONTRACT_LIBRARY_DOMAIN,
            ContractType.ContractLibrary.replace('.json', ''),
            ContractLibraryContract
        )
    }

    async findAddress(domain: string, resolverNode: string, abiType: number) {
        const defaultAccount = this.getDefaultAccount()
        console.log('Finding address and ABI', { domain, resolverNode, abiType })
        try {
            const ensContract: ENSRegistryInstance = await this.getENSRegistry();
            const resolverAddress = await ensContract.resolver(resolverNode, { from: defaultAccount })
            console.log('Resolver address', { resolverAddress })

            if (web3Utils.toBN(resolverAddress) === web3Utils.toBN(0)) {
                console.log(`Resolver not found for domain`, domain, resolverNode)
            }
            const resolverContDeployed = await KomgoResolverContract.at(resolverAddress);
            console.log(`Found resolver contract deployed`, { resolverAddress })
            console.log(`Could retrieve ABI from Resolver`, { resolverAddress, abiType })
            const addr = await resolverContDeployed.addr(resolverNode, { from: defaultAccount })
            console.log('Could retrieve address from Resolver', { resolverAddress, contractAdress: addr })
            return addr;
        } catch (error) {
            console.log(`Error in findAddress ${error}`)
        }
    }

    async getInstance(type: ContractType) {
        let result: any;
        switch (type) {
            case ContractType.Migration:
                result = await this.getMigrationsInstance();
                break;
            case ContractType.KomgoResolver:
                result = await this.getKomgoResolverInstance();
                break;
            case ContractType.KomgoRegistrar:
                result = await this.getKomgoRegistrarInstance();
                break;
            case ContractType.KomgoMetaResolver:
                result = await this.getKomgoMetaResolverInstance();
                break;
            case ContractType.KomgoMetaResolverProxy:
                result = await this.getKomgoMetaResolverProxyInstance();
                break;
            case ContractType.ENSRegistry:
                result = await this.getENSRegistry();
                break;
            case ContractType.DocumentRegistry:
                result = await this.getDocumentRegistryInstance();
                break;
            case ContractType.ContractLibrary:
                result = await this.getContractLibraryInstance();
            case ContractType.PermissionChecker:
                result = await this.getPermissionCheckerInstance();
                break;
            case ContractType.KomgoOnboarder:
                result = await this.getKomgoOnboarderInstance();
                break;
            default:
                throw new Error("Not implemented migration method")
        }
        return result;
    }

    private async getContractInstance<T>(
        domain: string,
        name: string,
        contractConstructor: TruffleContract,
        abiType: number = 1
    ): Promise<T> {
        const node = namehash.hash(domain)
        const addr = await this.findAddress(domain, node, abiType)
        console.log(`${name} address retrieved from ENS`, { contractAdress: addr })

        const instance = await contractConstructor.at(addr);
        console.log(`${name} contract initialized successfully`)
        return instance
    }
}
