import * as vscode from "vscode";
import { CompletionProvider } from "./features/completionProvider";
import { DiagnosticsProvider } from "./features/diagnosticsProvider";

export function activate(context: vscode.ExtensionContext) {
  const selector: vscode.DocumentSelector = { language: "perchance-pjs" };

  const completionProvider = new CompletionProvider();
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      completionProvider,
      "=",
      ":",
      "{",
      "[",
      "(",
      '"',
      "'",
      "<",
    ),
  );

  const diagnosticsProvider = new DiagnosticsProvider();
  diagnosticsProvider.register(context);
}

export function deactivate() {}
