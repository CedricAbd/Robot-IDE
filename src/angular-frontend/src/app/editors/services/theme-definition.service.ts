import { Injectable } from '@angular/core';
import { InterfaceStateService } from '../../core/services/interface-state.service';
import { editor } from 'monaco-editor';
import darkTheme from '../../../config/monaco-themes/dark-theme.json';
import lightTheme from '../../../config/monaco-themes/light-theme.json';

/**
 * Defines Monaco Editor dark and light themes.
 */
@Injectable({ providedIn: 'root' })
export class ThemeDefinitionService {
  /**
   * Creates the ThemeDefinitionService instance.
   * 
   * Defines both themes then subscribes to isThemeLight$
   * to trigger theme change on changes.
   * 
   * @param interfaceStateService - Handles interface state.
   */
  constructor(
    private interfaceStateService: InterfaceStateService
  ) {
    this.defineTheme(darkTheme);
    this.defineTheme(lightTheme);
    this.interfaceStateService.isThemeLight$.subscribe(isThemeLight => {
      editor.setTheme(isThemeLight ? 'light-theme' : 'dark-theme')
    })
  }

  /**
   * Defines a theme based on a configuration file.
   * 
   * @param config - Config from the JSON file.
   */
  public defineTheme(
    config: {
      name: string,
      base: string,
      rules: { token: string, foreground: string, fontStyle?: string }[],
      colors: { 'editorSuggestWidget.selectedBackground': string }
    }
  ): void {
    editor.defineTheme(config.name, {
      base: config.base as editor.BuiltinTheme,
      inherit: true,
      rules: config.rules,
      colors: config.colors
    })
  }
}
