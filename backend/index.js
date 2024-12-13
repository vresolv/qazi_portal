const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'qazi_ai_db',
    password: 'test@123',
    port: 5432,
});

// Configure multer for file uploads
const upload = multer({
    dest: path.join(__dirname, 'uploads'),
});

app.use(cors());
app.use(express.json());

// handling Cases data

// Fetch all cases
app.get('/cases', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cases');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new case
app.post('/cases', async (req, res) => {
    const { caseNumber, caseName, type, daysOpen, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cases (case_number, case_name, type, days_open, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [caseNumber, caseName, type, daysOpen, status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete case and related files
app.delete('/cases/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('BEGIN');
        await pool.query('DELETE FROM uploaded_files WHERE case_id = $1', [id]);
        await pool.query('DELETE FROM cases WHERE id = $1', [id]);
        await pool.query('COMMIT');

        res.json({ message: 'Case and related files deleted successfully' });
    } catch (err) {
        console.error(err.message);

        await pool.query('ROLLBACK');
        res.status(500).send('Server Error');
    }
});

// handling litigation data

// Fetch the latest litigation data
app.get('/litigation', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM litigation_data');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add or update litigation data
app.post('/litigation', async (req, res) => {
    const { aiText, fileName, generatedResults } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO litigation_data (ai_text, file_name, generated_results) VALUES ($1, $2, $3) RETURNING *',
            [aiText, fileName, generatedResults]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// handling file attachments with cases

// Upload files for a specific case
app.post(
    '/cases/:id/upload-files',
    upload.fields([
        { name: 'legalDocuments', maxCount: 10 },
        { name: 'evidence', maxCount: 10 },
    ]),
    async (req, res) => {
        const { id } = req.params;

        try {
            // Fetch the case_name from the cases table using the case_id
            const caseResult = await pool.query('SELECT case_name FROM cases WHERE id = $1', [id]);

            if (caseResult.rows.length === 0) {
                return res.status(404).json({ message: 'Case not found' });
            }

            const caseName = caseResult.rows[0].case_name;

            const files = [];
            ['legalDocuments', 'evidence'].forEach((type) => {
                if (req.files[type]) {
                    req.files[type].forEach((file) => {
                        files.push({
                            case_id: id,
                            file_type: type,
                            file_name: file.originalname,
                            file_path: file.path,
                            case_name: caseName, // Add the case_name here
                        });
                    });
                }
            });

            // Insert file details into the database
            const insertPromises = files.map((file) =>
                pool.query(
                    'INSERT INTO uploaded_files (case_id, file_type, file_name, file_path, case_name) VALUES ($1, $2, $3, $4, $5)',
                    [file.case_id, file.file_type, file.file_name, file.file_path, file.case_name]
                )
            );
            await Promise.all(insertPromises);

            res.json({ message: 'Files uploaded successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Fetch files for a specific case
app.get('/cases/:id/files', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, file_type, file_name, file_path, case_name FROM uploaded_files WHERE case_id = $1',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Serve files to viewed or get downloaded
app.get('/files/:fileName', async (req, res) => {
    const { fileName } = req.params;

    try {
        const result = await pool.query('SELECT file_path FROM uploaded_files WHERE file_name = $1', [fileName]);

        if (result.rows.length === 0) {
            return res.status(404).send('File not found');
        }

        const filePath = result.rows[0].file_path;

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error serving file:', err);
                res.status(500).send('Error serving file');
            }
        });
    } catch (err) {
        console.error('Error fetching file:', err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/files/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid file ID' });
    }

    try {
        const fileResult = await pool.query(
            'SELECT file_path FROM uploaded_files WHERE id = $1',
            [id]
        );
        const filePath = fileResult.rows[0]?.file_path;

        if (!filePath) {
            return res.status(404).json({ message: 'File not found' });
        }

        await pool.query('DELETE FROM uploaded_files WHERE id = $1', [id]);

        const fs = require('fs');
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file from disk:', err);
            }
        });

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ message: 'Server error' });
    }
});



const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

