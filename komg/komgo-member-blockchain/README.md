# KomGo Blockchain

Submodule with the Blockchain satellite applications and the smart contracts using Truffle to manage them.

It includes the configuration for the Quorum mode as well.

## Main folder structure

The folder structure is based on the Truffle folder structure. It has the satellite apps as well.

```
.
├── build                   # Truffle: Folder where the JSON representation of the contracts are.
├── contracts               # Truffle: Folder where the Solidity contracts are.
├── dashboard               # Satellite: Dashboard to display transactions, blocks and network usage.
├── explorer                # Satellite: Block explorer to display transactions, blocks and addresses.
├── migrations              # Truffle: Folder where the migration files are.
├── monitor                 # Satellite: Monitor used by the Dashboard.
├── quorum                  # Quorum: Source files of the Quorum network configuration.
├── test                    # Truffle: Folder where the migration files are.
├── .gitignore              
├── Dockerfile              # Node.js 8 template
├── package.json            
├── README.md               
├── truffle.d.ts            # Truffle: Typescript definition
├── truffle.js              # Truffle: Main config file
└── tsconfig.json           # Set of config values to build the TypeScript files.
```

## Migration process for smart contracts for release 0.7.0
*This needs to be run BEFORE the 0.7.0 release*

1. Pull this repository and run 

```
npm install
````

2. Get the relevant information for the Komgo Kaleido node you want to run this in and the ENS address

```bash
export BLOCKCHAIN_HOST=
export KALEIDO_USER=
export KALEIDO_PASSWORD=
export BLOCKCHAIN_PORT=443
export ENS_REGISTRY_CONTRACT_ADDRESS=
export MIGRATIONS_VERSION=2

npm run migrations:restore
```