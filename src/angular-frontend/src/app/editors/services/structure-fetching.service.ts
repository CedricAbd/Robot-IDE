import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectStructure } from '../../core/models/application-types.model';
import { GitlabStateService } from '../../core/services/gitlab-state.service';
import { BackendInteractionService } from '../../core/services/backend-interaction.service';

/**
 * Gathers currently selected project structure.
 * 
 * This service subscribes to isAuthenticated$ to trigger
 * periodic structure fetching when authenticated.
 */
@Injectable({ providedIn: 'root' })
export class StructureFetchingService {
  /** Stores timeout. */
  private _timeout?: ReturnType<typeof setInterval>;

  /** Stores fetched structure. */
  private readonly _fetchedStructure = new BehaviorSubject<ProjectStructure>([]);

  /**
   * Creates the StructureFetchingService instance.
   * 
   * @param _gitlabStateService - Stores GitLab state.
   * @param _backendInteractionService - Handles backend interactions.
   */
  constructor(
    private _gitlabStateService: GitlabStateService,
    private _backendInteractionService: BackendInteractionService
  ) {
    this._gitlabStateService.isAuthenticated$.subscribe(isAuthenticated =>
      this.startOrStopPeriodicFetching(isAuthenticated ? 5000 : null)
    );
  }

  /**
   * Gets the current value of the _fetchedStructure reactive ProjectStructure.
   * 
   * @returns Current value of _fetchedStructure.
   */
  public get fetchedStructure(): ProjectStructure {
    return this._fetchedStructure.value;
  }

  /**
   * Gets an observable stream of the _fetchedStructure reactive ProjectStructure.
   * 
   * @returns Observable emitting _fetchedStructure changes.
   */
  public get fetchedStructure$(): Observable<ProjectStructure> {
    return this._fetchedStructure.asObservable();  
  }

  /**
   * Fetches GitLab project's structure.
   */
  public fetchStructure(): void {
    this._backendInteractionService.getProjectStructure().then(fetchedStructure => this._fetchedStructure.next(fetchedStructure));
  }

  /**
   * Starts or stops periodic fetching depending on the argument.
   * 
   * @param interval - Argument defining the action.
   */
  private async startOrStopPeriodicFetching(interval: 5000 | null): Promise<void> {
    if (this._timeout) clearInterval(this._timeout);
    if (!interval) return;
    this._gitlabStateService.lastCommitId = await this._backendInteractionService.getLastCommitId();
    this.fetchStructure();
    this._timeout = setInterval(async () => {
      const newLastCommitId = await this._backendInteractionService.getLastCommitId();
      if (newLastCommitId !== this._gitlabStateService.lastCommitId) {
        await this.fetchStructure();
        this._gitlabStateService.lastCommitId = newLastCommitId
      }
    }, interval);
  }
}