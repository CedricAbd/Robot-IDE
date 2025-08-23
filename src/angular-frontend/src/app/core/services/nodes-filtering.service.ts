import { Injectable } from '@angular/core';

/**
 * Provides a generic method to filter lists.
 */
@Injectable({ providedIn: 'root' })
export class NodesFilteringService {
  /**
   * Returns a filtered list based on a predicate.
   * 
   * @param items - List to filter.
   * @param predicate - Function that determines if an item should be filtered.
   * @returns Filtered list.
   */
  public filterList<T>(items: T[], predicate: (item: T) => boolean): T[] {
    return items.filter(predicate);
  }
}
