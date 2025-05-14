
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Check if dist directory exists, if not create it
const distDir = join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Created dist directory');
}

// Check if index.html exists, if not create a simple one
const indexPath = join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const fallbackHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shop Security Monitor</title>
      </head>
      <body>
        <div id="root">
          <h1>Shop Security Monitor</h1>
          <p>The application is running but the build directory was not found.</p>
          <p>Please make sure to run 'npm run build' before deploying.</p>
        </div>
      </body>
    </html>
  `;
  fs.writeFileSync(indexPath, fallbackHTML);
  console.log('Created fallback index.html');
}

// Serve static files from the dist directory
app.use(express.static(distDir));

// Simplified route handler to avoid path-to-regexp parsing errors
app.use((req, res) => {
  res.sendFile(indexPath);
});

// Use the PORT environment variable provided by the hosting platform, or default to 8080
const PORT = process.env.PORT || 8080;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
