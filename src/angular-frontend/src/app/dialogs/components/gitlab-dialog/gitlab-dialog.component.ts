import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StructureFetchingService } from '../../../editor/services/structure-fetching.service';
import { LastInteractionService } from '../../../editor/services/last-interaction.service';
import { FilesManagementService } from '../../../editors/services/files-management.service';
import { BackendInteractionService } from '../../../core/services/backend-interaction.service';
import { RobotFile } from '../../../editor/models/robot-file.class';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

/**
 * Renders a dialog that enables GitLab's files opening and saving.
 */
@Component({
  selector: 'app-gitlab-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './gitlab-dialog.component.html',
  styleUrl: './gitlab-dialog.component.css'
})
export class GitlabDialogComponent {
  /** A string to store user's file path input. */
  public filePath: string = '';

  /** An array of strings to store paths suggestions. */
  public pathsSuggestions: string[] = [];

  /** A string that represents an error message. Can be null if no error happens. */
  public errorMessage: string | null = null;

  /**
   * Creates a GitlabDialogComponent instance.
   * 
   * @param mode - The dialog mode (open or save)
   * @param _dialog - MatDialog to open the ConfirmationDialog.
   * @param _gitlabDialogRef - Reference to this dialog.
   * @param _structureFetchingService - Periodically fetches current project structure.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   * @param _backendInteractionService - Handles backend interactions.
   * @param _filesManagementService - Manages files in the application.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public mode: 'open' | 'save',
    private _dialog: MatDialog,
    private _gitlabDialogRef: MatDialogRef<GitlabDialogComponent>,
    private _structureFetchingService: StructureFetchingService,
    private _lastInteractionService: LastInteractionService,
    private _backendInteractionService: BackendInteractionService,
    private _filesManagementService: FilesManagementService
  ) {
    const rawPaths = this._structureFetchingService.fetchedStructure.filter(node =>
      node.type === (this.mode === 'open' ? 'blob' : 'tree')
    ).map(node => node.path);
    const fileName = this._lastInteractionService.lastInteractedFile?.name;
    if (this.mode === 'save' && fileName) {
      this.pathsSuggestions = [
        ...rawPaths,
        ...rawPaths.map(path => path.endsWith('/') ? `${path}${fileName}` : `${path}/${fileName}`),
        fileName
      ]
    } else {
      this.pathsSuggestions = rawPaths
    };
  }

  /**
   * Closes the dialog.
   */
  public onCancel(): void {
    this._gitlabDialogRef.close();
  }

  /**
   * Closes the dialog after opening or saving.
   * 
   * Depending on the mode, this method will trigger opening
   * or saving. In case of saving conflict, it will open a
   * confirmation dialog.
   */
  public async onConfirm(): Promise<void> {
    this.errorMessage = null;
    if (this.mode === 'open') {
      try {
        const content = await this._backendInteractionService.getFileContent(this.filePath)
        this._filesManagementService.open(new RobotFile(
          Date.now(),
          this.filePath.split('/').pop()!,
          content
        ))
        this._gitlabDialogRef.close();
      } catch (error) {
        this.errorMessage = 'Unable to open file.'
      }
    } else {
      try {
        const content = await this._backendInteractionService.checkFileExistence(this.filePath);
        if (content.exists) {
          const confirmRef = this._dialog.open(ConfirmationDialogComponent, {
            panelClass: 'dialog',
            data: `File at ${this.filePath} already exists. It was last committed by ${content.author} on ${content.date}`
          })
          const result = await confirmRef.afterClosed().toPromise();
          if (result === true) {
            this._gitlabDialogRef.close()
            this._backendInteractionService.pushFile(this.filePath, this._lastInteractionService.lastInteractedFile?.content ?? '')
          } else {
            this._gitlabDialogRef.close()
          }
        } else {
          this._backendInteractionService.pushFile(this.filePath, this._lastInteractionService.lastInteractedFile?.content ?? '')
          this._gitlabDialogRef.close()
        }
      } catch {
        this.errorMessage = 'Unable to save file.'
      }
    }
  }
}
