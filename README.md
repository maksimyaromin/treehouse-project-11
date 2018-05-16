# Build a Course Rating API With Express
The project is an example of the possible implementation of a simple API with a help of Express and Mongo.DB.

The project uses Mongoose package. For test data download .json file is used, which s in *source/data.json* folder. Data is loading by mongoose-seeder package. I should note that this project did not run with the new version of Mongoose. I wrote my own package which is based on package proposed by Treehouse, and which works exactly like the first one. In case you need details you can find it here [mais-mongoose-seeder](https://www.npmjs.com/package/mais-mongoose-seeder).

Please do not forget to restore dependences with a command
```shell
    npm install
```
before any actions with API.

API is developed according to the technical task. It is starts by nodemon package with the command
```shell
    npm start
```
or any other method known to you. HTTP-logger morgan is connected to API, which writes logs to a file *logs.log*, which is situated in project root.

For convenience, I covered the API with automatic tests using Mocha, Chai and the package [supertest](https://www.npmjs.com/package/supertest). TO start the test type in console
```shell
    npm test
```
Test details you can find in *test/express-api.test.js*. Surely you can test with a help of Postman, Fiddler or any other you get used to. For autotesting, a separate database is created in which the test data is loaded. I did this  intentionally instead of mock data to maximize the similarity to the tests you proposed for Postman.

#### Notes
Please, use latest version of Node.JS for this project (my version is 8.8.1 and everything done);
Especially for students, I rewrote the code they did not understand.

### I hope you will enjoy it. Max Eremin
