const mongoose = require("mongoose");

const User = require("./models/user")(mongoose),
    Review = require("./models/review")(mongoose),
    Course = require("./models/course")(mongoose);

module.exports = {
    connect(env) {
        const namespace = env.NODE_ENV === "test" ? "courses-test" : "courses";
        return mongoose.connect(`mongodb://localhost:27017/${namespace}`)
            .then(() => {
                return env.NODE_ENV === "production" 
                    ? Promise.resolve()
                    : require("mais-mongoose-seeder")(mongoose)
                        .seed(require("../../source/data.json"), { 
                            dropDatabase: false, dropCollections: true 
                        });
            })
            .then(() => {
                console.log("Connection to database was established.");
                return Promise.resolve();
            })
            .catch(err => {
                console.log("Can not connect to database.");
                return Promise.reject(err);
            });
    },
    models: {
        User, Review, Course
    }
};