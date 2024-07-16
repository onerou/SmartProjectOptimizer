import * as vscode from "vscode";
import { activateExtension } from "./extension";

export function activate(context: vscode.ExtensionContext) {
  activateExtension(context);
}

export function deactivate() {}
