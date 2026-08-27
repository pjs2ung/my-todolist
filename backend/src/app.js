const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require("../swagger.json");

const pool = require("./db/pool");
const errorHandler = require("./middlewares/errorHandler");
const authRoute = require("./routes/auth.route");
const usersRoute = require("./routes/users.route");
const categoriesRoute = require("./routes/categories.route");
const todosRoute = require("./routes/todos.route");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const allowlist = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowlist.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        Object.assign(new Error("Not allowed by CORS"), {
          status: 403,
          code: "CORS_NOT_ALLOWED",
        }),
      );
    },
    credentials: true,
  }),
);

app.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    err.status = 500;
    err.code = "DB_UNAVAILABLE";
    next(err);
  }
});

if (process.env.NODE_ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/todos", todosRoute);

app.use(errorHandler);

module.exports = app;
