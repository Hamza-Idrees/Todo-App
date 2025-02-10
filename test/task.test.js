const request = require("supertest");
const app = require("../index.js");
require("dotenv").config();
const { reqAddTask, reqUpdateTask } = require("../helper/task.test.data.js");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzdlMWUyZTBhZWQ2M2U1YzJiYmI3ZTIiLCJ1c2VybmFtZSI6InVzbWFuIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2MzE4NTEwLCJleHAiOjE3MzYzMjIxMTB9.zveN1pRDK9dJxqf3Vg6E4qt0JqdAQGZy9cC-Hd3z788";
let taskId = "";

describe("POST /task", () => {
  it("should create a task", async () => {
    return request(app)
      .post("/task")
      .set("Authorization", `Bearer ${token}`)
      .send(reqAddTask)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("task._id");
        taskId = body.task._id;
      });
  });
});

describe("GET /tasks", () => {
  it("should return all tasks", async () => {
    return request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("GET /task/:id", () => {
  it("should return task by id", async () => {
    return request(app)
      .get(`/task/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("PUT /task/:id", () => {
  it("should update task by id", async () => {
    return request(app)
      .put(`/task/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(reqUpdateTask)
      .expect(200)
      .then(({ body }) => {
        expect(body.task.taskName).toBe("task updated");
      });
  });
});

describe("DELETE /task/:id", () => {
  it("should delete task by id", async () => {
    return request(app)
      .delete(`/task/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});
