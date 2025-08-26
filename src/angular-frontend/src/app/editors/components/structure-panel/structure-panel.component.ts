import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { ParsingResults } from '../../../core/models/application-types.model';
import { RobotFile } from '../../models/robot-file.class';
import { FileParsingService } from '../../services/file-parsing.service';
import { LastInteractionService } from '../../services/last-interaction.service';

/**
 * Displays currently interacted Robot Framework file structure.
 */
@Component({
  selector: 'app-structure-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule],
  templateUrl: './structure-panel.component.html',
  styleUrl: './structure-panel.component.css'
})
export class StructurePanelComponent {
  /** An Observable emitting _parsingResults changes. */
  public parsingResults$: Observable<ParsingResults | null>

  /** An Observable emitting _lastInteractedFile changes. */
  public lastInteractedFile$: Observable<RobotFile | null>

  /**
   * Creates a StructurePanelComponent instance.
   * 
   * @param _fileParsingService - Parses a Robot Framework file.
   * @param _lastInteractionService - Tracks last interacted editor and file.
   */
  constructor(
    private _fileParsingService: FileParsingService,
    private _lastInteractionService: LastInteractionService
  ) {
    this.parsingResults$ = this._fileParsingService.parsingResults$
    this.lastInteractedFile$ = this._lastInteractionService.lastInteractedFile$
  }
}
