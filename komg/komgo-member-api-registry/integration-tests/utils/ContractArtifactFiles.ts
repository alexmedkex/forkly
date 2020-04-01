import * as path from 'path'

const ARTIFACTS_FOLDER_PATH = path.join(process.cwd(), 'node_modules', '@komgo/smart-contracts/build/contracts')

export const ENSRegistryArtifact = require(`${ARTIFACTS_FOLDER_PATH}/ENSRegistry.json`)
export const KomgoRegistrarArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoRegistrar.json`)
export const KomgoMetaResolverArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoMetaResolver.json`)
export const KomgoResolverArtifact = require(`${ARTIFACTS_FOLDER_PATH}/KomgoResolver.json`)
export const DocumentRegistryArtifact = require(`${ARTIFACTS_FOLDER_PATH}/DocumentRegistry.json`)
export const MigrationsArtifact = require(`${ARTIFACTS_FOLDER_PATH}/Migrations.json`)
export const Sha3AddressLibArtifact = require(`${ARTIFACTS_FOLDER_PATH}/Sha3AddressLib.json`)
