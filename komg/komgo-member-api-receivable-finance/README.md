# KomGo api-receivable-finance microservce

This microservice handles the following:

- CRUD for receivables discounting data
- Orchestrating with the RFP MS to push the receivables discounting data to market

## Parent Directory structure

This Microservice is structured in the following way:

```
.
├── config                  # Generic config folder and recipient for the Swagger config file (default.yaml).
├── config-mock             # Swagger config file for the mock-api mode (default.yaml).
├── config-default          # Swagger config file (default.yaml).
├── src                     # Source files.
├── interation-tests        # Integration tests folder.
├── migrations              # Migrations folder.
├── .dockerignore           # Excluding files for Docker container building.
├── .gitignore              # Excluding files from Git lifecycle.
├── .gitlab-ci.yml          # Continous Integration pipeline within Gitlab.
├── .prettierignore         # Files ignored by Prettier.
├── .prettierrc             # Prettier config file.
├── Dockerfile              # Node.js 8-based template to dockerise the API.
├── package.json            # Set of instructions and npm packages to build the project.
├── tsconfig.json           # Set of config values to build the TypeScript files.
├── tslint.json             # Set of rules to follow best practices when coding.
├── tsoa.json               # Config file for TSOA (TypeScript library for Swagger). It generates a JSON file.
├── tsoa.yaml.json          # Config file for TSOA (TypeScript library for Swagger). It generates a YAML file to run the Swagger Editor.
└── README.md
```

## Main Directory structure

The main source directory is separated in layers. Here is the main structure:

```
.
├── src                         # Source files.
│    ├── business-layer         # Folder with business functionalities (security, utils and validators so far).
│    ├── data-layer             # Folder with the storage objects (MongoDB).
│    ├── middleware             # Folder with routes.ts and generic config files (Logging, Express).
│    ├── inversify              # Folder with IOC container.
│    ├── service-layer          # Folder with controllers and request/response objects.
│    ├── server.ts              # Main module to run the API.
└── ...
```

## How do I develop in this Microservice?

By following the guidelines defined [here](https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/220430388/Backend+guidelines)
