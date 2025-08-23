import { Injectable } from '@angular/core';
import { FilesManagementService } from '../../editors/services/files-management.service';
import { LastInteractionService } from '../../editors/services/last-interaction.service';
import { TemplatesManagementService } from '../../editors/services/templates-management.service';

/**
 * Enables keyboard shortcut inputs processing.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationShortcutsService {
  /**
   * Creates the ApplicationShortcutsService instance.
   * 
   * @param _filesManagementService - Handles application files.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   * @param _templatesManagementService - Handles text templates management.
   */
  constructor(
    private _filesManagementService: FilesManagementService,
    private _lastInteractionService: LastInteractionService,
    private _templatesManagementService: TemplatesManagementService
  ) {}

  /**
   * Listens to keyboard shortcut inputs to trigger actions.
   */
  public startKeyboardShortcutsListener(): void {
    window.addEventListener('keydown', event => {
      const normalizedKey = event.key.toLowerCase();
      if (event.ctrlKey && event.altKey && normalizedKey === 'n') {
        event.preventDefault();
        this._filesManagementService.openNewFile();
      }
      if (event.ctrlKey && !event.altKey && normalizedKey === 'o') {
        event.preventDefault();
        this._filesManagementService.openLocalFile();
      }
      if (event.ctrlKey && !event.altKey && normalizedKey === 's') {
        event.preventDefault();
        this._lastInteractionService.saveLastInteractedFile();
      }
      if (event.ctrlKey && event.altKey && normalizedKey === 'o') {
        event.preventDefault();
        this._filesManagementService.openGitlabFile();
      }
      if (event.ctrlKey && event.altKey && normalizedKey === 's') {
        event.preventDefault();
        this._lastInteractionService.pushLastInteractedFile();
      }
      if (event.ctrlKey && normalizedKey === 'p') {
        event.preventDefault();
        this._templatesManagementService.addTemplate();
      }
    });
  }
}
