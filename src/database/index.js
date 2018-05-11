const mongoose = require("mongoose");

const User = require("./models/user")(mongoose),
    Review = require("./models/review")(mongoose),
    Course = require("./models/course")(mongoose);

module.exports = {
    /**
     * Функция выполняет подключение к базе данных. Логика работы следующая:
     * если в качетсве среды используется test, то база будет называться courses-test, если что либо иноее, то courses.
     * Далее, после установки подключения к MongoDB, если среда не production, то в базу будут загружены тестовые данные
     * при помощи пакета mais-mongoose-seeder. После будут установлены индекса модели User и возвращен промис.
     * 
     * @param {Object} env переменные окружения
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
                console.log("Connection to database was established.");
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