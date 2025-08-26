import { Component, OnInit } from '@angular/core';
import { Observable, startWith, map, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Template } from '../../../core/models/application-types.model';
import { TemplatesManagementService } from '../../services/templates-management.service';
import { NodesFilteringService } from '../../../core/services/nodes-filtering.service';
import { LastInteractionService } from '../../services/last-interaction.service';

@Component({
  selector: 'app-templates-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './templates-panel.component.html',
  styleUrl: './templates-panel.component.css'
})
export class TemplatesPanelComponent implements OnInit {
  /** Captures user's search. */
  public readonly formControl = new FormControl('');

  /** Emmits displayed templates changes. */
  public displayedTemplates$!: Observable<Template[]>;

  /**
   * Creates a TemplatePanelComponent instance.
   * 
   * @param _templatesManagementService - Manages user's templates.
   * @param _nodesFilteringService - Filters lists.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   */
  constructor(
    private _templatesManagementService: TemplatesManagementService,
    private _nodesFilteringService: NodesFilteringService,
    private _lastInteractionService: LastInteractionService
  ) {}

  /**
   * Combine read templates and user's search to provide
   * a list of templates to display.
   */
  public ngOnInit(): void {
    this.displayedTemplates$ = combineLatest([
      this._templatesManagementService.readTemplates$,
      this.formControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([readTemplates, search]) => {
        const filter = (template: Template) =>
          template.name.toLowerCase().includes((search ?? '').toLowerCase())
        return this._nodesFilteringService.filterList<Template>(readTemplates, filter);
      })
    );
  }

  /**
   * Inserts template in the editor.
   * 
   * @param template - Template to insert.
   */
  public insertTemplate(template: Template): void {
    this._lastInteractionService.insertTextInLastInteractedEditor(
      (template.new_line === true ? '\n' : '') + template.content
    );
  }

  /**
   * Removes template from user's templates.
   * 
   * @param template - Template to remove.
   */
  public removeTemplate(template: Template): void {
    this._templatesManagementService.removeTemplate(template);
  }
}
