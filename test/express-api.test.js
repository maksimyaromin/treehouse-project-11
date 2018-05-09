const supertest = require("supertest");
const { connect } = require("../src/database");

const TEST_CREDENTIALS = "am9lQHNtaXRoLmNvbTpwYXNzd29yZA=="; //joe@smith.com:password
const TEST_EMAIL = "joe@smith.com";

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
                    done();
                })
                .catch(err => done(err));
        });
    });
});