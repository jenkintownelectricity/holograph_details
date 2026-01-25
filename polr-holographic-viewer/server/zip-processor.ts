import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Assembly layer interface (Construction DNA format)
export interface AssemblyLayer {
  position: number;
  code: string;
  name: string;
  thickness?: {
    nominal: number;
    unit: string;
  };
  material_dna_id?: string;
  properties?: Record<string, unknown>;
}

// Assembly interface (Construction DNA format)
export interface Assembly {
  id: string;
  name: string;
  description?: string;
  category?: string;
  layers: AssemblyLayer[];
  metadata?: Record<string, unknown>;
}

// Extraction result interface
export interface ExtractionResult {
  sessionId: string;
  originalFilename: string;
  extractedFiles: string[];
  filteredFiles: string[];
  assemblies: Assembly[];
  timestamp: string;
}

// Garbage file patterns to filter out
const GARBAGE_PATTERNS = [
  '__MACOSX',
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  '._.', // Mac resource fork files
  '._',  // Mac metadata files
];

export class ZipProcessor {
  private extractDir: string;

  constructor(extractDir: string) {
    this.extractDir = extractDir;
  }

  /**
   * Check if a file path matches garbage patterns
   */
  private isGarbageFile(filePath: string): boolean {
    const fileName = path.basename(filePath);
    const normalizedPath = filePath.replace(/\\/g, '/');

    for (const pattern of GARBAGE_PATTERNS) {
      if (normalizedPath.includes(pattern) || fileName.startsWith(pattern)) {
        return true;
      }
    }

    // Also filter hidden files (starting with .)
    if (fileName.startsWith('.') && fileName !== '.json') {
      return true;
    }

    return false;
  }

  /**
   * Validate and parse a JSON file as an Assembly
   */
  private parseAssemblyJson(content: string, filename: string): Assembly | null {
    try {
      const data = JSON.parse(content);

      // Validate required fields
      if (!data.id || !data.name || !Array.isArray(data.layers)) {
        console.log(`Skipping ${filename}: missing required fields (id, name, layers)`);
        return null;
      }

      // Validate layers have required fields
      const validLayers = data.layers.filter((layer: AssemblyLayer) => {
        return layer.position !== undefined && layer.code && layer.name;
      });

      if (validLayers.length === 0) {
        console.log(`Skipping ${filename}: no valid layers found`);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        layers: validLayers,
        metadata: data.metadata
      };
    } catch (error) {
      console.log(`Skipping ${filename}: invalid JSON - ${error}`);
      return null;
    }
  }

  /**
   * Process a zip file - extract, filter garbage, parse assemblies
   */
  async processZipFile(zipPath: string, originalFilename: string): Promise<ExtractionResult> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionDir = path.join(this.extractDir, sessionId);

    // Create session directory
    fs.mkdirSync(sessionDir, { recursive: true });

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const extractedFiles: string[] = [];
    const filteredFiles: string[] = [];
    const assemblies: Assembly[] = [];

    for (const entry of zipEntries) {
      const entryName = entry.entryName;

      // Skip directories
      if (entry.isDirectory) {
        continue;
      }

      // Check if it's a garbage file
      if (this.isGarbageFile(entryName)) {
        filteredFiles.push(entryName);
        console.log(`Filtered garbage: ${entryName}`);
        continue;
      }

      // Extract the file
      const targetPath = path.join(sessionDir, path.basename(entryName));
      fs.writeFileSync(targetPath, entry.getData());
      extractedFiles.push(path.basename(entryName));

      // If it's a JSON file, try to parse it as an assembly
      if (entryName.endsWith('.json')) {
        const content = entry.getData().toString('utf-8');
        const assembly = this.parseAssemblyJson(content, entryName);
        if (assembly) {
          assemblies.push(assembly);
          console.log(`Parsed assembly: ${assembly.name} (${assembly.layers.length} layers)`);
        }
      }
    }

    // Save extraction metadata
    const result: ExtractionResult = {
      sessionId,
      originalFilename,
      extractedFiles,
      filteredFiles,
      assemblies,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(sessionDir, '_metadata.json'),
      JSON.stringify(result, null, 2)
    );

    console.log(`
    Extraction complete:
    - Session: ${sessionId}
    - Extracted: ${extractedFiles.length} files
    - Filtered: ${filteredFiles.length} garbage files
    - Assemblies: ${assemblies.length} valid assemblies
    `);

    return result;
  }

  /**
   * List all extracted file sessions
   */
  async listExtractedFiles(): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];

    if (!fs.existsSync(this.extractDir)) {
      return results;
    }

    const sessions = fs.readdirSync(this.extractDir);

    for (const sessionId of sessions) {
      const metadataPath = path.join(this.extractDir, sessionId, '_metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        results.push(metadata);
      }
    }

    return results.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get all assemblies from all sessions
   */
  async getAllAssemblies(): Promise<Assembly[]> {
    const sessions = await this.listExtractedFiles();
    const assemblies: Assembly[] = [];

    for (const session of sessions) {
      assemblies.push(...session.assemblies);
    }

    return assemblies;
  }

  /**
   * Delete an upload session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const sessionDir = path.join(this.extractDir, sessionId);

    if (!fs.existsSync(sessionDir)) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Remove all files in the session directory
    const files = fs.readdirSync(sessionDir);
    for (const file of files) {
      fs.unlinkSync(path.join(sessionDir, file));
    }

    // Remove the session directory
    fs.rmdirSync(sessionDir);
  }
}
