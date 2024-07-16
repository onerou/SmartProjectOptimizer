import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function loadConfig(): any {
  const defaultConfigPath = path.join(
    __dirname,
    "../../config/defaultConfig.json"
  );
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const customConfigPath =
    workspaceFolders && workspaceFolders.length > 0
      ? path.join(workspaceFolders[0].uri.fsPath, "customConfig.json")
      : null;

  let config = JSON.parse(fs.readFileSync(defaultConfigPath, "utf8"));
  if (customConfigPath && fs.existsSync(customConfigPath)) {
    const customConfig = JSON.parse(fs.readFileSync(customConfigPath, "utf8"));
    config = { ...config, ...customConfig };
  }

  return config;
}
