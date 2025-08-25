import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GitlabStateService } from './gitlab-state.service';
import { firstValueFrom } from 'rxjs';
import { ExecutableTest, Keyword, ParsingResults, ProjectStructure, Template } from '../models/application-types.model';
import { RobotFile } from '../../editors/models/robot-file.class';
import { EMPTY_PARSING_RESULTS } from '../models/application-consts.model';

/**
 * Handles interactions with the Robot-IDE API.
 */
@Injectable({ providedIn: 'root' })
export class BackendInteractionService {
  /**
   * Creates the BackendInteractionService instance.
   * 
   * @param _httpClient -
   * @param _gitlabStateService - Stores GitLab state.
   */
  constructor(
    private _httpClient: HttpClient,
    private _gitlabStateService: GitlabStateService
  ) {}

  /**
   * Communicates with the API using a generic HTTP POST request.
   * 
   * @param path - Path to the desired API route.
   * @param body - Body to transmit.
   * @returns Generic return value.
   */
  public async post<T>(path: string, body: any): Promise<T> {
    return await firstValueFrom(this._httpClient.post<T>(`http://localhost:8000${path}`, body));
  }

  /**
   * Authenticates with GitLab.
   * 
   * @returns true if authentication succeeded, false otherwise.
   */
  public async authenticate(): Promise<boolean> {
    try {
      await this.post<void>(
        '/authenticate',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken
        }
      );
      this._gitlabStateService.isAuthenticated = true;
      return true;
    } catch {
      this._gitlabStateService.isAuthenticated = false;
      return false;
    };
  }

  /**
   * Gets the last commit ID for current project and branch.
   * 
   * @returns Last commit ID or an empty string on failure.
   */
  public async getLastCommitId(): Promise<string> {
    try {
      return await this.post<string>(
        '/get_last_commit_id',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath,
          branch_name: this._gitlabStateService.branchName
        }
      );
    } catch { return ''; };
  }

  /**
   * Gets current GitLab project structure.
   * 
   * @returns Project structure or an empty list on failure.
   */
  public async getProjectStructure(): Promise<ProjectStructure> {
    try {
      return await this.post<ProjectStructure>(
        '/get_project_structure',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath,
          branch_name: this._gitlabStateService.branchName
        }
      );
    } catch { return []; };
  }

  /**
   * Parses a Robot Framework file.
   * 
   * @param file - File to parse.
   * @returns Parsing results or empty parsing results on failure.
   */
  public async parseFile(file: RobotFile): Promise<ParsingResults> {
    try {
      return await this.post<ParsingResults>(
        '/parse_robot_framework_file',
        {
          file_content: file.content
        }
      );
    } catch { return EMPTY_PARSING_RESULTS; };
  }

  /**
   * Gets Robot Framework keywords from resource and library imports.
   * 
   * @param resources - List of imported resources.
   * @param libraries - List of imported libraries.
   * @returns Gathered keywords or an empty list on failure.
   */
  public async gatherKeywords(resources: string[], libraries: string[]): Promise<Keyword[]> {
    const gitlabInfo = {
      gitlab_url: this._gitlabStateService.gitlabUrl,
      private_token: this._gitlabStateService.privateToken,
      project_path: this._gitlabStateService.projectPath,
      branch_name: this._gitlabStateService.branchName
    };
    const updatedLibraries = libraries.includes('BuiltIn') ? libraries : [...libraries, 'BuiltIn'];
    try {
      const [fromResources, fromLibraries] = await Promise.all([
        this.post<Keyword[]>('/get_resources_keywords', { ...gitlabInfo, resources: resources }),
        this.post<Keyword[]>('/get_libraries_keywords', { ...gitlabInfo, libraries: updatedLibraries})
      ]);
      return [...fromResources, ...fromLibraries];
    } catch { return []; };
  }

  /**
   * Gets a file content in the current project and branch.
   * 
   * @param filePath - Path to the file on GitLab.
   * @returns File text content.
   */
  public async getFileContent(filePath: string): Promise<string> {
    try {
      return await this.post<string>(
        '/get_file_content',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath,
          branch_name: this._gitlabStateService.branchName,
          file_path: filePath
        }
      );
    } catch (error: unknown) { throw error; };
  }

  /**
   * Checks if a file exists in the current project and branch.
   * 
   * @param filePath - Path to the file to check.
   * @returns Object indicating found information.
   */
  public async checkFileExistence(filePath: string): Promise<{exists: boolean, date?: string, author?: string}> {
    try {
      return await this.post<{exists: boolean, date?: string, author?: string}>(
        '/check_file_existence',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath,
          branch_name: this._gitlabStateService.branchName,
          file_path: filePath
        }
      );
    } catch (error: unknown) { throw error; };
  }

  /**
   * Gets the list of branch names for the current project.
   * 
   * @returns List of branch names.
   */
  public async getBranchesList(): Promise<string[]> {
    try {
      return await this.post<string[]>(
        '/get_branches_list',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath
        }
      );
    } catch { return []; };
  }

  /**
   * Checks if a project exists on GitLab.
   * 
   * This method calls the get_branches_list on purpose.
   * If the project is invalid, it will throw an error that
   * will be catched to return false.
   * 
   * @param gitlabUrl - GitLab's URL.
   * @param privateToken - User's private token.
   * @param projectPath - Project path to validate.
   * @returns true if the project is valid, false otherwise.
   */
  public async checkProjectValidity(gitlabUrl: string, privateToken: string, projectPath: string): Promise<boolean> {
    try {
      await this.post<string[]>(
        '/get_branches_list',
        {
          gitlab_url: gitlabUrl,
          private_token: privateToken,
          project_path: projectPath
        }
      );
      return true;
    } catch { return false; };
  }

  /**
   * Pushes a file to the current project and branch.
   * 
   * @param filePath - Path where to push the file to.
   * @param fileContent - Content to push.
   */
  public async pushFile(filePath: string, fileContent: string): Promise<void> {
    try {
      await this.post<void>(
        '/push_file',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath,
          branch_name: this._gitlabStateService.branchName,
          file_path: filePath,
          file_content: fileContent
        }
      );
    } catch (error) { throw error; };
  }

  /**
   * Gets a list of executable tests for the current project and branch.
   * 
   * @returns List of executable tests or an empty list on failure.
   */
  public async getExecutableTests(): Promise<ExecutableTest[]> {
    try {
      return await this.post<ExecutableTest[]>(
        '/get_executable_tests',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: this._gitlabStateService.projectPath,
          branch_name: this._gitlabStateService.branchName
        }
      );
    } catch { return []; };
  }

  /**
   * Reads templates from the templates JSON file.
   * 
   * @returns Found templates or an empty list on failure.
   */
  public async readTemplates(): Promise<Template[]> {
    try {
      return await this.post<Template[]>(
        '/read_templates', {
          file_path: '/tmp/templates.json'
        }
      );
    } catch { return []; };
  }

  /**
   * Adds a template to the templates JSON file.
   * 
   * @param templateName - Name of the new template. 
   * @param templateContent - Text content of the new template.
   * @param newLine - Whether the new templates should start on a new line.
   */
  public async addTemplate(templateName: string, templateContent: string, newLine: boolean): Promise<void> {
    try {
      await this.post<void>(
        '/add_template', {
          file_path: '/tmp/templates.json',
          template_name: templateName,
          template_content: templateContent,
          new_line: newLine
        }
      );
    } catch (error) { throw error; };
  }

  /**
   * Removes a template from the templates JSON file.
   * 
   * @param template - Template to remove.
   */
  public async removeTemplate(template: Template): Promise<void> {
    try {
      await this.post<void>(
        '/remove_template', {
          file_path: '/tmp/templates.json',
          template_name: template.name
        }
      );
    } catch (error) { throw error; };
  }

  /**
   * Scans a sepecified list of projects to search for Robot Framework files.
   * 
   * @param projectsToScan - Projects to scan for .robot and .resource files.
   */
  public async getRepositoryRobotFiles(
    projectsToScan: string[]
  ): Promise<{
    data: Record<string, Record<string, { project_path: string, path: string }[]>>;
    errors: Record<string, string>
  }> {
    try {
      return await this.post(
        '/get_repository_robot_files', {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_paths: projectsToScan
        }
      );
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Gets a file content and enables project and branch selection.
   * 
   * @param projectPath - Path to the GitLab project.
   * @param branchName - Name of the project branch.
   * @param filePath - Path to the file to open.
   * @returns File content.
   */
  public async getFileContentFrom(
    projectPath: string,
    branchName: string,
    filePath: string
  ): Promise<string> {
    try {
      return await this.post<string>(
        '/get_file_content',
        {
          gitlab_url: this._gitlabStateService.gitlabUrl,
          private_token: this._gitlabStateService.privateToken,
          project_path: projectPath,
          branch_name: branchName,
          file_path: filePath
        }
      );
    } catch {
      return 'Unable to properly open this file.'
    }
  }
}
