import axios from "axios";
import express from "express";

describe("Authorization", () => {
  const app = express();
  const authorizeMock = jest.fn()
  const setRequestIdHeaderMock = jest.fn()
  let serv;

  beforeAll(() => {
    app.set("port", process.env.PORT || 3000);

    app.get("/authorize", (req, res) => {
      res.status(204).end();
      if (req.get('X-Request-ID')) {
        setRequestIdHeaderMock()
      }
      authorizeMock()
    });
    app.get("/v0/users", (req, res) => {
      res.send("dummy users response");
    });
    serv = app.listen(app.get("port"), () => {});
  });

  it("Should call GET /authorize", async () => {
    let q = await axios.get("http://gateway:8080/api/users/v0/users");
    expect(q.data).toEqual("dummy users response");
    expect(authorizeMock).toHaveBeenCalled()
  });

  it("Should set X-Request-ID header", async () => {
    await axios.get("http://gateway:8080/api/users/v0/users");
    expect(setRequestIdHeaderMock).toHaveBeenCalled()
  });

  afterAll(done => {
    serv.close(done);
  });
});
