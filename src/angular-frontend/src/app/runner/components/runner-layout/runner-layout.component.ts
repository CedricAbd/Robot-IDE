import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
    FormsModule,
    MatSelectModule,
    MatButtonModule,
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

  /** Captures user's search. */
  public readonly formControl = new FormControl<string>('');

  /** Stores platforms that can be targeted. */
  public platforms: string[] = ["platform1", "platform2"];

  /** Stores sites that can be targeted. */
  public sites: number[] = [1, 2];

  /** Stores all executable tests retrieved from the backend. */
  private _allTests: ExecutableTest[] = [];

  /** Indicates if tests are being reloaded. */
  public isLoading: boolean = true;

  /** Indicates if tests are running. */
  public isRunning: boolean = false;

  /** Indicates if previous execution succeeded. */
  public lastRunResult: boolean | null = null;

  /** Represents tests displayed after filtering. */
  public displayedTests: ExecutableTest[] = [];

  /** Represents the platform selected by the user. */
  public selectedPlatform: string | null = null;

  /** Represents the site selected by the user. */
  public selectedSite: number | null = null;

  /** Represents tests selected by the user. */
  public selectedTests: ExecutableTest[] = [];

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
   * tests by name.
   */
  public ngOnInit(): void {
    const mainSub = combineLatest([
      this._gitlabStateService.isAuthenticated$,
      this._gitlabStateService.projectPath$,
    ]).subscribe(([isAuthenticated, projectPath]) => {
      if (isAuthenticated && projectPath) {
        const filterTests = (search: string | null) => {
          const query = (search ?? '').toLowerCase();
          if (!query) {
            this.displayedTests = [...this._allTests];
            return;
          }
          this.displayedTests = this._nodesFilteringService.filterList(
            this._allTests,
            test => test.name.toLowerCase().includes(query)
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
   * Gets project path from _gitlabStateService.
   * 
   * @returns Project path as a string.
   */
  get projectPath(): string {
    return this._gitlabStateService.projectPath;
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
    this.selectedTests = list.selectedOptions.selected.map((option: any) => option.value);
  }

  /**
   * Synchronizes _selectedTests on selection changes.
   * 
   * @param selected - Selected options from the list.
   */
  public onSelectionChange(selected: any[]): void {
    this.selectedTests = selected.map(option => option.value);
  }

  /**
   * Runs selected tests in a GitLab pipeline. 
   */
  public async runTests(): Promise<void> {
    this.isRunning = true;
    this.lastRunResult = null;
    const testsPaths = this.selectedTests.map(test => test.path);
    const value = await this._backendInteractionService.runTests(
      this.selectedPlatform!,
      this.selectedSite!,
      testsPaths
    )
    this.lastRunResult = value ? true : false
    this.isRunning = false;
  }

  /**
   * Disposes all subscriptions to avoid memory leaks.
   */
  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
