import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

/**
 * Displays a dialog to enable text templates creation.
 */
@Component({
  selector: 'app-templates-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './templates-dialog.component.html',
  styleUrl: './templates-dialog.component.css'
})
export class TemplatesDialogComponent {
  /** A string to store user's template name input. */
  public name: string = '';

  /** A boolean to store user's new line selection. */
  public newLine: boolean = false;

  /**
   * Creates a TemplateDialogComponent instance.
   * 
   * @param _templatesDialogReference - Reference to this dialog.
   */
  constructor (
    private _templatesDialogReference: MatDialogRef<TemplatesDialogComponent>,
  ) {}

  /**
   * Closes the dialog.
   */
  onCancel(): void {
    this._templatesDialogReference.close();
  }

  /**
   * Closes the dialog and returns an object containing name and new line choice.
   */
  onConfirm(): void {
    this._templatesDialogReference.close({
      name: this.name,
      newLine: this.newLine 
    })
  }
}
