import * as vscode from "vscode";

export class DiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("perchance-pjs");
  }

  public register(context: vscode.ExtensionContext) {
    context.subscriptions.push(this.diagnosticCollection);

    if (vscode.window.activeTextEditor) {
      this.updateDiagnostics(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === "perchance-pjs") {
          this.updateDiagnostics(editor.document);
        }
      }),
    );

    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.languageId === "perchance-pjs") {
          this.updateDiagnostics(e.document);
        }
      }),
    );
  }

  private updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "perchance-pjs") {
      return;
    }

    const config = vscode.workspace.getConfiguration("perchancePjs");
    if (!config.get<boolean>("enableDiagnostics", true)) {
      this.diagnosticCollection.clear();
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    // Example: detect lines with "=" but no items after
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text.trim();

      if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*$/.test(text)) {
        const diagnostic = new vscode.Diagnostic(
          line.range,
          "List defined with no items.",
          vscode.DiagnosticSeverity.Warning,
        );
        diagnostics.push(diagnostic);
      }
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }
}
