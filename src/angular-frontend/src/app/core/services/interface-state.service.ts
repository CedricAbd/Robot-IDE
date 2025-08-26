import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Represents the application interface state.
 * 
 * This service stores a reactive boolean to define the current active theme (dark/light).
 */
@Injectable({ providedIn: 'root' })
export class InterfaceStateService {
  /** A reactive boolean to define the current active theme */
  private readonly _isThemeLight = new BehaviorSubject<boolean>(false);

  /**
   * Instantiates the InterfaceStateService object.
   * 
   * On instantiation, subscribe to the reactive boolean changes to trigger theme switch.
   */
  constructor() {
    this._isThemeLight.subscribe(isThemeLight =>
      document.body.classList.toggle('light-theme', isThemeLight)
    );
  }

  /**
   * Gets an observable stream of the _isThemeLight reactive boolean.
   * 
   * @returns An observable stream emitting _isThemeLight changes.
   */
  public get isThemeLight$(): Observable<boolean> {
    return this._isThemeLight.asObservable();
  }

  /**
   * Gets the current value of the _isThemeLight reactive boolean.
   * 
   * @returns The current value of the _isThemeLight reactive boolean.
   */
  public get isThemeLight(): boolean {
    return this._isThemeLight.value;
  }

  /**
   * Sets the current value of the _isThemeLight reactive boolean.
   * 
   * @param value - The value to set.
   */
  public set isThemeLight(value: boolean) {
    this._isThemeLight.next(value);
  }
}
