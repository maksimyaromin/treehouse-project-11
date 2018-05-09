const passport = require("../middleware/passport");
const { models: { Course } } = require("../database");
/**
 * 
POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
PUT /api/courses/:courseId 204 - Updates a course and returns no content
POST /api/courses/:courseId/reviews 201 - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content
 */
module.exports = router => {
    router.get("/courses", (req, res, next) => {
        Course.find(null, "title").then(courses => {
            res.status(200).json(courses);
        }).catch(err => next(err));
    });
    router.get("/course/:id", (req, res, next) => {
        const courseId = req.params.id;
        if(!courseId) {
            return next(new Error("Не передан ИД запрашиваемого курса"));
        }
        Course.findById(courseId)
            .populate({ path: "user", select: "fullName" })
            .populate("reviews")
            .then(course => {
                res.status(200).json(course);
            })
            .catch(err => next(err));
    });
    return router;
};