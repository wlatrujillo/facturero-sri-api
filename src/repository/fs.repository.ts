import * as fs from 'fs';

const BASE_DIR = './facturero_data';

export class FsRepository {
    
    private baseDir: string;
    constructor() {
        this.baseDir = BASE_DIR;
    }

    public async writeFile(folderName: string, fileName: string, fileContent: Buffer): Promise<void> {
        const dirPath = `${this.baseDir}/${folderName}`;
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        const filePath = `${dirPath}/${fileName}`;
        fs.writeFileSync(filePath, fileContent);
    }

    public async readFile(folderName: string, fileName: string): Promise<Buffer> {
        const filePath = `${this.baseDir}/${folderName}/${fileName}`;
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found");
        }
        return fs.readFileSync(filePath);
    }
}   