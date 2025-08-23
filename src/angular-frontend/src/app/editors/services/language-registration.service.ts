import { Injectable } from '@angular/core';
import { languages } from 'monaco-editor';
import { monarchLanguage } from '../../core/models/application-consts.model';

/**
 * Registers the Robot Framework language.
 * 
 * Guarantees a unique registration.
 */
@Injectable({ providedIn: 'root' })
export class LanguageRegistrationService {
  /**
   * Creates the LanguageRegistrationService instance.
   * 
   * Registers the Robot Framework language and its
   * Monarch tokenizer.
   */
  constructor() {
    languages.register({ id: 'robot-framework' });
    languages.setMonarchTokensProvider('robot-framework', monarchLanguage);
  }
}
