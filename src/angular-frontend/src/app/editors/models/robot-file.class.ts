import { BehaviorSubject, Subject, Observable } from "rxjs";
import {editor} from 'monaco-editor';
import { Disposable } from "../../core/models/application-types.model";

/**
 * Represents a Robot Framework file in the application.
 */
export class RobotFile {
    /** The file unique identifier. */
    private readonly _uid: number;

    /** The file reactive name. */
    private readonly _name: BehaviorSubject<string>;

    /** The associated Monaco Editor model. */
    private readonly _model: editor.ITextModel;

    /** A listener for content changes. */
    private readonly _changesListener: Disposable;

    /** A subject to signal content changes. */
    private readonly _onContentChanged = new Subject<void>();

    /** A boolean to indicate the save status. */
    private readonly _isSaved = new BehaviorSubject<boolean>(true);

    /**
     * Creates a new RobotFile instance.
     * 
     * @param uid - File unique identifier.
     * @param initialName - File initial name.
     * @param initialContent - File initial content.
     */
    public constructor(
        uid: number,
        initialName: string,
        initialContent: string = '',
    ) {
        this._uid = uid;
        this._name = new BehaviorSubject<string>(initialName);
        this._model = editor.createModel(initialContent, 'robot-framework');
        this._changesListener = this._model.onDidChangeContent(() => {
            this._onContentChanged.next();
            this._isSaved.next(false);
        });
    }

    /**
     * Gets the file unique identifier.
     * 
     * @returns The unique identifier.
     */
    public get uid(): number {
        return this._uid;
    }

    /**
     * Gets an observable stream of the _name reactive string.
     * 
     * @returns An observable stream emitting _name changes.
     */
    public get name$(): Observable<string> {
        return this._name.asObservable();
    }

    /**
     * Gets the current value of the _name reactive string.
     * 
     * @returns The current value of _name.
     */
    public get name(): string {
        return this._name.value;
    }

    /**
     * Sets the value of the _name reactive string.
     * 
     * @param newName - The new name to set.
     */
    public set name(newName: string) {
        this._name.next(newName);
    }

    /**
     * Gets the file editor.ITextModel.
     * 
     * @returns The file editor.ITextModel.
     */
    public get model(): editor.ITextModel {
        return this._model;
    }

    /**
     * Gets the editor.ITextModel content.
     * 
     * @returns The file content.
     */
    public get content(): string {
        return this._model.getValue();
    }

    /**
     * Sets the editor.ITextModel content.
     * 
     * @param content - The content to set.
     */
    public set content(content: string) {
        this._model.setValue(content);
    }

    /**
     * Gets an observable stream of the _onContentChanged subject.
     * 
     * @returns An observable stream emitting _onContentChanged changes.
     */
    public get onContentChanged$(): Observable<void> {
        return this._onContentChanged.asObservable();
    }

    /**
     * Gets an observable stream of the _isSaved reactive boolean.
     * 
     * @returns An observable stream emitting _isSaved changes.
     */
    public get isSaved$(): Observable<boolean> {
        return this._isSaved.asObservable();
    }

    /**
     * Sets the value of _isSaved to true.
     */
    public markAsSaved(): void {
        this._isSaved.next(true);
    }

    /**
     * Disposes the file.
     */
    public dispose(): void {
        this._model.dispose();
        this._changesListener.dispose();
        this._onContentChanged.complete();
        this._isSaved.complete();
    }
}
