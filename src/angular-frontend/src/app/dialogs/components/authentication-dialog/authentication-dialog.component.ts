import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { GitlabStateService } from '../../../core/services/gitlab-state.service';
import { BackendInteractionService } from '../../../core/services/backend-interaction.service';

/**
 * Enables user's authentication with GitLab.
 */
@Component({
  selector: 'app-authentication-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: './authentication-dialog.component.html',
  styleUrl: './authentication-dialog.component.css'
})
export class AuthenticationDialogComponent {
  /** A string to receive user's GitLab URL input. */
  public gitlabUrl: string;

  /** A string to receive user's private token input. */
  public privateToken: string;

  /** A string to receive user's project path input. */
  public projectPath: string;

  /** A string to represent an error message. Can be null if no error happens. */
  public errorMessage: string | null = null;

  /**
   * Creates an AuthenticationDialogComponent instance.
   * 
   * @param _authenticationDialogReference - Reference to the dialog.
   * @param _gitlabStateService - Stores GitLab state.
   * @param _backendInteractionService - Handles backend interactions.
   * @param _localStorageService - Enables localStorage interactions.
   */
  constructor(
    private _authenticationDialogReference: MatDialogRef<AuthenticationDialogComponent>,
    private _gitlabStateService: GitlabStateService,
    private _backendInteractionService: BackendInteractionService,
    private _localStorageService: LocalStorageService
  ) {
    this.gitlabUrl = this._localStorageService.get('gitlabUrlKey') ?? '';
    this.privateToken = this._localStorageService.get('privateTokenKey') ?? '';
    this.projectPath = this._localStorageService.get('projectPathKey') ?? '';
  }

  /**
   * Tries authentication when the user selects the authentication button.
   */
  public async onAuthenticate(): Promise<void> {
    this.errorMessage = null;
    const url = this.gitlabUrl.trim()
    const token = this.privateToken.trim()
    const path = this.projectPath.trim()
    this._gitlabStateService.gitlabUrl = url;
    this._gitlabStateService.privateToken = token;
    if (
      await this._backendInteractionService.authenticate() &&
      await this._backendInteractionService.checkProjectValidity(url, token, path)
    ) {
      this._gitlabStateService.projectPath = path;
      this._localStorageService.set<string>('gitlabUrlKey', url);
      this._localStorageService.set<string>('privateTokenKey', token);
      this._localStorageService.set<string>('projectPathKey', path)
      this._authenticationDialogReference.close();
    } else {
      this.errorMessage = 'Invalid URL, token, or project path. Please retry.';
    }
  }
}
