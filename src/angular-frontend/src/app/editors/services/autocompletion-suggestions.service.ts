import { Injectable } from '@angular/core';
import { Keyword } from '../../core/models/application-types.model';
import { StructureFetchingService } from './structure-fetching.service';
import { KeywordsGatheringService } from './keywords-gathering.service';
import { languages, editor, Position } from 'monaco-editor';

/**
 * Provides dynamic autocompletion for Robot Framework.
 * 
 * This service subscribes to `gatheredKeywords$` to update cached keywords
 * on changes. It registers a provider that produces cached keywords
 * suggestions on user's input in the editor.
 */
@Injectable({ providedIn: 'root' })
export class AutocompletionSuggestionsService {
  /** Caches currently provided paths. */
  private _cachedPaths: string[] = [];

  /** Caches currently provided keywords. */
  private _cachedKeywords: Keyword[] = [];

  /**
   * Creates the AutocompletionSuggestionsService instance. 
   * 
   * @param _structureFetchingService - Periodically fetches the GitLab project structure.
   * @param _keywordsGatheringService - Gathers keywords from imported resources and libraries.
   */
  constructor(
    private _structureFetchingService: StructureFetchingService,
    private _keywordsGatheringService: KeywordsGatheringService
  ) {
    this._structureFetchingService.fetchedStructure$.subscribe(fetchedStructure =>
      this._cachedPaths = fetchedStructure.map(node => node.path)
    );
    this._keywordsGatheringService.gatheredKeywords$.subscribe(gatheredKeywords =>
      this._cachedKeywords = gatheredKeywords
    );
    languages.registerCompletionItemProvider('robot-framework', {
      provideCompletionItems: (model, position) => this.getSuggestionsFromCache(model, position)
    });
  }

  /**
   * Provides suggestions based on cached keywords.
   * 
   * @param model - Monaco editor model.
   * @param position - Cursor position.
   * @returns Suggestions as a list of keyword items.
   */
  private getSuggestionsFromCache(model: editor.ITextModel, position: Position): languages.CompletionList {
    const { word, startColumn, endColumn } = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn,
      endColumn
    };
    const pathItems: languages.CompletionItem[] = this._cachedPaths
      .filter(path => path.startsWith(word))
      .map(path => ({
        kind: languages.CompletionItemKind.File,
        label: path,
        insertText: path,
        range
      }));
    const keywordItems: languages.CompletionItem[] = this._cachedKeywords
      .filter(keyword => keyword.name.startsWith(word))
      .map<languages.CompletionItem>(keyword => ({
        kind: languages.CompletionItemKind.Function,
        label: keyword.name,
        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
        insertText: `${keyword.name}    ${
          keyword.arguments
          .map((arg, index) => `\${${index + 1}:${arg}}`)
          .join('   ')
        }`,
        detail: keyword.documentation,
        range: range
      }));
    return { suggestions: [...pathItems, ...keywordItems] };
  }
}
