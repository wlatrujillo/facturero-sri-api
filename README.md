# facturero-sri

## Init project

```shell
npm init --yes
npm install typescript
npx tsc --init
```

## Config tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",          /* Specify ECMAScript target version */
    "module": "NodeNext",        /* Specify module code generation */
    "rootDir": "./src",          /* Specify the root directory of input files */
    "outDir": "./dist",          /* Redirect output structure to the directory */
    "strict": true,              /* Enable all strict type-checking options */
    "esModuleInterop": true,     /* Enables emit interoperability between CommonJS and ES Modules */
    "skipLibCheck": true         /* Skip type checking of all declaration files (*.d.ts) */
  }
}
```

## Install dependencies

```
npm install
```

## Enviroment variables

.env

```
PORT=3000
MONGO_URL=mongodb+srv://user:password@host/?appName=bddName

```


## Rest Client


### Config variables for VSCode

Add this in vscode user or workspace settings.json 

```json
  "rest-client.environmentVariables": {
        "development": {
            "host": "http://localhost:3000",
            "api_key": "dev_key_secret"
        },
        "production": {
            "host": "https://api.myproduct.com",
            "api_key": "prod_key_secret"
        }
    }
```




##### References


https://medium.com/@chiboy96/how-to-build-a-typescript-express-api-in-a-nodejs-environment-e92b5e37cb37

