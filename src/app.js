const express = require("express"),
   bodyParser = require("body-parser"),
           fs = require("fs"),
         path = require("path"),
       morgan = require("morgan");

const ApiError = require("./errors/custom-error");

const app = express();
app.set("port", process.env.PORT || 3000);
app.set("json spaces", 40);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** Конфигурация morgan - логи пишутся в файл ../logs.log */
const httpLogStream = fs.createWriteStream(path.join(__dirname, "..", "logs.log"), { flags: "a" });
app.use(morgan("combined", { stream: httpLogStream }));

app.use("/api", require("./routes/user")(express.Router()));
app.use("/api", require("./routes/course")(express.Router()));

/** Обработчик ошибки 404 */
app.use((req, res, next) => {
    next(new ApiError("Sorry, requested route not found.", 404));
});
/** Глобальный обработчик ошибок. По умолчанию выставляет код ошибки 400. Но если в качестве ошибки в функцию next передавалась
 *  ошибка типа ApiError, то код ошибки будет взят из поля statusCode переданной ошибки
 */
app.use((err, req, res, next) => {
    if(err instanceof ApiError) {
        res.status(err.statusCode);
    } else {
        res.status(400);
    }
    res.json({ success: false, error: err.message, code: err.code || -100 });
});

module.exports = app;