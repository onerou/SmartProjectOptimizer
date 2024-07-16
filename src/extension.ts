import * as vscode from "vscode";
import { ProjectContext } from "./context/projectContext";
import { FileScanner } from "./scanner/fileScanner";
import { AIClient } from "./api/aiClient";
import { applyCustomRules } from "./config/customRules";

export function activateExtension(context: vscode.ExtensionContext) {
  const projectContext = new ProjectContext();
  const config = getConfig();
  projectContext.setConfig(config);

  const fileScanner = new FileScanner(config.fileTypes, config.ignoreFolders);
  const aiClient = new AIClient(config.apiEndpoint, config.apiToken);

  vscode.workspace.onDidChangeWorkspaceFolders((event) => {
    event.added.forEach((folder) => {
      const projectPath = folder.uri.fsPath;
      projectContext.setProjectPath(projectPath);
      scanAndAnalyzeProject(
        projectPath,
        projectContext,
        fileScanner,
        aiClient,
        config
      );
    });
  });

  let disposable = vscode.commands.registerCommand(
    "extension.optimizeProject",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "optimizeProject",
        "Optimize Project",
        vscode.ViewColumn.One,
        {}
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "askAI") {
          const question = message.text;
          const projectData = projectContext.getContext();
          const answer = await aiClient.askQuestion(question, projectData);
          panel.webview.postMessage({ command: "answer", text: answer });
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function getConfig() {
  const config = vscode.workspace.getConfiguration("aiPlugin");
  return {
    apiEndpoint: config.get<string>(
      "apiEndpoint",
      "https://your-ai-api-endpoint"
    ),
    apiToken: config.get<string>("apiToken", ""),
    fileTypes: config.get<string[]>("fileTypes", [
      "js",
      "ts",
      "jsx",
      "tsx",
      "json",
      "md",
    ]),
    ignoreFolders: config.get<string[]>("ignoreFolders", [
      "node_modules",
      "dist",
      "build",
    ]),
    detectLargeFiles: config.get<boolean>("customRules.detectLargeFiles", true),
  };
}

async function scanAndAnalyzeProject(
  projectPath: string,
  projectContext: ProjectContext,
  fileScanner: FileScanner,
  aiClient: AIClient,
  config: any
) {
  const changes = await fileScanner.scan(projectPath);
  if (Object.keys(changes).length > 0) {
    const projectData = await fileScanner.collectData(changes);
    const filteredData = applyCustomRules(projectData, config.customRules);
    projectContext.updateContext(filteredData);
    await aiClient.sendProjectData(filteredData);
  }
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Optimize Project</title>
    </head>
    <body>
      <h1>Ask AI about your project</h1>
      <textarea id="question" rows="4" cols="50"></textarea><br>
      <button onclick="askAI()">Ask</button>
      <h2>Answer</h2>
      <pre id="answer"></pre>
      <script>
        const vscode = acquireVsCodeApi();
        function askAI() {
          const question = document.getElementById('question').value;
          vscode.postMessage({ command: 'askAI', text: question });
        }

        window.addEventListener('message', event => {
          const message = event.data;
          if (message.command === 'answer') {
            document.getElementById('answer').textContent = message.text;
          }
        });
      </script>
    </body>
    </html>
  `;
}

