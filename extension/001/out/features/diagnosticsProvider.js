"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsProvider = void 0;
const vscode = __importStar(require("vscode"));
class DiagnosticsProvider {
    constructor() {
        this.diagnosticCollection =
            vscode.languages.createDiagnosticCollection("perchance-pjs");
    }
    register(context) {
        context.subscriptions.push(this.diagnosticCollection);
        if (vscode.window.activeTextEditor) {
            this.updateDiagnostics(vscode.window.activeTextEditor.document);
        }
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && editor.document.languageId === "perchance-pjs") {
                this.updateDiagnostics(editor.document);
            }
        }));
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.languageId === "perchance-pjs") {
                this.updateDiagnostics(e.document);
            }
        }));
    }
    updateDiagnostics(document) {
        if (document.languageId !== "perchance-pjs") {
            return;
        }
        const config = vscode.workspace.getConfiguration("perchancePjs");
        if (!config.get("enableDiagnostics", true)) {
            this.diagnosticCollection.clear();
            return;
        }
        const diagnostics = [];
        // Example: detect lines with "=" but no items after
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text.trim();
            if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*$/.test(text)) {
                const diagnostic = new vscode.Diagnostic(line.range, "List defined with no items.", vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
        }
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
}
exports.DiagnosticsProvider = DiagnosticsProvider;
//# sourceMappingURL=diagnosticsProvider.js.map