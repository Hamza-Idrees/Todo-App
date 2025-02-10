const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const {
  reqUserRegister,
  reqUserLogin,
  testImage,
} = require("../helper/user.test.data");
const { expect } = chai;

chai.use(chaiHttp);
chai.should();

let token = "";

describe("POST /register", () => {
  it("should register a new user with an image", (done) => {
    chai
      .request(app)
      .post("/register")
      .field("username", reqUserRegister.username)
      .field("pass", reqUserRegister.pass)
      .field("role", reqUserRegister.role)
      .field("email", reqUserRegister.email)
      .attach("images", testImage.path)
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(201);
        res.body.user.should.have
          .property("username")
          .eql(reqUserRegister.username);
        res.body.user.should.have.property("email").eql(reqUserRegister.email);
        done();
      });
  });

  it("should not register a user with existing email", (done) => {
    chai
      .request(app)
      .post("/register")
      .set("Content-Type", "application/json")
      .send(reqUserRegister)
      .end((err, res) => {
        expect(res).to.have.status(409);
        expect(res.body).to.have.property("error", "Email already exists.");
        done();
      });
  });
});

describe("POST /login", () => {
  it("should login a user and return a token", (done) => {
    chai
      .request(app)
      .post("/login")
      .send(reqUserLogin)
      .end((err, res) => {
        if (err) {
          console.error("Login error:", err);
          done(err);
        } else {
          console.log("Login Response Body:", res.body);
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("message").eql("Success");
          res.body.should.have.property("token");
          token = res.body.token;
          done();
        }
      });
  });

  it("should fail login with invalid credentials", (done) => {
    chai
      .request(app)
      .post("/login")
      .send({
        username: "invalidUser",
        pass: "invalidPassword",
        email: "invalidEmail",
      })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an("object");
        res.body.should.have.property("message").eql("Unauthorized");
        done();
      });
  });
});

describe("GET /user", () => {
  it("should return the user data for a valid token", (done) => {
    chai
      .request(app)
      .get("/")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          console.error("Get user error:", err);
          done(err);
        } else {
          console.log("Get User Response Body:", res.body);
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("user");
          res.body.user.should.have
            .property("username")
            .eql(reqUserRegister.username);
          res.body.user.should.have
            .property("email")
            .eql(reqUserRegister.email);
          res.body.user.should.have.property("role").eql(reqUserRegister.role);
          done();
        }
      });
  });
});
