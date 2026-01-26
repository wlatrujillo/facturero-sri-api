# facturero-sri


## Project structure

- packages
    - facturero-sri-api
    - facturero-sri-signer

## Install dependencies

```
npm install
```

## Enviroment variables

.env

```
NODE_ENV=dev
LOG_LEVEL=DEBUG
PORT=8080
AWS_REGION=us-east-1
```

## Run dev enviroment

```
npm run dev
```


## Rest Client


### Config variables for VSCode

Add this in vscode user or workspace settings.json 

```json
  "rest-client.environmentVariables": {
        "dev": {
            "host": "http://localhost:8080",
            "api_key": "dev_key_secret"
        },
        "prd": {
            "host": "https://sri.facturero-digital.com",
            "api_key": "prod_key_secret"
        }
    }
```




##### References


https://medium.com/@chiboy96/how-to-build-a-typescript-express-api-in-a-nodejs-environment-e92b5e37cb37

