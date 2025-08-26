import { Injectable } from '@angular/core';

/**
 * Handles browser localStorage interaction.
 * 
 * Provides generic methods to retrieve and store local storage items.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /**
   * Retrieves any typed value from localStorage using its key.
   * 
   * @param key - Key of the item to retrieve.
   * @returns Parsed value if it exists, null otherwise.
   */
  public get<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value === null || value === '') {
      console.warn(`LocalStorageService: No value found for key '${key}'.`)
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error: unknown) {
      console.warn(`LocalStorageService: Unable to parse data for key '${key}'.`, error)
      return null;
    }
  }

  /**
   * Stores a value in localStorage under a given key.
   * 
   * @param key - Key to associate the value with.
   * @param value - Value to store.
   */
  public set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error: unknown) {
      console.warn(`LocalStorageService: Unable to store value '${value}' under the '${key}' key.`, error)
    }
  }

  /**
   * Removes a value from localStorage using its key.
   * 
   * @param key - Key to remove the value from.
   */
  public remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error: unknown) {
      console.warn(`LocalStorageService: Unable to remove the item associated to the '${key}' key.`)
    }
  }
}
