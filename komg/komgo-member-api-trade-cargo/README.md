# Expected Env Vars

* `DB_MONGO_URL` - e.g. mongodb://localhost:27017/api-trade-cargo

# KomGo API

TypeScripted API based on the next libraries:
- [Express](https://expressjs.com): Web application framework.
- [mongoose](http://mongoosejs.com/): MongoDB object modelling.
- [JWT](https://github.com/auth0/node-jsonwebtoken): JSON Web Token to allow users to hit the API endpoints.
- [tsoa](https://github.com/lukeautry/tsoa): Swagger implementation in TypeScript.

## Parent folder structure

The folder structure (before building the TypeScript source files) is as follows:

```
.
├── config                  # Generic config folder and recipient for the Swagger config file (default.yaml).
├── config-mock             # Swagger config file for the mock-api mode (default.yaml).
├── config-default          # Swagger config file (default.yaml).
├── src                     # Source files.
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

## Main folder structure

The main folder structure (`src`) is as follows:

```
.
├── ...
├── dist                        # Compiled files.           
├── src                         # Source files.
│    ├── business-layer         # Folder with business functionalities (security, utils and validators so far).
│    ├── data-layer             # Folder with the storage objects (MongoDB and Blockchain).
│    ├── middleware             # Folder with routes.ts and generic config files (Logging, Express).
│    ├── presentation-layer     # Folder with the source files for the Swagger UI.
│    ├── service-layer          # Folder with controllers and request/response objects.
│    ├── server.ts              # Main module to run the API.
│    ├── types.ts               # Module to declare those JavaScript libraries which should be included in .ts (i.e., truffle-contract).
└── ...
```

## Sample API Endpoints

The API is documented in `http://"server":"port"/docs` (by default in the local environment, localhost:3000/docs). 

This project has the next examples using JWT or "plain calls" (check `routes.ts`):

* _JWT_: GET `/api/Users/:userId`
* _Plain calls_: GET `/api/Users/username/:username`

A sample pipeline would be as follows:
1. POST an User (`/api/Users`). It will return the Token generated. From this point onwards you will be able to call every JWT-secured endpoint.
2. POST a Movie (`/api/Movies`).

## How should I code on this API?

Some tips before you start coding on the API.

### I need to... use a new library

Install the specific dependency by running `npm i --save <package_name>`. 
Find the typed version of the library and add it to the "devDependencies" with `npm i --save-dev <package_name>`.

Don't forget to commit changes in `package.json` and `package-lock.json` in git.

##### What if my library is not typed?

Add the next line to the file `types.ts`:

```javascript
declare module 'not-typed-library-name';
```

Import it in the .ts file you need it:

```javascript
import * as contract from 'not-typed-library-name';
```

### I need to... add a new endpoint

Within the `middleware` folder, add a new entry to the function `RegisterRoutes` in the file `routes.ts` and a new type definition if necessary.

```javascript
//Type definition
const models: TsoaRoute.Models = {
    "IUserResponse": {
        "properties": {
            "id": { "dataType": "string" },
            "username": { "dataType": "string" },
            "firstname": { "dataType": "string" },
            "lastname": { "dataType": "string" },
            "email": { "dataType": "string" },
        },
    }
...
//Endpoint without JWT
export function RegisterRoutes(app: any) {
    app.post('/api/Authorizations/Login',
        function(request: any, response: any, next: any) {
...
//Endpoint with JWT
app.post('/api/Movies',
        authenticateMiddleware([{ "name": "api_key" }]),
```

A typescript file should be created per new type in the folder `service-layer/<request or responses>/<api path i.e. user>/<name of the file i.e. IUserResponse>.ts`. To export it, please add a new line in `service-layer/<request or responses>/<object name i.e. user>/index.ts`:

```javascript
export { IUserResponse }  from './IUserResponse';
```

##### Ok, so now the interface is defined...let's implement the controller

The controller class would be the one to interact with the data layer (Agents). It should extend `Controller` from tsoa.

```javascript
@Route('Users')
export class UsersController extends Controller{

    //Agent
    userDataAgent:UserDataAgent = new UserDataAgent();
```

We will define the behaviour of the method with regards to our interface:

```javascript
@Post()
public async RegisterNewUser(@Body()  request: IUserCreateRequest): Promise<IUserResponse> {
```

##### Do not forget to include validators!

Apart from this, we should add proper validators for the entry parameters in the folder `business-layer/validators/<object name i.e. user>`.
1. `<Object name>ValidationSchema`: POJO with constraints for attributes.
2. `<Object name>ValidationProcessor`: Implementation of the validator.

##### Let's get deeper...Storage agents definition

The Agents (`data-layer/data-agents<Object name>Agent.ts`) will be in charge of interacting with:
* The database (MongoDB through mongoose)
* The blockchain (using Truffle)

```javascript
export class UserDataAgent {

    //Smart Contract stub
    private readonly metacoin: MetacoinSmartContract = new MetacoinSmartContract();

    async createNewUser(user: any): Promise<any> {

        let newUser = <IUserDocument>(user);
        //mongoose
        let previouseUser = await UserRepo.findOne({ username: newUser.username });
```

##### Database models

In order to work with the database, first of all we should define the repositories (collections on mongoose) implemented in the next files: 

* Document Interface (`data-layer/data-abstracts/repositories/<object name>/I<Object name>Document.ts`): POJO interface based on mongoose documents.
* Repository (`data-layer/data-abstracts/repositories/<object name>/<Object name>Repository.ts`): Connection with the collection in the database.
* Schema (`data-layer/data-abstracts/repositories/<object name>/<Object name>Schema.ts`): Definition of the collection behaviour based on mongoose schema.

This classes will be exported using an `index.ts` file.

The implementation of the Document Interface (Model) should be a POJO class (`data-layer/models/<Object name>Model.ts`).

##### Smart Contract stubs

When you need to call methods from a specific smart contract, you should create a file in here => `data-layer/smart-contracts/<Smart Contract name>SmartContract.ts`.

The connection itself is made by importing the web3 utils library into the stub (`business-layer/utils/web3.ts`). We could use two different object, web3Instance (to interact with generic methods, i.e. `web3Instance.eth.getCoinbase()`) and web3Provider (the connection object).

### I need to comment my code

An extension for Visual Studio Code has been used to generate the initial comments for the methods. It's called "Document This".

The tool generate a comment structure such like:

```javascript
/**
 * Description
 * @export
 * @class Class Name
 * @extends {Controller}
 */
```

The automatic generation should be performed at the end of the development cycle, before pushing the changes, so that the comment is up to date

### Check your code for linter and formatting errors

Before committing your changes don't forget to make sure they follow code style and formatting rules.
Rules are defined in `tslint.json` and `.prettierrc`. 
Simply run `npm run lint` and `npm run check-formatting` in order to check linter and formatting errors respectively.

Some linter errors can be fixed with `npm run lint -- --fix`. In order to fix formatting, run `npm run prettier`.

It's recommended to install `tslint` and `prettier` IDE plugins for convenience.


### I need to... write a DB migration script

In order to do that, run `npm run migration:create <name>`, where `<name>` is a name of your migration (use dashes instead of spaces).
Then, open a newly created file in `migrations` dir and implement `up` and `down` functions.
After that check that it works by running `npm run migration:up` or `npm run migration:down`.
