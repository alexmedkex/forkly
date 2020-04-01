import {
  KomgoMetaResolverContract,
  Sha3AddressLibContract,
  ENSRegistryContract,
  KomgoRegistrarContract,
  KomgoResolverContract
} from '../utils/ContractArtifacts'

const namehash = require('eth-ens-namehash')
const web3Utils = require('web3-utils')
const pako = require('pako');

// Reverse lookup setup
const REVERSE_LABEL = "reverse";
const ADDR_LABEL = "addr";
const ADDR_REVERSE_LABEL = "addr.reverse";
// companies setup
const KOMGO_ROOT_LABEL = "komgo";
const KOMGO_ROOT_NODE = namehash.hash(KOMGO_ROOT_LABEL);
const META_ROOT_LABEL = "meta.komgo";
const META_ROOT_NODE = namehash.hash(META_ROOT_LABEL);
const META_LABEL = "meta";
// contracts setup
const CONTRACTS_LABEL = "contract";
const CONTRACTS_ROOT_LABEL = `${CONTRACTS_LABEL}.${KOMGO_ROOT_LABEL}`
const CONTRACTS_NODE = namehash.hash(CONTRACTS_ROOT_LABEL);
const REGISTRAR_LABEL = "komgoregistrar";
const REGISTRAR_NODE = namehash.hash(`${REGISTRAR_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const RESOLVER_LABEL = "komgoresolver";
const RESOLVER_NODE = namehash.hash(`${RESOLVER_LABEL}.${CONTRACTS_ROOT_LABEL}`)
const META_RESOLVER_LABEL = "komgometaresolver";
const META_RESOLVER_NODE = namehash.hash(`${META_RESOLVER_LABEL}.${CONTRACTS_ROOT_LABEL}`)

export const setupEns = async (accounts: string[]) => {
  const komgoAddress = accounts[0]

  console.log('komgoAddress', komgoAddress)

  // defaults
  ENSRegistryContract.defaults({
    from: komgoAddress,
    gas: '804247552',
    gasPrice: '0'
  })
  KomgoResolverContract.defaults({
    from: komgoAddress,
    gas: '804247552',
    gasPrice: '0'
  })
  KomgoMetaResolverContract.defaults({
    from: komgoAddress,
    gas: '804247552',
    gasPrice: '0'
  })
  KomgoRegistrarContract.defaults({
    from: komgoAddress,
    gas: '804247552',
    gasPrice: '0'
  })

  try {
    let ensRegistry = await ENSRegistryContract.new()
    console.log('ensRegistry', ensRegistry.address)

    let sha3AddressLib = await Sha3AddressLibContract.new({ from: komgoAddress, gas: '804247552', gasPrice: '0' })
    console.log('sha3AddressLib', sha3AddressLib.address)

    await KomgoMetaResolverContract.detectNetwork()
    await KomgoMetaResolverContract.link('Sha3AddressLib', sha3AddressLib.address)

    let komgoMetaResolver = await KomgoMetaResolverContract.new()
    console.log('komgoMetaResolver', komgoMetaResolver.address)

    let komgoResolver = await KomgoResolverContract.new()
    console.log('komgoResolver', komgoResolver.address)

    let komgoRegistrar = await KomgoRegistrarContract.new(
      ensRegistry.address,
      KOMGO_ROOT_NODE,
      META_ROOT_NODE,
      komgoResolver.address,
      komgoMetaResolver.address
    )
    console.log('komgoRegistrar', komgoRegistrar.address)


    await komgoResolver.initialise(ensRegistry.address)

    await ensRegistry.setSubnodeOwner('0x0', web3Utils.sha3(KOMGO_ROOT_LABEL), komgoAddress)
    await ensRegistry.setSubnodeOwner(KOMGO_ROOT_NODE, web3Utils.sha3(META_LABEL), komgoRegistrar.address)
    await ensRegistry.setSubnodeOwner('0x0', web3Utils.sha3(REVERSE_LABEL), komgoAddress)
    await ensRegistry.setSubnodeOwner(namehash.hash(REVERSE_LABEL), web3Utils.sha3(ADDR_LABEL), komgoAddress)

    await ensRegistry.setOwner(namehash.hash(ADDR_REVERSE_LABEL), komgoMetaResolver.address)

    await ensRegistry.setSubnodeOwner(KOMGO_ROOT_NODE, web3Utils.sha3(CONTRACTS_LABEL), komgoAddress);
    await ensRegistry.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(REGISTRAR_LABEL), komgoAddress);

    await ensRegistry.setResolver(REGISTRAR_NODE, komgoResolver.address);
    await komgoResolver.setAddr(REGISTRAR_NODE, komgoRegistrar.address);
   
    await komgoResolver.setABI(REGISTRAR_NODE, 1, web3Utils.utf8ToHex(JSON.stringify(komgoRegistrar.abi)));

    await ensRegistry.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(RESOLVER_LABEL), komgoAddress);
    await ensRegistry.setResolver(RESOLVER_NODE, komgoResolver.address);

    await komgoResolver.setAddr(RESOLVER_NODE, komgoResolver.address);
    await komgoResolver.setABI(RESOLVER_NODE, 1, web3Utils.utf8ToHex(JSON.stringify(komgoResolver.abi)));

    await ensRegistry.setSubnodeOwner(CONTRACTS_NODE, web3Utils.sha3(META_RESOLVER_LABEL), komgoAddress);
    await ensRegistry.setResolver(META_RESOLVER_NODE, komgoResolver.address);
    await komgoResolver.setAddr(META_RESOLVER_NODE, komgoMetaResolver.address);

    const compressed = pako.deflate(JSON.stringify(KomgoMetaResolverContract.abi));
    const compressedHex = Buffer.from(compressed).toString('hex');
    const fromAscii = web3Utils.asciiToHex(compressedHex)
    await komgoResolver.setABI(META_RESOLVER_NODE, 2, fromAscii);

    await ensRegistry.setOwner(KOMGO_ROOT_NODE, komgoRegistrar.address);

    return {
      ensRegistry,
      komgoResolver,
      komgoMetaResolver,
      komgoRegistrar
    }
  } catch (error) {
    console.log('ERROR', error)
  }

}
