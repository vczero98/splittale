# SplitTale

## What is SplitTale?
SpliTale is an online Node.js based application, which allows players to write stories together with others online. A story is given to the user, and they are allowed to add up to 5 words.

## Installation
### Prerequisites
1. Node.js and npm
2. MongoDB

### Usage
To ensure all libraries are installed, run ``$ npm install`` in the directory

For running in development, create a file called ``.env``, where you may place the following environment variables:

    PORT =
    ADDRESS =
    FACEBOOK_APP_ID =
    FACEBOOK_APP_SECRET =
    DATABASE_URL =
    EXPRESS_SESSION_SECRET =

Note that quotation marks are not needed for the values.

The application can be started by running the following command:

    $ node dev/bin
