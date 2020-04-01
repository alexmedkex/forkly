import * as path from "path";

const ARTIFACTS_FOLDER_PATH = path.join(process.cwd(), "build", "contracts");

export const ENSRegistryArtifact = require(`${ARTIFACTS_FOLDER_PATH}/ENSRegistry.json`);
export const KomgoRegistrarArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoRegistrar.json`);
export const KomgoMetaResolverArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoMetaResolver.json`);
export const KomgoMetaResolverProxyArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoMetaResolverProxy.json`);
export const KomgoResolverArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoResolver.json`);
export const DocumentRegistryArtifact = require(`${ARTIFACTS_FOLDER_PATH}/DocumentRegistry.json`);
export const ContractLibraryArtifact = require(`${ARTIFACTS_FOLDER_PATH}/ContractLibrary.json`);
export const PermissionCheckerArtifact = require(`${ARTIFACTS_FOLDER_PATH}/PermissionChecker.json`);
export const MigrationsArtifact = require(`${ARTIFACTS_FOLDER_PATH}/Migrations.json`);
export const KomgoOnboarderArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoOnboarder.json`);
