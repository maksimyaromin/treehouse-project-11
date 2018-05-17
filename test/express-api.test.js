const supertest = require("supertest");
const { connect, disconnect } = require("../src/database");

/* IMPORTANT: for testing I used data from your file with test data  ../source/data.json. For
    tests success this data is automatically inserted into the test database. Do not change them in order not to break tests. */
const TEST_CREDENTIALS = "am9lQHNtaXRoLmNvbTpwYXNzd29yZA=="; // joe@smith.com:password
const TEST_REVIEWER_CREDENTIALS = "c2FtQGpvbmVzLmNvbTpwYXNzd29yZA=="; // sam@jones.com:password
const TEST_EMAIL = "joe@smith.com";
const TEST_COURSE_ID = "57029ed4795118be119cc43d";

/* In this file there is automated version of all the queries that you wrote in the file CourseAPI.postman_collection.json,
   for test reason you may use any of them if you wish */
describe("Express API", () => {
    let request = null;

    /* Before all the tests are started, the connection to the test database is established, the data is settled in it, 
		the Express application is launched on the 8001 port and is passed as an entry point to the supertes package, 
		which executes queries to the API methods */
    before(function(done) {
        this.timeout(10000);
        connect({ NODE_ENV: "test" }).then(() => {
            app.listen(8001);
            request = supertest(app);
            done();
        }).catch(err => done(err));
    });

    describe("GET /api/users", () => {
        it("should only work for authorized users", done => {
            request.get("/api/users")
                .expect(401)
                .then(() => done())
                .catch(err => done(err));
        });
        it("for an authorized user his document must return from the database", done => {
            request.get("/api/users")
                .set("Authorization", `Basic ${TEST_CREDENTIALS}`)
                .expect(200)
                .then(res => {
                    expect(res.body)
                        .to.have.property("emailAddress").with
                        .to.be.equal(TEST_EMAIL);
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe("POST /api/users", () => {
        it("should return the response status 201 and the Location header with the value '/'", done => {
            request.post("/api/users")
                .send({ fullName: "John Smith", emailAddress: "john@smith.com", password: "password", confirmPassword: "password" })
                .set("Content-Type", "application/json")
                .expect(201)
                .expect("Location", "/")
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return error 400 when transferring an uncompleted user model", done => {
            request.post("/api/users")
                .set("Content-Type", "application/json")
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return an error when trying to save a user with an email already existing in the database", done => {
            request.post("/api/users")
                .send({ fullName: "Joe Smith", emailAddress: "joe@smith.com", password: "password", confirmPassword: "password" })
                .set("Content-Type", "application/json")
                .expect(400)
                .then(res => {
                    expect(res.body)
                        .to.have.property("success").with
                        .to.be.equal(false);
                    expect(res.body)
                        .to.have.property("code").with
                        .to.be.equal(11000);
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe("GET /api/courses", () => {
        it("should return a list of all courses with properties _id and title", done => {
            request.get("/api/courses")
                .expect(200)
                .then(res => {
                    expect(res.body).to.be.a("array");
                    expect(res.body).to.be.have.lengthOf(2);
                    res.body.forEach(item => {
                        expect(item).to.have.property("_id");
                        expect(item).to.have.property("title");
                    });
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe("GET /api/courses/:id", () => {
        it("should return an error if the request fails to pass the valid ID", done => {
            request.get(`/api/courses/007`)
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return one course, its user and reviews on the sent ID", done => {
            request.get(`/api/courses/${TEST_COURSE_ID}`)
                .expect(200)
                .then(res => {
                    expect(res.body)
                        .to.have.property("_id").with
                        .to.be.equal(TEST_COURSE_ID);
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe("POST /api/courses", () => {
        it("should only work for authorized users", done => {
            request.post("/api/courses")
                .expect(401)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return the response status 201 and the Location header with the value '/course/:id'", done => {
            request.post("/api/courses")
                .set("Authorization", `Basic ${TEST_CREDENTIALS}`)
                .send({ title: "New Course", description: "My course description", user: { _id:  "57029ed4795118be119cc437" }, steps: [ { title: "Step 1", description: "My first step." } ] })
                .set("Content-Type", "application/json")
                .expect(201)
                .then(res => {
                    expect(res.headers.location)
                        .to.match(/\/course\/\w+/gi);
                    done();
                })
                .catch(err => done(err));
        });
        it("should return error 400 when transferring an uncompleted user model", done => {
            request.post("/api/courses")
                .set("Authorization", `Basic ${TEST_CREDENTIALS}`)
                .set("Content-Type", "application/json")
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
    });

    describe("PUT /api/courses/:id", () => {
        it("should only work for authorized users", done => {
            request.put(`/api/courses/${TEST_COURSE_ID}`)
                .expect(401)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return an error if the request fails to pass the valid ID", done => {
            request.put(`/api/courses/007`)
                .set("Authorization", `Basic ${TEST_CREDENTIALS}`)
                .send({ _id: TEST_COURSE_ID, title: "New Course Updated Again Hello", description: "My course description. And again.", user: { _id:  "57029ed4795118be119cc437" }, steps: [ { title: "Step 1", description: "My first step." } ] })
                .set("Content-Type", "application/json")
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return a response status of 204 upon successful completion of work", done => {
            request.put(`/api/courses/${TEST_COURSE_ID}`)
                .set("Authorization", `Basic ${TEST_CREDENTIALS}`)
                .send({ _id: TEST_COURSE_ID, title: "New Course Updated Again Hello", description: "My course description. And again.", user: { _id:  "57029ed4795118be119cc437" }, steps: [ { title: "Step 1", description: "My first step." } ] })
                .set("Content-Type", "application/json")
                .expect(204)
                .then(res => done())
                .catch(err => done(err));
        });
    });

    describe("POST /api/courses/:id/reviews", () => {
        it("should only work for authorized users", done => {
            request.post(`/api/courses/${TEST_COURSE_ID}/reviews`)
                .expect(401)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return an error if the request fails to pass the valid ID", done => {
            request.post(`/api/courses/007/reviews`)
                .set("Authorization", `Basic ${TEST_REVIEWER_CREDENTIALS}`)
                .send({ rating: 2 })
                .set("Content-Type", "application/json")
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
        it("should return the response status 201 and the Location header with the value '/course/:id'", done => {
            request.post(`/api/courses/${TEST_COURSE_ID}/reviews`)
                .set("Authorization", `Basic ${TEST_REVIEWER_CREDENTIALS}`)
                .send({ rating: 2 })
                .set("Content-Type", "application/json")
                .expect(201)
                .then(res => {
                    expect(res.headers.location)
                        .to.match(/\/course\/\w+/gi);
                    done();
                })
                .catch(err => done(err));
        });
        it("should return an error when trying to leave review for its own course", done => {
            request.post(`/api/courses/${TEST_COURSE_ID}/reviews`)
            .set("Authorization", `Basic ${TEST_CREDENTIALS}`)
            .send({ rating: 2 })
            .set("Content-Type", "application/json")
            .expect(400)
            .then(res => done())
            .catch(err => done(err));
        });
    });

    after(function(done) {
        disconnect().then(done).catch(done);
    });
});