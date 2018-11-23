# Digital Systems Term Project Backend [![Build Status](https://travis-ci.com/justin-gerhardt/Digital-Systems-Backend.svg?branch=prod)](https://travis-ci.com/justin-gerhardt/Digital-Systems-Backend)

[Api Documentation](https://app.swaggerhub.com/apis/justin-gerhardt/Digital-Systems-Term-Project/1.0.0)

[Travis](https://travis-ci.com/justin-gerhardt/Digital-Systems-Backend)

[The api base url that all requests are relative to.](https://3kevnmi0x4.execute-api.us-east-1.amazonaws.com/prod/)

The ID number we are using for the production device is `51080158-dd99-4df1-b7f0-7cfe868a5150` for testing purposes you may submit data for any valid uuid and it will work.

## Development

If you are simply using this api you should only need the Api docs and base url above.
This section is for modifying the api. 

1. Clone this repo
2. Install node.js (if you haven't already)
3. open a terminal and run npm install in the repo folder
4. if it's not already in there add `./node_modules/.bin/` to your path (or preface all serverless commands with it)
5. run serverless dynamodb install

If you are planning on adding new api calls you will have to add the details in the api documentation above and add the relevent function to the serverless.yml file. See the existing functions for details.

Implement any code changes in the src folder. 

I would suggest using vscode as an editor with the TSLint and Typescript Hero extentions.
If you are doing so then I have included a config file so that you should be able to just hit f5 and start debugging.

If you are not using vscode you will need to set the enviroment variable ` "DYNAMO_TYPES_ENDPOINT"` to  `"http://127.0.0.1:8000"`. Then, run `serverless offline start` to start the local server. You can access it at `http://localhost:8080/`. The serverless command is a node program. You can debug it however your chosen editor normally debugs node programs.

Note when testing locally you are only accessing your local copy of the database (not the one in the cloud) and all the data will be deleted everytime you stop the `serverless offline start` command.

## Deployment

Any commits pushed to the prod branch will be automatically deploy by travis to the live api everyone is using. This process takes ~2 minutes.
