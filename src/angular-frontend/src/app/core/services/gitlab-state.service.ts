import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Stores GitLab state.
 * 
 * Provides accessors to user's GitLab information.
 */
@Injectable({ providedIn: 'root' })
export class GitlabStateService {
  /** Defines authentication status. */
  private _isAuthenticated = new BehaviorSubject<boolean>(false);

  /** Stores GitLab URL. */
  private _gitlabUrl: string = '';

  /** Stores user's GitLab private token. */
  private _privateToken: string = '';

  /** Stores currently selected GitLab project path. */
  private _projectPath = new BehaviorSubject<string>('');

  /** Stores currently selected GitLab project branch name. */
  private _branchName: string = 'main'

  /** Stores last commit id for a specific project in a specific branch. */
  private _lastCommitId = new BehaviorSubject<string>('');

  /**
   * Gets an observable stream of the _isAuthenticated reactive boolean.
   * 
   * @returns Observable emitting _isAuthenticated changes.
   */
  public get isAuthenticated$(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  /**
   * Sets the value of the _isAuthenticated reactive boolean.
   * 
   * @param value - Boolean to set as the new value.
   */
  public set isAuthenticated(value: boolean) {
    this._isAuthenticated.next(value);
  }

  /**
   * Gets the value of the _gitlabUrl string.
   * 
   * @returns Value of _gitlabUrl.
   */
  public get gitlabUrl(): string {
    return this._gitlabUrl;
  }

  /**
   * Sets the value of the _gitlabUrl string.
   * 
   * @param url - URL to set as the new value.
   */
  public set gitlabUrl(url: string) {
    this._gitlabUrl = url;
  }

  /**
   * Gets the value of the _privateToken string.
   * 
   * @returns Value of _privateToken.
   */
  public get privateToken(): string {
    return this._privateToken;
  }

  /**
   * Sets the value of the _privateToken string.
   * 
   * @param token - Token to set as the new value.
   */
  public set privateToken(token: string) {
    this._privateToken = token;
  }

  /**
   * Gets an observable stream of the `_projectPath` reactive string.
   * 
   * @returns Observable emitting `_projectPath` changes.
   */
  public get projectPath$(): Observable<string> {
    return this._projectPath.asObservable();
  }

  /**
   * Gets the value of the _projectPath string.
   * 
   * @returns Value of _projectPath.
   */
  public get projectPath(): string {
    return this._projectPath.value;
  }

  /**
   * Sets the value of the _projectPath string.
   * 
   * @param path - Path to set as the new value.
   */
  public set projectPath(path: string) {
    this._projectPath.next(path);
  }

  /**
   * Gets the value of the `_branchName` string.
   * 
   * @returns Value of `_branchName`.
   */
  public get branchName(): string {
    return this._branchName;
  }

  /**
   * Sets the value of the `_branchName` string.
   * 
   * @param name - Name to set as the new value.
   */
  public set branchName(name: string) {
    this._branchName = name;
  }

  /**
   * Gets an observable stream of the `_lastCommitId` reactive string.
   * 
   * @returns Observable emitting `_lastCommitId` changes.
   */
  public get lastCommitId$(): Observable<string> {
    return this._lastCommitId.asObservable();
  }

  /**
   * Gets the value of the `_lastCommitId` string.
   * 
   * @returns Value of `_lastCommitId`.
   */
  public get lastCommitId(): string {
    return this._lastCommitId.value;
  }

  /**
   * Sets the value of the `_lastCommitId` string.
   * 
   * @param id - Id to set as the new value.
   */
  public set lastCommitId(id: string) {
    this._lastCommitId.next(id);
  }
}
