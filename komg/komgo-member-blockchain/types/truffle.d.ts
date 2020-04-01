import * as Web3 from "web3";
import {
  KomgoRegistrarInstance,
  KomgoMetaResolverInstance,
  KomgoResolverInstance,
  ENSRegistryInstance,
  DocumentRegistryInstance,
  DocumentRegistryProxyInstance,
  Sha3AddressLibInstance,
  ContractLibraryInstance,
  PermissionCheckerInstance,
  KomgoMetaResolverProxyInstance
} from "./contracts";

declare global {
  function contract(name: string, test: ContractTest): void;
  var artifacts: Artifacts;
  var web3: Web3;
  var assert: Chai.AssertStatic;
}

declare type ContractTest = (accounts: string[]) => void;

interface Contract<T> {
  "new"(...args: any[]): Promise<T>;
  deployed(): Promise<T>;
  at(address: string): T;
  link(lib: any): T;
  abi: string;
}

interface Artifacts {
  require(name: "ENSRegistry"): Contract<ENSRegistryInstance>;
  require(name: "KomgoRegistrar"): Contract<KomgoRegistrarInstance>;
  require(name: "KomgoMetaResolver"): Contract<KomgoMetaResolverInstance>;
  require(name: "KomgoMetaResolverProxy"): Contract<KomgoMetaResolverProxyInstance>;
  require(name: "KomgoResolver"): Contract<KomgoResolverInstance>;
  require(name: "DocumentRegistry"): Contract<DocumentRegistryInstance>;
  require(name: "DocumentRegistryProxy"): Contract<DocumentRegistryProxyInstance>;
  require(name: "Sha3AddressLib"): Contract<Sha3AddressLibInstance>;
  require(name: "ContractLibrary"): Contract<ContractLibraryInstance>;
  require(name: "PermissionChecker"): Contract<PermissionCheckerInstance>;
}
