import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidebarPanel } from '../../../core/models/application-types.model';
import { ProjectPanelComponent } from '../project-panel/project-panel.component';
import { StructurePanelComponent } from '../structure-panel/structure-panel.component';
import { TemplatesPanelComponent } from '../templates-panel/templates-panel.component';
import { KeywordsPanelComponent } from '../keywords-panel/keywords-panel.component';
import { ResourcesPanelComponent } from '../resources-panel/resources-panel.component';

/**
 * Displays several panels based on the selected button.
 * 
 * The sidebar includes the following panels:
 * - ProjectPanelComponent: Enables browsing a GitLab project
 * - StructurePanelComponent: Displays the file structure
 * - TemplatesPanelComponent: Enables insertion of text templates
 * - KeywordsPanelComponent: Enables keywords search
 * - ResourcesPanelComponent: Allows searching for shared Robot Framework files
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  /** An array of objects to define the sidebar panels. */
  public readonly sidebarPanels: {component: SidebarPanel, icon: string, tooltip: string}[] = [
    { component: ProjectPanelComponent, icon: 'folder_open', tooltip: 'Explore a GitLab project' },
    { component: StructurePanelComponent, icon: 'device_hub', tooltip: 'View file structure' },
    { component: TemplatesPanelComponent, icon: 'playlist_add', tooltip: 'Insert text template' },
    { component: KeywordsPanelComponent, icon: 'key', tooltip: 'Find libraries keywords' },
    { component: ResourcesPanelComponent, icon: 'search', tooltip: 'Find shared resources' },
  ]

  /** A property that represents the currently selected SidebarPanel. */
  public currentPanel: SidebarPanel = ProjectPanelComponent;
}