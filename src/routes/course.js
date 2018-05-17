const passport = require("../middleware/passport");
const { models: { Review, Course } } = require("../database");

/** Rout description /api/courses && /api/course */
module.exports = router => {
    router.get("/courses", (req, res, next) => {
        Course.find(null, "title").then(courses => {
            res.status(200).json(courses);
        }).catch(err => next(err));
    });
    router.get("/courses/:id", (req, res, next) => {
        const courseId = req.params.id;
        if(!courseId) {
            return next(new Error("The requested course ID is not sent"));
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
            return next(new Error("Course ID is not sent for update"));
        }
        Course.update({ _id: courseId }, req.body)
            .then(() => res.status(204).end())
            .catch(err => next(err));
    });
    router.post("/courses/:id/reviews", passport, (req, res, next) => {
        const courseId = req.params.id;
        if(!courseId) {
            return next(new Error("Course ID is not sent for update"));
        }
        /** Find the requested course in data base */
        Course.findById(courseId)
            .populate("user")
            .then(course => {
                /** Check if the author of the course is the current authorized user. If it is true - return an error,
                 * as far as the user can not leave feedback on his own courses
                 */
                if(course.user._id.equals(req.user._id)) {
                    return Promise.reject(new Error("You can not review your own course, sorry."))
                }
                const review = req.body;
                if(!review) {
                    return Promise.reject(new Error("Please, send review for course."));
                }
                review.user = { _id: req.user._id };
                return Review.create(review);
            })
            .then(review => {
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