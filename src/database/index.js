const mongoose = require("mongoose");

const User = require("./models/user")(mongoose),
    Review = require("./models/review")(mongoose),
    Course = require("./models/course")(mongoose);

module.exports = {
    /**
     * The function connects to the database. The logic is as follows:
     * if test is used as the environment, then the base will be called courses-test, if other, then it will be called courses.
     * After installing the connection to MongoDB, if the environment is not production, then the test data will be loaded into the database
     * with a help of mais-mongoose-seeder package. Then User model indexes will be installed and the promise will be returned.
     * 
     * @param {Object} env environment variables
     */
    connect(env) {
        const namespace = env.NODE_ENV === "test" ? "courses-test" : "courses";
        return mongoose.connect(`mongodb://localhost:27017/${namespace}`, { autoIndex: false })
            .then(() => {
                return env.NODE_ENV === "production" 
                    ? Promise.resolve()
                    : require("mais-mongoose-seeder")(mongoose)
                        .seed(require("../../source/data.json"), { 
                            dropDatabase: false, dropCollections: true 
                        });
            })
            .then(() => {
                return User.ensureIndexes();
            })
            .then(() => {
                console.log("Connection to database is established.");
                return Promise.resolve();
            })
            .catch(err => {
                console.log("Can not connect to database.");
                return Promise.reject(err);
            });
    },
    disconnect() {
        return mongoose.connection.close()
            .then(() => {
                console.log("Connection to database was closed.");
                return Promise.resolve();
            });
    },
    models: {
        User, Review, Course
    }
};