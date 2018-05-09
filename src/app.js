const express = require("express"),
   bodyParser = require("body-parser");

const ApiError = require("./errors/custom-error");

const app = express();
app.set("port", process.env.PORT || 3000);
app.set("json spaces", 40);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", require("./routes/user")(express.Router()));
app.use("/api", require("./routes/course")(express.Router()));

app.use((err, req, res, next) => {
    if(err instanceof ApiError) {
        res.status(err.statusCode);
    } else {
        res.status(400);
    }
    res.json({ success: false, error: err.message });
});

module.exports = app;