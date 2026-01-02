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
npm install express express-handlebars body-parser log4js 
```

## Install dev dependencies

```
npm install --save-dev @types/node @types/express @types/body-parser
```

## Add script to package.json

```
"start": "tsc && node dist/index.js"
```

##### References


https://medium.com/@chiboy96/how-to-build-a-typescript-express-api-in-a-nodejs-environment-e92b5e37cb37

