import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FilesManagementService } from '../../../editors/services/files-management.service';
import { GitlabStateService } from '../../services/gitlab-state.service';
import { BackendInteractionService } from '../../services/backend-interaction.service';
import { EditorsStateService } from '../../../editors/services/editors-state.service';
import { InterfaceStateService } from '../../services/interface-state.service';
import { LastInteractionService } from '../../../editors/services/last-interaction.service';
import { TemplatesManagementService } from '../../../editors/services/templates-management.service';
import { StructureFetchingService } from '../../../editors/services/structure-fetching.service';
import { Observable } from 'rxjs';
import { RobotFile } from '../../../editors/models/robot-file.class';

/**
 * Provides a component that represents the application menubar.
 * 
 * On Runner selection, button is highlighted with color and
 * unavailable buttons are greyed out.
 */
@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.css'
})
export class MenubarComponent {
  /** An Observable emitting _openFiles changes. */
  public openFiles$: Observable<RobotFile[]>

  /** A list of strings to store branch names list. */
  public branchesList: string[] = [];

  /**
   * Creates a MenubarComponent instance.
   * 
   * @param _router - Angular router.
   * @param _filesManagementService - Manages files in the application.
   * @param _gitlabStateService - Stores GitLab state.
   * @param _backendInteractionService - Handles backend interactions.
   * @param _editorsStateService - Handles editors state.
   * @param _interfaceStateService - Handles interface state.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   * @param _templatesManagementService - Enables text templates insertion.
   * @param _structureFetchingService - Periodically fetches current project structure.
   */
  constructor(
    private _router: Router,
    private _filesManagementService: FilesManagementService,
    private _gitlabStateService: GitlabStateService,
    private _backendInteractionService: BackendInteractionService,
    private _editorsStateService: EditorsStateService,
    private _interfaceStateService: InterfaceStateService,
    private _lastInteractionService: LastInteractionService,
    private _templatesManagementService: TemplatesManagementService,
    private _structureFetchingService: StructureFetchingService
  ) {
    this.openFiles$ = this._filesManagementService.openFiles$
    this._gitlabStateService.isAuthenticated$.subscribe(async isAuthenticated => {
      if (isAuthenticated) {
        this.branchesList = await this._backendInteractionService.getBranchesList();
        setInterval(async () => this.branchesList = await this._backendInteractionService.getBranchesList(), 5000);
      }
    })
  }

  /**
   * Gets the router property.
   * 
   * @returns The router instance. 
   */
  public get router(): Router {
    return this._router;
  }

  /**
   * Gets the editorsCount$ Observable from _editorsStateService.
   * 
   * @returns An Observable emitting 1,2,3 or 4.
   */
  public get editorsCount$(): Observable<1|2|3|4> {
    return this._editorsStateService.editorsCount$;
  }

  /**
   * Gets the isSidebarOpen$ Observable from _editorsStateService.
   * 
   * @returns An Observable emitting the boolean changes.
   */
  public get isSidebarOpen$(): Observable<boolean> {
    return this._editorsStateService.isSidebarOpen$;
  }

  /**
   * Gets the isLight$ Observable from _interfaceStateService.
   * 
   * @returns An Observable emitting the boolean changes.
   */
  public get isThemeLight$(): Observable<boolean> {
    return this._interfaceStateService.isThemeLight$;
  }

  /**
   * Calls _editorsStateService service to invert _isSidebarOpen value.
   */
  public toggleSidebar(): void {
    this._editorsStateService.isSidebarOpen = !this._editorsStateService.isSidebarOpen;
  }

  /**
   * Calls _editorsStateService to increment _editorsCount value.
   */
  public toggleSplit(): void {
    this._editorsStateService.incrementEditorsCount();
  }

  /**
   * Calls _interfaceStateService service to invert _isLight value.
   */
  public switchTheme(): void {
    this._interfaceStateService.isThemeLight = !this._interfaceStateService.isThemeLight;
  }

  /**
   * Calls _filesManagementService to trigger the creation of a new blank file.
   */
  public newFile(): void {
    this._filesManagementService.openNewFile();
  }

  /**
   * Calls _filesManagementService to open a file from the local system.
   */
  public openLocalFile(): void {
    this._filesManagementService.openLocalFile();
  }

  /**
   * Calls _filesManagementService to open a file from GitLab.
   */
  public openGitlabFile(): void {
    this._filesManagementService.openGitlabFile();
  }

  /**
   * Calls _lastInteractionService to save last interacted file on the local system.
   */
  public saveLocalFile(): void {
    this._lastInteractionService.saveLastInteractedFile();
  }

  /**
   * Calls _lastInteractionService to save last interacted file on GitLab.
   */
  public saveFileOnGitlab(): void {
    this._lastInteractionService.pushLastInteractedFile();
  }

  /**
   * Calls _templatesManagementService to add a template to user's templates.
   */
  public async saveSelectionAsTemplate(): Promise<void> {
    await this._templatesManagementService.addTemplate()
  }

  /**
   * Calls _lastInteractionService to undo actions on the last interacted editor.
   */
  public undo(): void {
    this._lastInteractionService.undo();
  }

  /**
   * Calls _lastInteractionService to redo actions on the last interacted editor.
   */
  public redo(): void {
    this._lastInteractionService.redo();
  }

  /**
   * Calls _lastInteractionService to find text patterns on the last interacted editor.
   */
  public find(): void {
    this._lastInteractionService.find();
  }

  /**
   * Calls _lastInteractionService to replace text patterns on the last interacted editor.
   */
  public replace(): void {
    this._lastInteractionService.replace();
  }

  /**
   * Changes the selected branch and refetches the project structure.
   * 
   * @param branchName - Selected branch.
   */
  public selectBranch(branchName: string): void {
    this._gitlabStateService.branchName = branchName;
    this._structureFetchingService.fetchStructure();
  }
}