import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { RobotFile } from '../models/robot-file.class';
import { MatDialog } from '@angular/material/dialog';
import { GitlabDialogComponent } from '../../dialogs/components/gitlab-dialog/gitlab-dialog.component';

/**
 * Manages files that are open in the application.
 * 
 * This service enables to get an observable stream of the
 * open files array, its current value and provide methods
 * to open or close files.
 */
@Injectable({ providedIn: 'root' })
export class FilesManagementService {
  /** A reactive array to store open files. */
  private readonly _openFiles = new BehaviorSubject<RobotFile[]>([]);

  /** A map of subscriptions to the open files `onContentChanged$` observables. */
  private readonly _filesChangesSubscriptions = new Map<number, Subscription>();

  /**
   * Creates the FilesManagementService instance.
   * 
   * @param _dialog - The GitLab dialog.
   */
  constructor(
    private _dialog: MatDialog
  ) {}

  /**
   * Gets an observable stream of the _openFiles reactive array.
   * 
   * @returns An observable stream emitting _openFiles changes.
   */
  public get openFiles$(): Observable<RobotFile[]> {
    return this._openFiles.asObservable();
  }

  /**
   * Gets the current value of the _openFiles reactive array.
   * 
   * @returns The current value of _openFiles.
   */
  public get openFiles(): RobotFile[] {
    return this._openFiles.value;
  }

  /**
   * Adds a new file to the _openFiles reactive array.
   * 
   * Does nothing if file is already open.
   * Subscribes to model changes to force an _openFiles change.
   * 
   * @param newFile - New file to add to _openFiles.
   */
  public open(newFile: RobotFile): void {
    if (this._openFiles.value.some(file => file.uid === newFile.uid)) return;
    const subscription = newFile.onContentChanged$.subscribe(() => {
      this._openFiles.next([...this._openFiles.value]);
    });
    this._filesChangesSubscriptions.set(newFile.uid, subscription);
    this._openFiles.next([...this._openFiles.value, newFile]);
  }

  /**
   * Removes a file from the _openFiles reactive array.
   * 
   * Does nothing if the file does not exist.
   * Disposes the file model to avoid memory leaks. 
   * 
   * @param fileToClose - File to remove from _openFiles.
   */
  public close(fileToClose: RobotFile): void {
    if (!this._openFiles.value.some(file => file.uid === fileToClose.uid)) return;
    this._filesChangesSubscriptions.get(fileToClose.uid)?.unsubscribe();
    this._filesChangesSubscriptions.delete(fileToClose.uid);
    fileToClose.dispose();
    this._openFiles.next(this._openFiles.value.filter(file => file.uid !== fileToClose.uid));
  }

  /**
   * Opens a blank new file.
   */
  public openNewFile(): void {
    this.open(new RobotFile(Date.now(), 'new_file.robot'));
  }

  /**
   * Opens a file from the local system.
   * 
   * Displays a dialog to select a file and
   * adds selected file to _openFiles.
   */
  public openLocalFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.robot,.resource';
    input.style.display = 'none';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files.length) return;
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.open(
          new RobotFile(
            Date.now(),
            file.name,
            reader.result as string
          )
        );
      };
      reader.readAsText(file);
    }
    input.click();
  }

  /**
   * Opens a file from GitLab.
   * 
   * Displays a dialog to input a file path.
   */
  public openGitlabFile(): void {
    this._dialog.open(GitlabDialogComponent, {
      width: '60%',
      panelClass: 'dialog',
      data: 'open'
    });
  }
}
