class ApiError extends Error {
    constructor(message = "Internal API Error", statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
};
module.exports = ApiError;