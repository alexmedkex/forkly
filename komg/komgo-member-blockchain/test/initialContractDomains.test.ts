import {
    ENSRegistryInstance, KomgoResolverInstance, KomgoRegistrarInstance, DocumentRegistryProxyInstance, PermissionCheckerInstance, KomgoMetaResolverProxyInstance, ContractLibraryInstance
} from "../types/contracts";

const namehash = require("eth-ens-namehash")
const pako = require("pako")
const ENSRegistry = artifacts.require("ENSRegistry")
const KomgoRegistrar = artifacts.require("KomgoRegistrar")
const KomgoResolver = artifacts.require("KomgoResolver")
const KomgoMetaResolver = artifacts.require("KomgoMetaResolver")
const KomgoMetaResolverProxy = artifacts.require("KomgoMetaResolverProxy")
const DocumentRegistry = artifacts.require("DocumentRegistry")
const DocumentRegistryProxy = artifacts.require("DocumentRegistryProxy")
const ContractLibrary = artifacts.require("ContractLibrary")
const PermissionChecker = artifacts.require("PermissionChecker")
const komgoRegistrarNode = namehash.hash("komgoregistrar.contract.komgo")
const komgoResolverNode = namehash.hash("komgoresolver.contract.komgo")
const komgoMetaResolverNode = namehash.hash("komgometaresolver.contract.komgo")
const documentRegistryNode = namehash.hash("documentregistry.contract.komgo")
const oldDocumentRegistryNode = namehash.hash("documentregistryv1.contract.komgo")
const contractLibraryNode = namehash.hash("contractlibrary.contract.komgo")
const permissionCheckerNode = namehash.hash("permissionchecker.contract.komgo")

contract("Initial deployment", accounts => {
    accounts;
    let ens: ENSRegistryInstance
    let komgoRegistrar: KomgoRegistrarInstance
    let komgoResolver: KomgoResolverInstance
    let komgoMetaResolverProxy: KomgoMetaResolverProxyInstance
    let documentRegistryProxy: DocumentRegistryProxyInstance
    let contractLibrary: ContractLibraryInstance
    let permissionChecker: PermissionCheckerInstance

    describe("Contract domains deployment", () => {

        beforeEach(async () => {
            ens = await ENSRegistry.deployed()
            komgoResolver = await KomgoResolver.deployed()
            komgoRegistrar = await KomgoRegistrar.deployed()
            documentRegistryProxy = await DocumentRegistryProxy.deployed()
            contractLibrary = await ContractLibrary.deployed()
            permissionChecker = await PermissionChecker.deployed()
            komgoMetaResolverProxy = await KomgoMetaResolverProxy.deployed()
        })

        it("Test KomgoRegistrar domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(komgoRegistrarNode))
            const addr = await resolver.addr(komgoRegistrarNode)
            const abi = await resolver.ABI(komgoRegistrarNode, 1)
            assert.equal(JSON.stringify(KomgoRegistrar.abi), web3.toAscii(abi[1]))
            assert.equal(komgoRegistrar.address, addr)
        })

        it("Test KomgoResolver domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(komgoResolverNode))
            const addr = await resolver.addr(komgoResolverNode)
            const abi = await resolver.ABI(komgoResolverNode, 1)
            assert.equal(JSON.stringify(KomgoResolver.abi), web3.toAscii(abi[1]))
            assert.equal(komgoResolver.address, addr)
        })

        it("Test KomgoMetaResolver domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(komgoMetaResolverNode))
            const addr = await resolver.addr(komgoMetaResolverNode)
            const compressedAbi = await resolver.ABI(komgoMetaResolverNode, 2)
            const abiAscii = web3.toAscii(compressedAbi[1])
            const bufferAbi = Buffer.from(abiAscii, "hex")
            const abi = pako.inflate(bufferAbi, { to: 'string' })
            assert.equal(komgoMetaResolverProxy.address, addr)
            assert.equal(JSON.stringify(KomgoMetaResolver.abi), abi)
        })

        it("Test DocumentRegistry domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(documentRegistryNode))
            const addr = await resolver.addr(documentRegistryNode)
            const abi = await resolver.ABI(documentRegistryNode, 1)
            assert.equal(JSON.stringify(DocumentRegistry.abi), web3.toAscii(abi[1]))
            assert.equal(documentRegistryProxy.address, addr)
        })

        it("Test OldDocumentRegistry domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(oldDocumentRegistryNode))
            const addr = await resolver.addr(oldDocumentRegistryNode)
            const abi = await resolver.ABI(oldDocumentRegistryNode, 1)
            assert.equal(web3.toAscii(abi[1]), JSON.stringify(DocumentRegistry.abi))
            assert.notEqual(addr, "0x0000000000000000000000000000000000000000")
        })

        it("Test PermissionChecker domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(permissionCheckerNode))
            const addr = await resolver.addr(permissionCheckerNode)
            const abi = await resolver.ABI(permissionCheckerNode, 1)
            assert.equal(JSON.stringify(PermissionChecker.abi), web3.toAscii(abi[1]))
            assert.equal(permissionChecker.address, addr)
        })

        it("Test ContractLibrary domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver(contractLibraryNode))
            const addr = await resolver.addr(contractLibraryNode)
            const abi = await resolver.ABI(contractLibraryNode, 1)
            assert.equal(JSON.stringify(ContractLibrary.abi), web3.toAscii(abi[1]))
            assert.equal(contractLibrary.address, addr)
        })

        it("Test invalid domain", async () => {
            const resolver: KomgoResolverInstance = KomgoResolver.at(await ens.resolver("invalid"))
            assert.equal("0x0000000000000000000000000000000000000000", resolver.address)
        })
    })
})
