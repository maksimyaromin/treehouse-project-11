const mongoose = require("mongoose");
const source = require("../source/data.json");
const User = require("./models/user")(mongoose),
    Review = require("./models/review")(mongoose),
    Course = require("./models/course")(mongoose);
const seeder = require("mongoose-seeder")(mongoose);

mongoose.connect("mongodb://localhost:27017/rest");

mongoose.connection.on("connected", () => {
    console.log("MongoDB was connected");
    Course.find().exec((err, user) => {
        console.log(user);
        process.exit(1);
    });
    /* seeder.seed(source, { dropDatabase: false, dropCollections: true })
        .then(data => {
            
            
        })
        .catch(err => {
            console.error(err);
            process.exit(0);
        }); */
});