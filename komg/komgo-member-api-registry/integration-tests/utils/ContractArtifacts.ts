import { TruffleContract } from './TruffleContract'

import {
  ENSRegistryArtifact,
  KomgoRegistrarArtifact,
  KomgoMetaResolverArtifact,
  KomgoResolverArtifact,
  DocumentRegistryArtifact,
  MigrationsArtifact,
  Sha3AddressLibArtifact
} from './ContractArtifactFiles'

export const ENSRegistryContract = TruffleContract(ENSRegistryArtifact)
export const KomgoRegistrarContract = TruffleContract(KomgoRegistrarArtifact)
export const KomgoMetaResolverContract = TruffleContract(KomgoMetaResolverArtifact)
export const KomgoResolverContract = TruffleContract(KomgoResolverArtifact)
export const DocumentRegistryContract = TruffleContract(DocumentRegistryArtifact)
export const MigrationsContract = TruffleContract(MigrationsArtifact)
export const Sha3AddressLibContract = TruffleContract(Sha3AddressLibArtifact)
