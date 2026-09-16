import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
    ca: fs.readFileSync("./certs/isrgrootx1.pem"),
  },
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connected to Database");
        connection.release();
    } catch (error) {
        console.error("Failed to connect to Database:", error.message);
    }
})();

export default db;