import Sequelize from "sequelize";

const db = new Sequelize(
  "postgres://postgres:postgres@:localhost/movies-database.sql"
);;

export default db;
