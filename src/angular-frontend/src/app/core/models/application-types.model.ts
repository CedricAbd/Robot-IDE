import { ProjectPanelComponent } from "../../editors/components/project-panel/project-panel.component";
import { StructurePanelComponent } from "../../editors/components/structure-panel/structure-panel.component";
import { TemplatesPanelComponent } from "../../editors/components/templates-panel/templates-panel.component";
import { KeywordsPanelComponent } from "../../editors/components/keywords-panel/keywords-panel.component";
import { ResourcesPanelComponent } from "../../editors/components/resources-panel/resources-panel.component";

/**
 * Represents the possible sidebar panels in the editors layout.
 */
export type SidebarPanel =
  | typeof ProjectPanelComponent
  | typeof StructurePanelComponent
  | typeof TemplatesPanelComponent
  | typeof KeywordsPanelComponent
  | typeof ResourcesPanelComponent

/**
 * Represents the number of editors currently opened in the edition area.
 */
export type EditorPanelCount = 1|2|3|4

/**
 * Represents the index of an editor.
 */
export type EditorPanelIndex = 0|1|2|3

/**
 * Represents a disposable resource with a cleanup method.
 */
export type Disposable = { dispose: () => void };

/**
 * Represents the results of a parsed Robot Framework file.
 */
export type ParsingResults = {
  suite_documentation: string;
  suite_setup: string;
  suite_teardown: string;
  imported_resources: string[];
  imported_libraries: string[];
  imported_variables: string[];
  created_variables: Record<string, any>;
  created_test_cases: TestCase[];
  created_keywords: Keyword[];
}

/**
 * Represents a Robot Framework Test Case in the application.
 */
export type TestCase = {
  name: string;
  documentation: string;
  tags: string[];
  setup: string;
  teardown: string;
}

/**
 * Represents a Robot Framework Keyword in the application.
 */
export type Keyword = {
  name: string;
  documentation: string;
  arguments: string[];
}

/**
 * Represents a Robot Framework Variable in the application.
 */
export type Variable = {
  name: string;
  value: 
    string |
    string[] |
    number |
    boolean |
    Record<string, any>;
}

/**
 * Represents the flat structure of a GitLab project.
 */
export type ProjectStructure = {
  name: string,
  path: string,
  type: 'tree' | 'blob'
}[]

/**
 * Represents a test that can be executed from GitLab.
 */
export type ExecutableTest = {
  name: string,
  path: string,
  tags: string[]
}

/**
 * Represents a text template in the application.
 */
export type Template = {
  name: string;
  content: string;
  new_line: boolean;
}

/**
 * Represents a project structure tree node.
 */
export type TreeNode = {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  level: number;
}
