import axios from "axios";
import express from "express";

describe("This tests the api gateway", () => {
  const app = express();
  let serv;
  beforeAll(() => {
    app.set("port", process.env.PORT || 3000);

    app.get("/authorize", (req, res) => {
      expect(req.headers["x-requested-with"]).toEqual("axios");
      res.status(204).end();
    });

    app.get("/v0/users", (req, res) => {
      res.send("[]");
    });
    serv = app.listen(app.get("port"), () => {});
  });

  it("Should return requestid header", async () => {
    let q = await axios.get("http://gateway:8080/api/users/v0/users", {
      headers: {
        "x-requested-with": "axios"
      }
    });
    expect(q.status).toEqual(200);
    expect(q.headers['x-request-id']).toBeDefined();
    expect.assertions(3);
  });

  afterAll(done => {
    serv.close(done);
  });
});
