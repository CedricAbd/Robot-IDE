import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { GitlabStateService } from '../../../core/services/gitlab-state.service';
import { BackendInteractionService } from '../../../core/services/backend-interaction.service';
import { NodesFilteringService } from '../../../core/services/nodes-filtering.service';
import { ExecutableTest } from '../../../core/models/application-types.model';

/**
 * Renders an interface to execute Robot Framework tests from GitLab.
 */
@Component({
  selector: 'app-runner-layout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './runner-layout.component.html',
  styleUrl: './runner-layout.component.css'
})
export class RunnerLayoutComponent implements OnInit, OnDestroy {
  /** Aggregates component subscriptions. */
  private _subscriptions = new Subscription();

  /** Indicates if the search filters on tags. */
  public isTagsSearch: boolean = false;

  /** Captures user's search. */
  public readonly formControl = new FormControl<string>('');

  /** Stores all executable tests retrieved from the backend. */
  private _allTests: ExecutableTest[] = [];

  /** Indicates if tests are being reloaded. */
  public isLoading: boolean = true;

  /** Represents tests displayed after filtering. */
  public displayedTests: ExecutableTest[] = [];

  /** Represents tests selected by the user. */
  public _selectedTests: ExecutableTest[] = [];

  /**
   * Creates a RunnerLayoutComponent instance.
   * 
   * @param _gitlabStateService - Stores GitLab state.
   * @param _backendInteractionService - Handles backend interactions.
   * @param _nodesFilteringService - Filters lists.
   */
  constructor(
    private _gitlabStateService: GitlabStateService,
    private _backendInteractionService: BackendInteractionService,
    private _nodesFilteringService: NodesFilteringService
  ) {}

  /**
   * Subscribes to project, authentication status, and search changes.
   * 
   * Loads executable tests on commit changes and refreshes
   * the filtered view. On search changes, refilters displayed
   * tests by tags or by name depending on the boolean value.
   */
  public ngOnInit(): void {
    const mainSub = combineLatest([
      this._gitlabStateService.isAuthenticated$,
      this._gitlabStateService.projectPath$,
    ]).subscribe(([isAuthenticated, projectPath]) => {
      if (isAuthenticated && projectPath) {
        const filterTests = (search: string | null) => {
          const query = (search ?? '').toLowerCase();
          this.displayedTests = this._nodesFilteringService.filterList(
            this._allTests,
            test => this.isTagsSearch
              ? test.tags.some(tag => tag.toLowerCase().includes(query))
              : test.name.toLowerCase().includes(query)
          );
        };
        this._subscriptions.add(
          this._gitlabStateService.lastCommitId$.subscribe(async () => {
            this.isLoading = true;
            try {
              this._allTests = await this._backendInteractionService.getExecutableTests();
              filterTests(this.formControl.value);
            } finally {
              this.isLoading = false;
            }
          })
        );
        this._subscriptions.add(
          this.formControl.valueChanges.pipe(startWith('')).subscribe(filterTests)
        );
      }
    });
    this._subscriptions.add(mainSub);
  }

  /**
   * Toggles selection of all executable tests in the list.
   * 
   * Also updates _selectedTests to reflect UI state.
   * 
   * @param checked - Whether the "Select all" checkbox is checked.
   * @param list - Selection list.
   */
  public toggleSelectAll(checked: boolean, list: any): void {
  checked ? list.selectAll() : list.deselectAll();
  this._selectedTests = list.selectedOptions.selected.map((option: any) => option.value);
  }

  /**
   * Synchronizes _selectedTests on selection changes.
   * 
   * @param selected - Selected options from the list.
   */
  public onSelectionChange(selected: any[]): void {
    this._selectedTests = selected.map(option => option.value);
    console.log(this._selectedTests);
  }

  /**
   * Disposes all subscriptions to avoid memory leaks.
   */
  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
