import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql, { OkPacket, RowDataPacket, Connection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
} = process.env;

console.log(`DB_HOST: ${DB_HOST}`);
console.log(`DB_USER: ${DB_USER}`);

// Define a database connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: 3306,
  database: 'discgolfdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create a table if it does not exist
(async () => {
  const connection = await pool.getConnection();
  try {
    // SQL script to create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS found_discs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        disc VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(15) NOT NULL,
        bin VARCHAR(10) NOT NULL,
        dateFound DATE NOT NULL,
        dateTexted DATE,
        dateClaimed DATE,
        status VARCHAR(50) NOT NULL
      )
    `;

    // Execute the SQL script
    await connection.query(createTableSQL);
    console.log('Table "found_discs" has been created if it did not exist.');

  } catch (error) {
    console.error('Error creating the table:', error);
  } finally {
    connection.release();
  }
})();

// Define a Disc interface
interface Disc {
  id?: number;
  course: string;
  name: string;
  disc: string;
  phoneNumber: string;
  bin: string;
  dateFound: string;
  dateTexted?: string | null;
  dateClaimed?: string | null;
  status: string;
  comments?: string | null; // Add the "comments" field
}

// API endpoints
app.post('/api/found-discs', async (req, res) => {
  try {
    console.log('POST /api/found-discs');
    console.log('req.body:', req.body);
    const newDiscData = req.body;
    const connection = await pool.getConnection();

    const insertQuery = `
      INSERT INTO found_discs (course, name, disc, phoneNumber, bin, dateFound, status, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      newDiscData.course,
      newDiscData.name,
      newDiscData.disc,
      newDiscData.phoneNumber,
      newDiscData.bin,
      newDiscData.dateFound,
      'Pending Text to Owner', // Initial status
      newDiscData.comments || null, // Use the provided "comments" or null if not provided
    ];

    // Execute the INSERT query
    const [result] = await connection.query<OkPacket>(insertQuery, values); // Cast to OkPacket

    connection.release();

    if (result.insertId) {
      const newDisc: Disc = {
        ...newDiscData,
        status: 'Pending Text to Owner',
        id: result.insertId,
      };

      res.status(201).json(newDisc);
    } else {
      res.status(500).json({ message: 'Failed to insert the disc' });
    }
  } catch (error) {
    console.error('Error adding disc:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const selectQuery = `
      SELECT id, course, name, disc, phoneNumber, bin, dateFound, dateTexted, dateClaimed, status, comments 
      FROM found_discs 
      WHERE status <> 'claimed'
    `;

    // Execute the SELECT query
    const [rows] = await connection.query<RowDataPacket[]>(selectQuery); // Cast to RowDataPacket[]

    connection.release();

    const unclaimedDiscs: Disc[] = rows.map((row) => ({
      id: row.id,
      course: row.course,
      name: row.name,
      disc: row.disc,
      phoneNumber: row.phoneNumber,
      bin: row.bin,
      dateFound: row.dateFound,
      dateTexted: row.dateTexted,
      dateClaimed: row.dateClaimed,
      status: row.status,
      comments: row.comments, // Include the "comments" field in the response
    }));

    res.json(unclaimedDiscs);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/mark-claimed/:id', async (req, res) => {
  try {
    console.log('PUT /api/mark-claimed/:id')
    console.log('req.params:', req.params)
    const discId = req.params.id;
    const claimedDate = new Date().toISOString();
    const connection = await pool.getConnection();
    
    const updateQuery = `
      UPDATE found_discs SET status = 'Claimed', dateClaimed = ? WHERE id = ?
    `;

    // Execute the UPDATE query
    await connection.query(updateQuery, [claimedDate, discId]);
    connection.release();

    res.status(200).json({ message: 'Disc marked as claimed' });
  } catch (error) {
    console.error('Error marking disc as claimed:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
