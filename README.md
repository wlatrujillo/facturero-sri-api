# facturero-sri


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
        "dev": {
            "host": "http://localhost:8080",
            "api_key": "dev_key_secret"
        },
        "prd": {
            "host": "https://api.myproduct.com",
            "api_key": "prod_key_secret"
        }
    }
```




##### References


https://medium.com/@chiboy96/how-to-build-a-typescript-express-api-in-a-nodejs-environment-e92b5e37cb37

