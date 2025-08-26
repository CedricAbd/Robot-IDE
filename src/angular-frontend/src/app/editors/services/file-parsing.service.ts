import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, debounceTime, Observable } from 'rxjs';
import { ParsingResults } from '../../core/models/application-types.model';
import { EMPTY_PARSING_RESULTS } from '../../core/models/application-consts.model';
import { LastInteractionService } from './last-interaction.service';
import { BackendInteractionService } from '../../core/services/backend-interaction.service';

/**
 * Parses last interacted Robot Framework file.
 * 
 * This service subscribes to lastInteractedFile$ to trigger
 * parsing on content changes.
 */
@Injectable({ providedIn: 'root' })
export class FileParsingService {
  /** Stores parsing results. */
  private readonly _parsingResults = new BehaviorSubject<ParsingResults>(EMPTY_PARSING_RESULTS);

  /** Listens to content changes. */
  private _onContentChangedSubscription = new Subscription();

  /**
   * Creates the FileParsingService instance.
   * 
   * @param _lastInteractionService - Tracks last interacted editor and file.
   * @param _backendInteractionService - Handles backend interactions.
   */
  constructor(
    private _lastInteractionService: LastInteractionService,
    private _backendInteractionService: BackendInteractionService
  ) {
    this._lastInteractionService.lastInteractedFile$.subscribe(async lastInteractedFile => {
      this._onContentChangedSubscription.unsubscribe();
      if (!lastInteractedFile) {
        this._parsingResults.next(EMPTY_PARSING_RESULTS);
        return;
      }
      this._parsingResults.next(await this._backendInteractionService.parseFile(lastInteractedFile));
      this._onContentChangedSubscription = lastInteractedFile.onContentChanged$
        .pipe(debounceTime(300))
        .subscribe(async () => {
          this._parsingResults.next(await this._backendInteractionService.parseFile(lastInteractedFile));
        });
    });
  }

  /**
   * Gets an observable stream of the _parsingResults reactive ParsingResults.
   * 
   * @returns Observable stream emitting _parsingResults changes.
   */
  public get parsingResults$(): Observable<ParsingResults> {
    return this._parsingResults.asObservable();
  }
}
