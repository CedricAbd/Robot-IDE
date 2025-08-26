import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackendInteractionService } from '../../../core/services/backend-interaction.service';
import { NodesFilteringService } from '../../../core/services/nodes-filtering.service';
import { FilesManagementService } from '../../services/files-management.service';
import { RobotFile } from '../../models/robot-file.class';

/**
 * Displays .robot and .resources files from other GitLab projects.
 */
@Component({
  selector: 'app-resources-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './resources-panel.component.html',
  styleUrl: './resources-panel.component.css'
})
export class ResourcesPanelComponent {
  /** Stores projects that can be scanned. */
  public projectsToScan: string[] = [
    'test_group/dummy_project',
    'test_group/another_project'
  ]

  /** Indicates if the search is in progress. */
  public isSearching: boolean = false;

  /** Stores projects selected for searching. */
  public selectedProjects: string[] = [];

  /** Stores user's filter input. */
  public filterText: string = '';

  /** Stores search results. */
  public searchResults: any[] = [];

  /* Stores filtered and displayed results. */
  public displayedResults: any[] = [];

  /**
   * Creates a ResourcesPanelComponent instance.
   * 
   * @param _backendInteractionService - Handles backend interactions.
   * @param _nodesFilteringService - Filters lists.
   * @param _changeDetectorRef - Enables HTML template update.
   * @param _filesManagementService - Manages files in the application.
   */
  constructor(
    private _backendInteractionService: BackendInteractionService,
    private _nodesFilteringService: NodesFilteringService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _filesManagementService: FilesManagementService
  ) {}

  /**
   * Filters found Robot Framework files based on user's filtering.
   */
  public filterResults(): void {
    const text = this.filterText.trim().toLowerCase();
    this.displayedResults = this._nodesFilteringService.filterList(
      this.searchResults,
      f => (f.path.split('/').pop() || '').toLowerCase().includes(text)
    );
  }

  /**
   * Searches for .robot and .resource files in a predefined list of projects.
   */
  public async searchForRobotFiles(): Promise<void> {
    this.searchResults = [];
    this.displayedResults = [];
    this.isSearching = true;
    const response = await this._backendInteractionService.getRepositoryRobotFiles(this.selectedProjects);
    for (const [project, branches] of Object.entries(response.data || {})) {
      for (const [branch, fileList] of Object.entries(branches || {})) {
        for (const file of (fileList as any[]) || []) {
          this.searchResults.push({
            path: file.path,
            projectPath: file.project_path,
            project,
            branch
          });
        }
      }
    }
    this.filterResults();
    this.isSearching = false;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Opens a file in the application when a double click is made by the user.
   * 
   * @param file - File to open in the application.
   */
  public async openFile(
    file: {path: string, projectPath: string, branch: string}
  ): Promise<void> {
    const content = await this._backendInteractionService.getFileContentFrom(
      file.projectPath,
      file.branch,
      file.path
    );
    this._filesManagementService.open(
      new RobotFile(
        Date.now(),
        file.path.split('/').pop() || file.path,
        content
      )
    )
  }
}
