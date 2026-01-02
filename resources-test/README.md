## Rest Client

### Config variables

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