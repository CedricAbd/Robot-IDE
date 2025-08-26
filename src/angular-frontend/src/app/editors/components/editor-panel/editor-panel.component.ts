import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilesManagementService } from '../../services/files-management.service';
import { EditorsStateService } from '../../services/editors-state.service';
import { LastInteractionService } from '../../services/last-interaction.service';
import { BackendInteractionService } from '../../../core/services/backend-interaction.service';
import { EditorPanelIndex, Disposable } from '../../../core/models/application-types.model';
import { editor, MarkerSeverity } from 'monaco-editor';
import { Observable, Subscription } from 'rxjs';
import { RobotFile } from '../../models/robot-file.class';

/**
 * Renders an editor panel with its file tabs and its Monaco editor instance.
 */
@Component({
  selector: 'app-editor-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './editor-panel.component.html',
  styleUrl: './editor-panel.component.css'
})
export class EditorPanelComponent implements AfterViewInit, OnDestroy {
  /** The index of the panel editor. This input is mandatory. */
  @Input() editorIndex!: EditorPanelIndex

  /** The reference to the Monaco editor container. */
  @ViewChild('editorContainer') private editorContainer!: ElementRef<HTMLDivElement>;

  /** The Monaco editor instance. */
  private _editor!: editor.IStandaloneCodeEditor;

  /** An observable stream emitting _openFiles changes. */
  public readonly openFiles$: Observable<RobotFile[]>;

  /** A `Subscription` to handle selected files changes. */
  private _selectedFileSubscription!: Subscription;

  /** A disposable. */
  private _onFocus!: Disposable;

  /** Used for linting delay. */
  private _lintTimer: any;

  /** Indicates changes. */
  private _contentChangeListener: any;

  /**
   * Creates a new EditorPanelComponent instance.
   * 
   * On instantiation the component gets and exposes
   * openFiles$, the _openFiles Observable
   * 
   * @param _filesManagementService - Handles files in the application.
   * @param _editorsStateService - Handles editors state.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   * @param _backendInteractionService - Handles backend interactions.
   */
  constructor(
    private _filesManagementService: FilesManagementService,
    private _editorsStateService: EditorsStateService,
    private _lastInteractionService: LastInteractionService,
    private _backendInteractionService: BackendInteractionService
  ) {
    this.openFiles$ = this._filesManagementService.openFiles$;
  }

  /**
   * Creates the the monaco editor instance and subscribes to the
   * selectedFile$ Observable to handle changes.
   */
  public ngAfterViewInit(): void {
    this._editor = editor.create(this.editorContainer.nativeElement, {
      language: 'robot-framework',
      automaticLayout: true
    });
    this._selectedFileSubscription = this._editorsStateService.getSelectedFileObservable(this.editorIndex)
      .subscribe(selectedFile => {
        if (selectedFile) {
          this._editor.setModel(selectedFile.model);
          this._setupLinting(selectedFile);
          if (this._lastInteractionService.lastInteractedEditor !== this._editor)
            this._lastInteractionService.setAsLastInteracted(this._editor)
        }
      }
    );
    this._onFocus = this._editor.onDidFocusEditorText(() => {
      this._lastInteractionService.setAsLastInteracted(this._editor)
    });
    if (this.editorIndex === 0 && !this._lastInteractionService.lastInteractedEditor)
      this._lastInteractionService.setAsLastInteracted(this._editor);
  }

  /**
   * Changes selected file for this editor.
   * 
   * @param index - Index of the file to select in the _openFiles reactive array.
   */
  public selectTab(index: number): void {
    this._editorsStateService.setSelectedFile(this.editorIndex, this._filesManagementService.openFiles[index])
  }

  /**
   * Closes a file in FilesManagementService using its index.
   * 
   * @param index - Index of the file to close in the _openFiles reactive array.
   */
  public close(index: number): void {
    const fileToClose = this._filesManagementService.openFiles[index];
    this._editorsStateService.deselectClosedFile(fileToClose, this._filesManagementService.openFiles)
    this._filesManagementService.close(fileToClose);
    if (!this._filesManagementService.openFiles.length) this._editorsStateService.editorsCount = 1;
  }

  /**
   * Starts linting.
   * 
   * Performs an initial check then waits a little bit after typing to check.
   * 
   * @param file - File to lint.
   */
  private _setupLinting(file: RobotFile): void {
    this._contentChangeListener?.dispose?.();
    this._runLint(file);
    this._contentChangeListener = file.model.onDidChangeContent(() => {
      clearTimeout(this._lintTimer);
      this._lintTimer = setTimeout(() => this._runLint(file), 400);
    });
  }

  /**
   * Runs lint and updates model markers.
   * 
   * @param file - File to lint.
   */
  private async _runLint(file: RobotFile): Promise<void> {
    const message = await this._backendInteractionService.checkContent(
      file.name,
      file.model.getValue()
    )
    const markers = (message || []).map((m) => ({
      message: m.message_description,
      severity: this._mapSeverity(m.message_severity),
      startLineNumber: m.line_number || 1,
      startColumn: m.column_number || 1,
      endLineNumber: m.line_number || 1,
      endColumn: file.model.getLineMaxColumn(m.line_number),
    }));
    editor.setModelMarkers(file.model, 'robocop', markers);
  }

  /**
   * Maps message severity with MarkerSeverity levels.
   * 
   * @param severity - Message severity.
   * @returns Matching MarkerSeverity.
   */
  private _mapSeverity(severity: string): MarkerSeverity {
    return severity === 'E' ? MarkerSeverity.Error
          : severity === 'W' ? MarkerSeverity.Warning
          : severity === 'I' ? MarkerSeverity.Info
          : MarkerSeverity.Hint;
  }

  /**
   * Unsubscribes from the observable and disposes the editor on component termination.
   */
  public ngOnDestroy(): void {
    this._selectedFileSubscription.unsubscribe();
    this._contentChangeListener?.dispose?.();
    clearTimeout(this._lintTimer);
    this._onFocus?.dispose();
    this._editor.dispose();
  }
}
