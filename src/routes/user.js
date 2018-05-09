const passport = require("../middleware/passport");
const { models: { User } } = require("../database");
/**Create the user routes
POST /api/users 201 - Creates a user, sets the Location header to "/", 
    and returns no content */
module.exports = router => {
    router.get("/users", passport, (req, res, next) => {
        return res.status(200).json(req.user);
    });
    router.post("/users", (req, res, next) => {
        User.create(req.body).then(user => {
            res.status(201).location("/").end();
        }).catch(err => next(err));
    });
    return router;
};