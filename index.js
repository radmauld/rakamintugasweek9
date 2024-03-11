const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const morgan = require("morgan");

const app = express();
app.use(express.json());

const pool = new Pool({
  user: "Postgres",
  host: localhost,
  database: "films",
  password: "admin",
  port: 5432,
});

app.use(morgan("combined"));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/users", authenticateToken, async (req, res) => {
  try {
    const limit = 10;
    const offset = req.query.page ? (req.query.page - 1) * limit : 0;
    const users = await pool.query("SELECT * FROM users LIMIT $1 OFFSET $2", [
      limit,
      offset,
    ]);
    res.json(users.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password, gender) VALUES ($1, $2, $3)",
      [email, hashedPassword, gender]
    );
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) return res.status(400).send("User not found");

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).send("Invalid password");

    const accessToken = jwt.sign(
      { email: user.rows[0].email },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({ accessToken: accessToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

app.use("/", bookroutes);

const = options = {
    definition: {
        openapi : "3.0.0",
        servers: [
            {
                url: "http://localhost:3000/",
            }
        ]
    }
    apis: ["./routes/*.js"]
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
