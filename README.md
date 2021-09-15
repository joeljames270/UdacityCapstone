## Images
All screenshot images are added to Images folder

Login page of app
![Alt text](images/s1.png?raw=true "Login Page")

Home page of app
![Alt text](images/s2.png?raw=true "Home Page")


Details entered in Inputs
![Alt text](images/s3.png?raw=true "Inputs filled")

File Uploaded and data saved to dynammo db
![Alt text](images/s4.png?raw=true "File Uploaded")

Home page of app showing notes
![Alt text](images/s5.png?raw=true "Home Page")

Edit notes page allows to change image and note text
![Alt text](images/s6.png?raw=true "Edit Page")

# Serverless Notes App

App backend deployed to AWS using serverless framework
https://10m8rn5k16.execute-api.us-east-1.amazonaws.com/dev/

This sticky notes app lets the users to create and store the notes to their user account. Users can also attach pictures to notes and can later edit them or delete them.

# Functionality of the application

This application will allow creating/removing/updating/fetching Sticky Notes. Each Note can optionally have an attachment picture. Each user only has access to Notes that he/she has created.



# Functions in the app

App has functions to list, create, delete and update notes. 
Also functions to verify auth token and get presignedurl for s3 file upload

# Frontend

The `client` folder contains a web application that can use the API developed in the project.

Made necessary changes to improve the UI and add functionalities. Since I did not have experience on type script, I could not loading functionalities. So file uploads will take time and no loading notifications is shown

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```


## Logging

Uses Winston Logger

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

logger.info('User was authorized', {
  key: 'value'
})
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless Notes application.



