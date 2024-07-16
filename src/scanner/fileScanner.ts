import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export class FileScanner {
  private cache: any;
  private fileTypes: string[];
  private ignoreFolders: string[];

  constructor(fileTypes: string[], ignoreFolders: string[]) {
    this.cache = {};
    this.fileTypes = fileTypes;
    this.ignoreFolders = ignoreFolders;
  }

  async scan(projectPath: string): Promise<any> {
    const files = await vscode.workspace.findFiles(
      "**/*.{js,ts,jsx,tsx,json,md}",
      this.getIgnorePattern()
    );
    const changes: any = {};

    for (const file of files) {
      const filePath = file.fsPath;
      const hash = this.hashFile(filePath);
      if (this.cache[filePath] !== hash) {
        this.cache[filePath] = hash;
        changes[filePath] = filePath;
      }
    }

    return changes;
  }

  private getIgnorePattern(): string {
    return `{${this.ignoreFolders.join(",")}}/**`;
  }

  async collectData(changes: any): Promise<any> {
    const data: Record<string, any> = {};
    for (const filePath of Object.keys(changes)) {
      const content = fs.readFileSync(filePath, "utf8");
      data[filePath] = content;
    }
    return data;
  }

  private hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(content).digest("hex");
  }
}
