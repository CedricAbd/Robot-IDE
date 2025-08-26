import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GitlabStateService } from '../../../core/services/gitlab-state.service';
import { StructureFetchingService } from '../../services/structure-fetching.service';
import { BackendInteractionService } from '../../../core/services/backend-interaction.service';
import { FilesManagementService } from '../../services/files-management.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreeNode } from '../../../core/models/application-types.model';
import { RobotFile } from '../../models/robot-file.class';

/**
 * Renders current GitLab project structure and enables files opening.
 */
@Component({
  selector: 'app-project-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTreeModule,
    MatTooltipModule
  ],
  templateUrl: './project-panel.component.html',
  styleUrl: './project-panel.component.css'
})
export class ProjectPanelComponent {
  /** A list to represent the GitLab project tree structure.*/
  private projectTree: TreeNode[] = [];

  /** A string to store the project's name. */
  public projectName: string;

  /** A TreeControl for the Material flat tree. */
  public flatTreeControl = new FlatTreeControl<TreeNode>(node => node.level, node => node.type === 'tree');
  
  /** A TreeFlattener to flatten the structure. */
  public treeFlattener = new MatTreeFlattener<TreeNode, TreeNode>(
    (node, level) => ({
      ...node,
      level
    }),
    node => node.level,
    node => node.type === 'tree',
    node => this.projectTree
      .filter(
        children =>
          children.level === node.level + 1 &&
          children.path.startsWith(node.path + '/')
      )
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
  );

  /** A DataSource that takes the flattened tree to render it. */
  dataSource = new MatTreeFlatDataSource(this.flatTreeControl, this.treeFlattener);

  /**
   * Creates a ProjectPanelComponent instance.
   * 
   * @param _gitlabStateService - Stores GitLab state.
   * @param _structureFetchingService - Periodically fetches current project structure.
   * @param _backendInteractionService - Handles backend interactions.
   * @param _filesManagementService - Manages files in the application. 
   */
  constructor(
    private _gitlabStateService: GitlabStateService,
    private _structureFetchingService: StructureFetchingService,
    private _backendInteractionService: BackendInteractionService,
    private _filesManagementService: FilesManagementService
  ) {
    this.projectName = ''
    this._structureFetchingService.fetchedStructure$.pipe(takeUntilDestroyed()).subscribe(fetchedStructure => {
      this.projectTree = fetchedStructure
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .map(node => ({
          ...node,
          level: node.path.split('/').length - 1
        }));
      this.dataSource.data = this.projectTree.filter(node => node.level === 0);
      this.projectName = this._gitlabStateService.projectPath
    });
  }
  
  /**
   * Indicates to the tree whether a given node is expandable.
   * 
   * @param _ - Not used.
   * @param node - Node to test.
   * @returns True when node.type === 'tree'.
   */
  hasChild = (_: number, node: TreeNode) => node.type === 'tree';

  /**
   * Returns the left indentation in pixels for a given node level.
   * 
   * Uses a geometric progression (base * shrink^level) with a minimum cap.
   * 
   * @param node - Target node.
   * @returns Indent in pixels, relative to the root font size.
   */
  getIndent(node: TreeNode): number {
    const base = 1.25;
    const shrink = 0.75;
    const min = 0.5;
    const rem = Math.max(base * Math.pow(shrink, node.level), min);
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return rem * rootPx;
  }

  /**
   * Opens a file in the application on user's selection.
   * 
   * @param node - Tree node corresponding to the selected file.
   */
  async openFile(node: TreeNode): Promise<void> {
    const fileContent = await this._backendInteractionService.getFileContent(node.path);
    const fileName = node.name;
    this._filesManagementService.open(
      new RobotFile(
        Date.now(),
        fileName,
        fileContent
      )
    );
  }

  /**
   * Styles files by extension.
   * 
   * Returns icons and colors for .robot,
   * .resource and .py files.
   * 
   * @param node - Node for which to get the style.
   * @returns An object to style the node.
   */
  public getIcon(node: TreeNode): { icon: string, color: string } {
    const ext = node.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'robot': return { icon:'smart_toy', color: '#a3e4d7' };
      case 'resource': return { icon:'settings', color: '#a3e4d7' };
      case 'py': return { icon:'settings', color: '#f8c471' };
      default: return { icon:'format_align_left', color: 'var(--text-color)' };
    }
  }
}
