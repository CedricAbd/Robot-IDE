import { Injectable } from '@angular/core';
import { BehaviorSubject, switchMap, EMPTY, Observable } from 'rxjs';
import { Keyword } from '../../core/models/application-types.model';
import { GitlabStateService } from '../../core/services/gitlab-state.service';
import { FileParsingService } from './file-parsing.service';
import { BackendInteractionService } from '../../core/services/backend-interaction.service';

/**
 * Gathers Robot Framework keywords from imported resources and libraries.
 * 
 * This service subscribes to isAuthenticated$ to trigger
 * keywords gathering. Updates are made on resource and library
 * imports changes.
 */
@Injectable({ providedIn: 'root' })
export class KeywordsGatheringService {
  /** Stores gathered keywords. */
  private readonly _gatheredKeywords = new BehaviorSubject<Keyword[]>([]);

  /** Stores previous signatures. */
  private _previousSignatures = { resources: '', libraries: '' }

  /**
   * Creates the KeywordsGatheringService instance.
   * 
   * @param _gitlabStateService - Stores GitLab state.
   * @param _fileParsingService - Parses Robot Framework files.
   * @param _backendInteractionService - Handles backend interactions.
   */
  constructor(
    private _gitlabStateService: GitlabStateService,
    private _fileParsingService: FileParsingService,
    private _backendInteractionService: BackendInteractionService,
  ) {
    this._gitlabStateService.isAuthenticated$
      .pipe(
        switchMap(isAuthenticated => isAuthenticated ? this._fileParsingService.parsingResults$ : EMPTY)
      )
      .subscribe(async parsingResults => {
      const resourcesSignature = JSON.stringify(parsingResults.imported_resources);
      const librariesSignature = JSON.stringify(parsingResults.imported_libraries);
      if (
        resourcesSignature !== this._previousSignatures.resources ||
        librariesSignature !== this._previousSignatures.libraries
      ) {
        this._previousSignatures = { resources: resourcesSignature, libraries: librariesSignature };
        this._gatheredKeywords.next(
          await this._backendInteractionService.gatherKeywords(
            parsingResults.imported_resources,
            parsingResults.imported_libraries
          )
        );
      }
    });
  }

  /**
   * Gets an observable stream of the _gatheredKeywords reactive array.
   * 
   * @returns Observable emitting _gatheredKeywords changes.
   */
  public get gatheredKeywords$(): Observable<Keyword[]> {
    return this._gatheredKeywords.asObservable();
  }
}