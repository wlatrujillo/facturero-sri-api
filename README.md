# facturero-sri


## Project structure

- devops. 
- rest-client
- packages
    - facturero-sri-api
    - facturero-sri-signer

|        Folder         |      Descripción              |
|-----------------------|-------------------------------|
| devops                | DevOps Assets                 |
| packages              | Source code packages.         |
|   facturero-sri-api   | Source code api rest.         |
|   facturero-sri-signer| Source code sri signer.       |



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


##### References


https://medium.com/@chiboy96/how-to-build-a-typescript-express-api-in-a-nodejs-environment-e92b5e37cb37

