import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';
import { Observable } from 'rxjs';
import { EditorPanelCount } from '../../../core/models/application-types.model';
import { EditorsStateService } from '../../services/editors-state.service';

/**
 * Displays editors layout with its expandable sidebar and editor panels.
 */
@Component({
  selector: 'app-editors-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatSidenavModule,
    SidebarComponent,
    EditorPanelComponent
  ],
  templateUrl: './editors-layout.component.html',
  styleUrl: './editors-layout.component.css'
})
export class EditorsLayoutComponent {
  /** An observable stream emitting _isSidebarOpen changes. */
  public readonly isSidebarOpen$: Observable<boolean>;

  /** An observable stream emitting _editorsCount changes. */
  public readonly editorsCount$: Observable<EditorPanelCount>;

  /**
   * Creates the EditorsLayoutComponent instance.
   * 
   * On instantiation, the component gets and exposes:
   * - isSidebarOpen$: The sidebar state Observable
   * - editorsCount$: The displayed editors count Observable
   * 
   * @param _editorsStateService - Handles editors state.
   */
  constructor(
    private readonly _editorsStateService: EditorsStateService,
  ) {
    this.isSidebarOpen$ = this._editorsStateService.isSidebarOpen$;
    this.editorsCount$ = this._editorsStateService.editorsCount$;
  }
}
