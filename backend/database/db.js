import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  password: "2023_Max",
  host: "localhost",
  port: "5432",
  database: "coralbase"
});

export default pool;