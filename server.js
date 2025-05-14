
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Serve index.html for any request that doesn't match a static file
// Using the most basic form to avoid path-to-regexp parsing errors
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Use the PORT environment variable provided by the hosting platform, or default to 8080
const PORT = process.env.PORT || 8080;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
