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
exports.CompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
class CompletionProvider {
    provideCompletionItems(document, position) {
        const items = [];
        const listSnippet = new vscode.CompletionItem("list", vscode.CompletionItemKind.Snippet);
        listSnippet.insertText = new vscode.SnippetString("listName =\n\titem1\n\titem2");
        listSnippet.detail = "Create a new list";
        items.push(listSnippet);
        const outputSnippet = new vscode.CompletionItem("$output", vscode.CompletionItemKind.Snippet);
        outputSnippet.insertText = new vscode.SnippetString("$output =\n\tHello, world!");
        outputSnippet.detail = "Create the $output list";
        items.push(outputSnippet);
        const metaImport = new vscode.CompletionItem("meta:import", vscode.CompletionItemKind.Keyword);
        metaImport.insertText = new vscode.SnippetString("meta:import ${1:user}/${2:generator}");
        metaImport.detail = "Import another generator";
        items.push(metaImport);
        const emptyList = new vscode.CompletionItem("{|}", vscode.CompletionItemKind.Constant);
        emptyList.detail = "Empty list";
        items.push(emptyList);
        const placeholder = new vscode.CompletionItem("<<<placeholder>>>", vscode.CompletionItemKind.Constant);
        placeholder.insertText = new vscode.SnippetString("<<<${1:name}>>>");
        placeholder.detail = "Placeholder marker";
        items.push(placeholder);
        return items;
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map