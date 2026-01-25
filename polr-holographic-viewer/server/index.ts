import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ZipProcessor } from './zip-processor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const extractedDir = path.join(__dirname, '../uploads/extracted');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(extractedDir)) {
  fs.mkdirSync(extractedDir, { recursive: true });
}

// Configure multer for zip file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (
  _req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only zip files
  if (
    file.mimetype === 'application/zip' ||
    file.mimetype === 'application/x-zip-compressed' ||
    file.originalname.endsWith('.zip')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only .zip files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
});

const zipProcessor = new ZipProcessor(extractedDir);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload zip file endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Received zip file: ${req.file.originalname}`);

    // Process the zip file
    const result = await zipProcessor.processZipFile(req.file.path, req.file.originalname);

    // Clean up the original zip file after extraction
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Zip file uploaded and processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to process zip file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get list of uploaded/extracted sessions
app.get('/api/files', async (_req, res) => {
  try {
    const files = await zipProcessor.listExtractedFiles();
    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Get specific extracted file content
app.get('/api/files/:sessionId/:filename', async (req, res) => {
  try {
    const { sessionId, filename } = req.params;
    const filePath = path.join(extractedDir, sessionId, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content, filename });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Get all parsed assembly data from uploaded zips
app.get('/api/assemblies', async (_req, res) => {
  try {
    const assemblies = await zipProcessor.getAllAssemblies();
    res.json({ assemblies });
  } catch (error) {
    console.error('Error getting assemblies:', error);
    res.status(500).json({ error: 'Failed to get assemblies' });
  }
});

// Delete an upload session
app.delete('/api/files/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await zipProcessor.deleteSession(sessionId);
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Serve static files from extracted directory
app.use('/uploads', express.static(extractedDir));

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  POLR Holographic Viewer - Upload Server                     ║
║  Running on http://localhost:${PORT}                            ║
╠══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║    POST /api/upload         - Upload zip file                ║
║    GET  /api/files          - List uploaded files            ║
║    GET  /api/assemblies     - Get parsed assembly data       ║
║    GET  /api/health         - Health check                   ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
