import { Component, OnInit, inject } from '@angular/core';
import { MenubarComponent } from './core/components/menubar/menubar.component';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

import { BackendInteractionService } from './core/services/backend-interaction.service';
import { FilesManagementService } from './editors/services/files-management.service';
import { DataPersistenceService } from './core/services/data-persistence.service';
import { LanguageRegistrationService } from './editors/services/language-registration.service';
import { ThemeDefinitionService } from './editors/services/theme-definition.service';
import { KeywordsGatheringService } from './editors/services/keywords-gathering.service';
import { AutocompletionSuggestionsService } from './editors/services/autocompletion-suggestions.service';
import { ApplicationShortcutsService } from './core/services/application-shortcuts.service';

/**
 * Provides the application main component.
 * 
 * This component calls:
 * - MenubarComponent: A component displaying the application menubar
 * - RouterOutlet: An object handling application routing
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MenubarComponent,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  /** Injects the Mat Icon registry. */
  private readonly iconRegistry = inject(MatIconRegistry)

  /**
   * Instantiates the AppComponent object.
   * 
   * A silent injection of several services is
   * performed to start them on application bootstrap.
   * The material-icons CSS class is also defined as
   * the default font in the icon registry.
   * 
   * @param _backendInteractionService - Enables backend interactions.
   * @param _filesManagementService - Handles application files.
   * @param _dataPersistenceService - Enables data persistence.
   * @param _languageRegistrationService - Registers the Robot Framework language.
   * @param _themeDefinitionService - Defines Monaco Editor light and dark themes.
   * @param _keywordsGatheringService - Gathers Robot Framework keywords from imported libraries and resources.
   * @param _autocompletionSuggestionsService - Provides dynamic autocompletion suggestions for Robot Framework.
   * @param _applicationShortcutsService - Handles application keyboard shortcuts.
   */
  constructor(
    private _backendInteractionService: BackendInteractionService,
    private _filesManagementService: FilesManagementService,
    private _dataPersistenceService: DataPersistenceService,
    private _languageRegistrationService: LanguageRegistrationService,
    private _themeDefinitionService: ThemeDefinitionService,
    private _keywordsGatheringService: KeywordsGatheringService,
    private _autocompletionSuggestionsService: AutocompletionSuggestionsService,
    private _applicationShortcutsService: ApplicationShortcutsService
  ) {
    this.iconRegistry.setDefaultFontSetClass('material-icons')
  }

  /**
   * Authenticates with GitLab and starts the
   * shortcuts service on application initialization.
   * 
   * Awaits for authentication before proceeding.
   */
  async ngOnInit(): Promise<void> {
    await this._backendInteractionService.authenticate();
    this._applicationShortcutsService.startKeyboardShortcutsListener();
  }
}
