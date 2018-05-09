const { connect } = require("./database"),
              app = require("./app"),
             http = require("http");

connect(process.env).then(() => {
    http.createServer(app).listen(app.get("port"), () => {
        console.log(`Serving: localhost:${app.get("port")}`);
    });
}).catch(err => {
    console.error(err);
    process.exit(0);
});