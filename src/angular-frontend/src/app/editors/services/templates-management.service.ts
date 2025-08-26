import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Template } from '../../core/models/application-types.model';
import { BackendInteractionService } from '../../core/services/backend-interaction.service';
import { LastInteractionService } from './last-interaction.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplatesDialogComponent } from '../../dialogs/components/templates-dialog/templates-dialog.component';

/**
 * Manages application text templates.
 * 
 * This service loads text templates on startup
 * and provides methods to add and remove templates.
 */
@Injectable({ providedIn: 'root' })
export class TemplatesManagementService {
  /** Stores loaded templates. */
  private readonly _readTemplates = new BehaviorSubject<Template[]>([])

  /**
   * Creates the TemplatesManagementService instance.
   * 
   * @param _backendInteractionService - Handles backend interactions.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   * @param _templatesDialog - Enables templates creation.
   */
  constructor (
    private _backendInteractionService: BackendInteractionService,
    private _lastInteractionService: LastInteractionService,
    private _templatesDialog: MatDialog
  ) {
    this.loadTemplates();
  }

  /**
   * Gets an observable stream of the _readTemplates reactive Template[].
   * 
   * @returns An observable stream emitting _readTemplates changes.
   */
  public get readTemplates$(): Observable<Template[]> {
    return this._readTemplates.asObservable();
  }

  /**
   * Loads templates from the templates JSON file.
   */
  private async loadTemplates(): Promise<void> {
    this._readTemplates.next(await this._backendInteractionService.readTemplates());
  }

  /**
   * Add a template to the templates JSON file.
   * 
   * This method triggers a dialog to enable the template creation.
   */
  public async addTemplate(): Promise<void> {
    const editor = this._lastInteractionService.lastInteractedEditor;
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const content = editor.getModel()?.getValueInRange(selection);
    if (!content || content.trim() === '') return;
    const templatesDialogReference = this._templatesDialog.open(TemplatesDialogComponent, {
      panelClass: 'dialog',
    });
    const userData: { name: string, newLine: boolean } = await firstValueFrom(templatesDialogReference.afterClosed());
    if (!userData) return;
    const { name, newLine } = userData;
    await this._backendInteractionService.addTemplate(name, content, newLine);
    await this.loadTemplates();
  }

  /**
   * Remove a specified template from the templates JSON file.
   * 
   * @param template - Template to remove.
   */
  public async removeTemplate(template: Template): Promise<void> {
    await this._backendInteractionService.removeTemplate(template);
    await this.loadTemplates();
  }
}
