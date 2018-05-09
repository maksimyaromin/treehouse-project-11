const auth = require("basic-auth");
const { models: { User } } = require("../database");
const ApiError = require("../errors/custom-error");

module.exports = (req, res, next) => {
    const credentials = auth(req);
    if(!credentials) {
        return next(new ApiError(`User credentials are required for this request`, 401));
    }
    User.authenticate(credentials.name, credentials.pass)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => next(new ApiError(err.message, 401)));
};