import axios from "axios";
import express from "express";

describe("Not Authorized", () => {
  const app = express();
  let serv;
  beforeAll(() => {
    app.set("port", process.env.PORT || 3000);

    app.get("/authorize", (req, res) => {
      res
        .status(401)
        .send({ error: "wrong auth token" })
        .end();
    });

    app.get("/v0/users", (req, res) => {
      res.send("[]");
    });
    serv = app.listen(app.get("port"), () => {});
  });

  it("Should not authorize request", async () => {
    await expect(
      axios.get("http://gateway:8080/api/users/v0/users")
    ).rejects.toThrow("Request failed with status code 401");
  });

  it("Should forward error from authorize request", async () => {
    try {
      await axios.get("http://gateway:8080/api/users/v0/users");
    } catch (e) {
      expect(e.response.data).toEqual({ error: "wrong auth token" });
      expect(e.response.headers['x-request-id']).toBeDefined();
    }
  });

  afterAll(done => {
    serv.close(done);
  });
});
