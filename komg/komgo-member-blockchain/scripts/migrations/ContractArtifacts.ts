import { TruffleContract } from "./TruffleContract";
import { ENSRegistryArtifact, KomgoRegistrarArtifact, KomgoMetaResolverArtifact, KomgoResolverArtifact, DocumentRegistryArtifact, MigrationsArtifact, KomgoMetaResolverProxyArtifact, ContractLibraryArtifact, PermissionCheckerArtifact, KomgoOnboarderArtifact } from "./ContractArtifactFiles";

export const ENSRegistryContract = TruffleContract(ENSRegistryArtifact);
export const KomgoRegistrarContract = TruffleContract(KomgoRegistrarArtifact);
export const KomgoMetaResolverContract = TruffleContract(KomgoMetaResolverArtifact);
export const KomgoMetaResolverProxyContract = TruffleContract(KomgoMetaResolverProxyArtifact);
export const KomgoResolverContract = TruffleContract(KomgoResolverArtifact);
export const DocumentRegistryContract = TruffleContract(DocumentRegistryArtifact);
export const ContractLibraryContract = TruffleContract(ContractLibraryArtifact);
export const MigrationsContract = TruffleContract(MigrationsArtifact);
export const PermissionCheckerContract = TruffleContract(PermissionCheckerArtifact);
export const KomgoOnboarderContract = TruffleContract(KomgoOnboarderArtifact);
