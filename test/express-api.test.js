const supertest = require("supertest");
const { connect, disconnect } = require("../src/database");

const TEST_CREDENTIALS = "am9lQHNtaXRoLmNvbTpwYXNzd29yZA=="; //joe@smith.com:password
const TEST_EMAIL = "joe@smith.com";
const TEST_COURSE_ID = "57029ed4795118be119cc43d";

describe("Express API", () => {
    let request = null;

    before(done => {
        connect(process.env).then(() => {
            app.listen(8001);
            request = supertest(app);
            done();
        }).catch(err => done(err));
    });

    describe("GET /api/users", () => {
        it("должен работать только для авторизованных пользователей", done => {
            request.get("/api/users")
                .expect(401)
                .then(() => done())
                .catch(err => done(err));
        });
        it("для авторизованного пользователя должен возвращать его документ из базы данных", done => {
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
        it("должен возвращать статус ответа 201 и заголовок Location в значении '\\'", done => {
            request.post("/api/users")
                .send({ fullName: "John Smith", emailAddress: "john@smith.com", password: "password", confirmPassword: "password" })
                .set("Content-Type", "application/json")
                .expect(201)
                .then(() => done())
                .catch(err => done(err));
        });
        it("должен вернуть ошибку 400 при передаче не заполненной модели пользователя", done => {
            request.post("/api/users")
                .set("Content-Type", "application/json")
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
        it("должен вернуть ошибку при попытке сохранить пользователя с уже существующим в базе данных email", done => {
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
        it("должен вернуть список всех курсов со свойствами _id и title", done => {
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

    describe("GET /api/course/:id", () => {
        it("Должен вернуть ошибку, если в запрос передать не верный ИД", done => {
            request.get(`/api/course/007`)
                .expect(400)
                .then(() => done())
                .catch(err => done(err));
        });
        it("Должен вернуть один курс, его пользователя и обзоры по переданному ИД", done => {
            request.get(`/api/course/${TEST_COURSE_ID}`)
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

    after(done => {
        disconnect().then(() => process.exit(0))
            .catch(err => {
                console.error(err);
                process.exit(1);
            });
    });
});