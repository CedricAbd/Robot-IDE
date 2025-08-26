import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

/**
 * Renders a confirmation dialog.
 */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  /**
   * Creates a ConfirmationDialogComponent instance.
   * 
   * @param message - Message to display in the dialog.
   * @param _confirmationDialogRef - Reference to this dialog.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public message: string,
    private _confirmationDialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}

  /**
   * Closes the dialog and emits false to the opener.
   */
  onCancel(): void {
    this._confirmationDialogRef.close(false)
  }

  /**
   * Closes the dialog and emits true to the opener.
   */
  onConfirm(): void {
    this._confirmationDialogRef.close(true)
  }
}
