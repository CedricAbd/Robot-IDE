import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { editor, Range } from 'monaco-editor';
import { FilesManagementService } from './files-management.service';
import { GitlabDialogComponent } from '../../dialogs/components/gitlab-dialog/gitlab-dialog.component';
import { RobotFile } from '../models/robot-file.class';

/**
 * Tracks last interacted editor and file.
 */
@Injectable({ providedIn: 'root' })
export class LastInteractionService {
  /** Stores last interacted editor. */
  private _lastInteractedEditor: editor.ICodeEditor | null = null;

  /** Stores last interacted file. */
  private readonly _lastInteractedFile = new BehaviorSubject<RobotFile | null>(null);

  /**
   * Creates the LastInteractionService instance.
   * 
   * @param _filesManagementService - Manages files in the application.
   * @param _dialog - A dialog to open GitlabDialogComponent.
   */
  constructor(
    private readonly _filesManagementService: FilesManagementService,
    private _dialog: MatDialog
  ) {
    this._filesManagementService.openFiles$.subscribe(openFiles => {
      if (openFiles.length === 0) {
        this._lastInteractedEditor = null;
        this._lastInteractedFile.next(null);
      }
    })
  }

  /**
   * Gets _lastInteractedEditor value.
   * 
   * @returns _lastInteractedEditor value.
   */
  public get lastInteractedEditor(): editor.ICodeEditor | null {
    return this._lastInteractedEditor
  }

  /**
   * Gets an observable stream of the _lastInteractedFile reactive (RobotFile | null).
   * 
   * @returns Observable stream emitting _lastInteractedFile changes.
   */
  public get lastInteractedFile$(): Observable<RobotFile | null> {
    return this._lastInteractedFile.asObservable();
  }

  /**
   * Gets _lastInteractedFile value.
   * 
   * @returns _lastInteractedFile value.
   */
  public get lastInteractedFile(): RobotFile | null {
    return this._lastInteractedFile.value;
  }

  /**
   * Sets a given editor as the last interacted one.
   * 
   * @param editor - Editor to define as the last interacted one.
   */
  public setAsLastInteracted(editor: editor.ICodeEditor): void {
    this._lastInteractedEditor = editor;
    this._lastInteractedFile.next(
      this._filesManagementService.openFiles.find(openFile => openFile.model === editor.getModel()) ?? null
    );
  }

  /**
   * Saves the last interacted file on the local system.
   */
  public saveLastInteractedFile(): void {
    const file = this._lastInteractedFile.getValue();
    if (!file) return ;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([file.content], { type: 'text/plain;charset=utf-8' })
    )
    a.download = file.name
    a.click();
    URL.revokeObjectURL(a.href);
    this._lastInteractedFile.getValue()?.markAsSaved();
  }

  /**
   * Opens a dialog to push the last interacted file to GitLab.
   */
  public pushLastInteractedFile(): void {
    const file = this._lastInteractedFile.getValue();
    if (!file) return ;
    this._dialog.open(GitlabDialogComponent, {
      width: '60%',
      panelClass: 'dialog',
      data: 'save'
    })
  }

  /**
   * Inserts text in the last interacted editor.
   * 
   * @param text - Text to insert.
   */
  public insertTextInLastInteractedEditor(text: string): void {
    if (!this._lastInteractedEditor) return;
    const position = this._lastInteractedEditor.getPosition();
    if (!position) return;
    this._lastInteractedEditor.executeEdits(
      'insertTextInLastInteractedFile',
      [{
        range: new Range(
          position?.lineNumber,
          position?.column,
          position?.lineNumber,
          position?.column
        ),
        text,
        forceMoveMarkers: true
      }]
    );
  }

  /**
   * Undo actions in the last interacted editor.
   */
  public undo(): void {
    if (!this._lastInteractedEditor) return;
    this._lastInteractedEditor.trigger('keyboard', 'undo', null);
  }

  /**
   * Redo actions in the last interacted editor.
   */
  public redo(): void {
    if (!this._lastInteractedEditor) return;
    this._lastInteractedEditor.trigger('keyboard', 'redo', null);
  }

  /**
   * Enables searching for a text pattern in the last interacted editor.
   */
  public find(): void {
    if (!this._lastInteractedEditor) return;
    this._lastInteractedEditor.getAction('actions.find')?.run();
  }

  /**
   * Enables replacing a text pattern in the last interacted editor.
   */
  public replace(): void {
    if (!this._lastInteractedEditor) return;
    this._lastInteractedEditor.getAction('editor.action.startFindReplaceAction')?.run();
  }
}
