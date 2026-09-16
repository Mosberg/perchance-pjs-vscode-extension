import * as vscode from "vscode";

export class CompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    const listSnippet = new vscode.CompletionItem(
      "list",
      vscode.CompletionItemKind.Snippet,
    );
    listSnippet.insertText = new vscode.SnippetString(
      "listName =\n\titem1\n\titem2",
    );
    listSnippet.detail = "Create a new list";
    items.push(listSnippet);

    const outputSnippet = new vscode.CompletionItem(
      "$output",
      vscode.CompletionItemKind.Snippet,
    );
    outputSnippet.insertText = new vscode.SnippetString(
      "$output =\n\tHello, world!",
    );
    outputSnippet.detail = "Create the $output list";
    items.push(outputSnippet);

    const metaImport = new vscode.CompletionItem(
      "meta:import",
      vscode.CompletionItemKind.Keyword,
    );
    metaImport.insertText = new vscode.SnippetString(
      "meta:import ${1:user}/${2:generator}",
    );
    metaImport.detail = "Import another generator";
    items.push(metaImport);

    const emptyList = new vscode.CompletionItem(
      "{|}",
      vscode.CompletionItemKind.Constant,
    );
    emptyList.detail = "Empty list";
    items.push(emptyList);

    const placeholder = new vscode.CompletionItem(
      "<<<placeholder>>>",
      vscode.CompletionItemKind.Constant,
    );
    placeholder.insertText = new vscode.SnippetString("<<<${1:name}>>>");
    placeholder.detail = "Placeholder marker";
    items.push(placeholder);

    return items;
  }
}
