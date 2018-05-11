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

/** Configuration morgan - logs are written to a file ../logs.log */
const httpLogStream = fs.createWriteStream(path.join(__dirname, "..", "logs.log"), { flags: "a" });
app.use(morgan("combined", { stream: httpLogStream }));

app.use("/api", require("./routes/user")(express.Router()));
app.use("/api", require("./routes/course")(express.Router()));

/** The error  404 handler*/
app.use((req, res, next) => {
    next(new ApiError("Sorry, requested route is not found.", 404));
});
/** Global error handler. Set default error code 400. But if as an error into the next function an error type ApiError was sent, 
 *  then error code is taken from statusCode field of the sent error
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