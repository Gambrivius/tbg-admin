const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  port: parseInt(process.env.MYSQL_PORT ? process.env.MYSQL_PORT : "3000"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const promisePool = pool.promise();

export async function PromiseQuery(
  sql: string,
  params: string[] | null
): Promise<[rows: any[], fields: any[]]> {
  const [rows, fields] = await promisePool.query(sql, params);
  return [rows, fields];
}

export default promisePool;
