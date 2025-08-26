import { Injectable } from '@angular/core';
import { EditorsStateService } from '../../editors/services/editors-state.service';
import { InterfaceStateService } from './interface-state.service';
import { LocalStorageService } from './local-storage.service';
import { FilesManagementService } from '../../editors/services/files-management.service';
import { RobotFile } from '../../editors/models/robot-file.class';
import { debounceTime } from 'rxjs';

/**
 * Enables data persistence using localStorage.
 * 
 * This service provides methods to restore and persist the application state.
 */
@Injectable({ providedIn: 'root' })
export class DataPersistenceService {
  /** A local storage key to persist openFiles. */
  private readonly _OPEN_FILES_KEY = 'openFilesKey'

  /** A local storage key to persist selectedFile. */
  private readonly _SELECTED_FILE_KEY = 'selectedFileKey'

  /** A local storage key to persist editorsCount. */
  private readonly _EDITORS_COUNT_KEY = 'editorsCountKey'

  /** A local storage key to persist isSidebarOpen. */
  private readonly _IS_SIDEBAR_OPEN_KEY = 'isSidebarOpenKey'

  /** A local storage key to persist isThemeLight. */
  private readonly _IS_THEME_LIGHT_KEY = 'isThemeLightKey'

  /**
   * Creates the DataPersistenceService instance.
   * 
   * On application bootstrap (via injection in AppComponent), this service will:
   * - Restore persisted data
   * - Subscribe to data changes to persist them 
   * 
   * @param _localStorageService - Enables interactions with localStorage
   * @param _filesManagementService - Manages application open files.
   * @param _editorsStateService - Handles editors state.
   * @param _interfaceStateService - Handles interface state.
   */
  constructor(
    private _localStorageService: LocalStorageService,
    private _filesManagementService: FilesManagementService,
    private _editorsStateService: EditorsStateService,
    private _interfaceStateService: InterfaceStateService
  ) {
    this._restorePersistedData();
    this._subscribeToPersistData();
  }

  /**
   * Uses localStorage data to restore the application state.
   */
  private _restorePersistedData(): void {
    // Restores open files with a blank new file as a fallback.
    const serializedOpenFiles = this._localStorageService.get<{ uid: number, name: string, content: string }[]>(this._OPEN_FILES_KEY);
    const filesToRestore = serializedOpenFiles?.length
      ? serializedOpenFiles
      : [{ uid: Date.now(), name: 'new_file.robot', content: '' }];
    filesToRestore.forEach(fileToRestore =>
      this._filesManagementService.open(new RobotFile(fileToRestore.uid, fileToRestore.name, fileToRestore.content))
    );

    // Restores selected files for each editor panel.
    for (let index = 0 as 0|1|2|3; index <= 3; index ++) {
      this._editorsStateService.setSelectedFile(
        index,
        this._filesManagementService.openFiles.find(openFile => openFile.uid === this._localStorageService.get<number>(this._SELECTED_FILE_KEY + index))
        ?? this._filesManagementService.openFiles[0]
      )
    }

    // Restores the displayed editors count.
    this._editorsStateService.editorsCount = this._localStorageService.get<1|2|3|4>(this._EDITORS_COUNT_KEY) ?? 1;
 
    // Restores the sidebar state.
    this._editorsStateService.isSidebarOpen = this._localStorageService.get<boolean>(this._IS_SIDEBAR_OPEN_KEY) ?? false;

    // Restores the applied theme.
    this._interfaceStateService.isThemeLight = this._localStorageService.get<boolean>(this._IS_THEME_LIGHT_KEY) ?? false;
  }

  /**
   * Persists data in localStorage on Observable changes.
   * 
   * Unsubscription is not needed as the service lives as long as the application does.
   */
  private _subscribeToPersistData(): void {
    // Persists the open files on openFiles$ changes.
    this._filesManagementService.openFiles$.pipe(debounceTime(300)).subscribe(openFiles =>
      this._localStorageService.set(this._OPEN_FILES_KEY, openFiles.map(openFile => ({
        uid: openFile.uid,
        name: openFile.name,
        content: openFile.content
      })))
    );

    // Persists selected files for each editor.
    for (let index = 0 as 0|1|2|3; index <= 3; index ++) {
      this._editorsStateService.getSelectedFileObservable(index).subscribe(selectedFile =>
        selectedFile
        ? this._localStorageService.set(this._SELECTED_FILE_KEY + index, selectedFile.uid)
        : this._localStorageService.remove(this._SELECTED_FILE_KEY + index)
      );
    }

    // Persists editors count on editorsCount$ changes.
    this._editorsStateService.editorsCount$.subscribe(editorsCount =>
      this._localStorageService.set(this._EDITORS_COUNT_KEY, editorsCount)
    );

    // Persists sidebar state on isSidebarOpen$ changes.
    this._editorsStateService.isSidebarOpen$.subscribe(isSidebarOpen =>
      this._localStorageService.set(this._IS_SIDEBAR_OPEN_KEY, isSidebarOpen)
    );

    // Persists selected theme on isLightTheme$ changes.
    this._interfaceStateService.isThemeLight$.subscribe(isThemeLight =>
      this._localStorageService.set(this._IS_THEME_LIGHT_KEY, isThemeLight)
    );
  }
}
