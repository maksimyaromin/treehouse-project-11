const passport = require("../middleware/passport");
const { models: { Review, Course } } = require("../database");
/**
 * 
POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
PUT /api/courses/:courseId 204 - Updates a course and returns no content
POST /api/courses/:courseId/reviews 201 - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content
 */
/**Use this middleware in the following routes:
POST /api/courses
PUT /api/courses/:courseId
GET /api/users
POST /api/courses/:courseId/reviews */
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
    router.post("/courses", passport, (req, res, next) => {
        Course.create(req.body).then(course => {
            res.status(201).location(`/course/${course.id}`).end();
        }).catch(err => next(err));
    });
    router.put("/courses/:id", passport, (req, res, next) => {
        const courseId = req.params.id;
        if(!courseId) {
            return next(new Error("Не передан ИД курса для обновления"));
        }
        Course.update({ _id: courseId }, req.body)
            .then(() => res.status(204).end())
            .catch(err => next(err));
    });
    router.post("/courses/:id/reviews", passport, (req, res, next) => {
        const courseId = req.params.id;
        if(!courseId) {
            return next(new Error("Не передан ИД курса для обновления"));
        }
        Course.findById(courseId)
            .populate("user")
            .then(course => {
                if(course.user._id.equals(req.user._id)) {
                    return Promise.reject(new Error("You can not review your own course, sorry."))
                }
                return Review.create({
                    ...req.body,
                    user: { _id: req.user._id }
                });
            })
            .catch(review => {
                return Course.update(
                    { _id: courseId }, 
                    { $push: { reviews: { _id: review._id } } }
                );
            })
            .then(() => {
                res.status(201).location(`/course/${courseId}`).end();
            })
            .catch(err => next(err));
    });
    return router;
};