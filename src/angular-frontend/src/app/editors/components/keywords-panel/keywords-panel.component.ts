import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { KeywordsGatheringService } from '../../services/keywords-gathering.service';
import { NodesFilteringService } from '../../../core/services/nodes-filtering.service';
import { LastInteractionService } from '../../services/last-interaction.service';
import { Keyword } from '../../../core/models/application-types.model';

/**
 * Lists available Robot Framework Keywords and enables filtering and insertion.
 */
@Component({
  selector: 'app-keywords-panel',
  standalone: true,
  imports: [CommonModule,
    MatListModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './keywords-panel.component.html',
  styleUrl: './keywords-panel.component.css'
})
export class KeywordsPanelComponent implements OnInit {
  /** Defines search mode. */
  public _isDocumentationSearch = new BehaviorSubject<boolean>(false);

  /** Emits search mode changes. */
  public isDocumentationSearch$ = this._isDocumentationSearch.asObservable();

  /** Captures user's search. */
  public readonly formControl = new FormControl('');

  /** Emits displayed keywords changes. */
  public displayedKeywords$!: Observable<Keyword[]>;

  /**
   * Creates a KeywordPanelComponent instance.
   * 
   * @param _keywordsGatheringService - Gathers keywords from imported resources and libraries.
   * @param _nodesFilteringService - Filters lists.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   */
  constructor(
    private _keywordsGatheringService: KeywordsGatheringService,
    private _nodesFilteringService: NodesFilteringService,
    private _lastInteractionService: LastInteractionService
  ) {}

  /**
   * Combines gathered keywords, search mode and user's
   * search to provide a list of keywords to display.
   */
  public ngOnInit(): void {
    this.displayedKeywords$ = combineLatest([
      this._keywordsGatheringService.gatheredKeywords$,
      this._isDocumentationSearch,
      this.formControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([gatheredKeywords, isDocumentationSearch, search]) => {
        const filter = (keyword: Keyword) =>
          isDocumentationSearch
            ? keyword.documentation.toLowerCase().includes((search ?? '').toLowerCase())
            : keyword.name.toLowerCase().includes((search ?? '').toLowerCase())
        return this._nodesFilteringService.filterList<Keyword>(gatheredKeywords, filter)
      })
    );
  }

  /**
   * Switches between name and documentation search mode.
   */
  public changeSearchMode(): void {
    this._isDocumentationSearch.next(!this._isDocumentationSearch.value);
  }

  /**
   * Inserts keyword in the editor.
   * 
   * @param keyword - Keyword to insert.
   */
  public insertKeyword(keyword: Keyword): void {
    this._lastInteractionService.insertTextInLastInteractedEditor(
      [keyword.name, ...keyword.arguments].join('    ')
    );
  }
}
