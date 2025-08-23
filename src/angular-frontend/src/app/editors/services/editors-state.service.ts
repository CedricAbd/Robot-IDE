import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EditorPanelCount, EditorPanelIndex } from '../../core/models/application-types.model';
import { RobotFile } from '../models/robot-file.class';

/**
 * Handles editors state.
 * 
 * This service provides getters and a setter for the sidebar
 * state boolean and methods to get, select and deselect files in
 * each editor panel.
 */
@Injectable({ providedIn: 'root' })
export class EditorsStateService {
  /** A reactive boolean to define the sidebar state. */
  private readonly _isSidebarOpen = new BehaviorSubject<boolean>(false);

  /** A reactive number to define the quantity of displayed editor panels. */
  private readonly _editorsCount = new BehaviorSubject<EditorPanelCount>(1);

  /** A reactive array to store selected files for each editor panel. */
  private readonly _selectedFiles = Array.from({ length: 4 }, () => new BehaviorSubject<RobotFile | null>(null));

  /**
   * Gets an observable stream of the _isSidebarOpen reactive boolean.
   * 
   * @returns An observable stream emitting _isSidebarOpen changes.
   */
  public get isSidebarOpen$(): Observable<boolean> {
    return this._isSidebarOpen.asObservable();
  }

  /**
   * Gets the current value of the _isSidebarOpen reactive boolean.
   * 
   * @returns The current value of _isSidebarOpen.
   */
  public get isSidebarOpen(): boolean {
    return this._isSidebarOpen.value;
  }

  /**
   * Sets the value of the _isSidebarOpen reactive boolean.
   * 
   * @param newValue - New value to set.
   */
  public set isSidebarOpen(newValue: boolean) {
    this._isSidebarOpen.next(newValue);
  }

  /**
   * Gets an observable stream of the _editorsCount reactive number.
   * 
   * @returns An observable stream emitting _editorsCount changes.
   */
  public get editorsCount$(): Observable<EditorPanelCount> {
    return this._editorsCount.asObservable();
  }

  /**
   * Sets the current value of the _editorsCount reactive number.
   * 
   * @param newEditorsCount - New count to set.
   */
  public set editorsCount(newEditorsCount: EditorPanelCount) {
    this._editorsCount.next(newEditorsCount)
  }

  /**
   * Increments _editorsCount value and wraps back to 1 after reaching 4.
   */
  public incrementEditorsCount(): void {
    this._editorsCount.next(this._editorsCount.value % 4 + 1 as EditorPanelCount);
  }

  /**
   * Gets an observable stream of a selected file for a given editor panel from the _selectedFiles reactive array.
   * 
   * @param editorPanelIndex - Editor panel index (0, 1, 2 or 3).
   * @returns An observable stream emitting _selectedFiles changes.
   */
  public getSelectedFileObservable(editorPanelIndex: EditorPanelIndex): Observable<RobotFile | null> {
    return this._selectedFiles[editorPanelIndex].asObservable();
  }

  /**
   * Sets the selected file for a given editor panel in the _selectedFiles reactive array.
   * 
   * @param editorPanelIndex - Editor panel index (0, 1, 2 or 3).
   * @param file - File to select, or null.
   */
  public setSelectedFile(editorPanelIndex: EditorPanelIndex, file: RobotFile | null): void {
    this._selectedFiles[editorPanelIndex].next(file);
  }

  /**
   * Deselects the given file from all editor panels where it is currently selected.
   * 
   * @param closedFile - File that will be closed.
   * @param openFiles - Full array of open files prior to deletion.
   */
  public deselectClosedFile(closedFile: RobotFile, openFiles: RobotFile[]): void {
    const closedFileIndex = openFiles.findIndex(openFile => openFile.uid === closedFile.uid)
    if (closedFileIndex === -1) return;
    const remainingFiles = openFiles.filter(openFile => openFile.uid !== closedFile.uid);
    for (const selectedFile of this._selectedFiles) {
      if (selectedFile.value?.uid === closedFile.uid) selectedFile.next(
        remainingFiles[closedFileIndex - 1] ?? remainingFiles [closedFileIndex] ?? null
      )
    }
  }
}
