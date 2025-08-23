import { languages } from 'monaco-editor';
import { ParsingResults } from './application-types.model';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GitlabStateService } from '../services/gitlab-state.service';
import { catchError, throwError } from 'rxjs';
import { AuthenticationDialogComponent } from '../../dialogs/components/authentication-dialog/authentication-dialog.component';

/**
 * Defines an IMonarchLanguage for RobotFramework.
 * 
 * The tokenizer handles the following tokens:
 * - Sections (e.g. '*** Settings ***', '*** Variables ***', ...)
 * - Line comments (e.g. '# This is a line comment')
 * - Settings, Test Cases, Tasks, Keywords properties (e.g. 'Documentation', '[Documentation]', ...)
 * - Continuation lines (e.g. '...')
 * - Test Case, Task, Keyword names
 * - Scalar, list, dictionary and environment variables
 * - Booleans (e.g.  'True', 'False')
 * - Robot Framework statements
 * - Double or single quoted strings (e.g. "This is a string", 'This is a string')
 */
export const monarchLanguage: languages.IMonarchLanguage = {
    defaultToken: '',
    tokenizer: {
        root: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Handles sections detection (e.g. '*** Settings ***', '*** Variables ***', ...).
            { include: 'sections' }
        ],

        settingsSection: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Detects the 'Documentation' and 'Metadata' properties and jumps to the documentation state.
            [/(Documentation|Metadata)(\s{2,})([^#]+)/, [
                { token: 'property' },
                { token: '' },
                { token: 'string', next: '@documentation' }
            ]],

            // Detects the other '*** Settings ***' section properties.
            [/(Resource|Variables|Library|Suite Setup|Suite Teardown|Test Setup|Test Teardown|Test Template|Test Timeout|Force Tags|Default Tags)(\s{2,})([^#]+)/, ['property', '', '']],

            // Handles continuation lines (e.g. '...').
            { include: 'continuationLines' },

            // Detects strings between double or simple quotes (e.g. "This is a string", 'This is a string').
            { include: 'strings' },

            // Handles sections detection (e.g. '*** Settings ***', '*** Variables ***', ...).
            { include: 'sections' },
        ],

        variablesSection: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Detects scalar, list, dictionary and environment variables.
            { include: 'variables' },

            // Handles continuation lines (e.g. '...').
            { include: 'continuationLines' },

            // Detects booleans (e.g. 'true', 'false').
            { include: 'booleans' },

            // Detects strings between double or simple quotes (e.g. "This is a string", 'This is a string').
            { include: 'strings' },

            // Handles sections detection (e.g. '*** Settings ***', '*** Variables ***', ...).
            { include: 'sections' }
        ],

        itemsSection: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Detects item name (e.g. Test Case, Task or Keyword name).
            [/^\s*[^\s\*][^#]*/, { token: 'identifier', next: '@item' }],

            // Handles sections detection (e.g. '*** Settings ***, *** Variables ***, ...).
            { include: 'sections' }
        ],

        item: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Detects the '[Documentation]' property and jumps to the documentation state.
            [/(\s+)(\[Documentation\])(\s{2,})([^#]+)/, [
                { token: '' },
                { token: 'property' },
                { token: '' },
                { token: 'string', next: '@documentation' }
            ]],

            // Handles item properties other than '[Documentation]'.
            [/\s*\[(Arguments|Return|Tags|Setup|Teardown|Template|Timeout)\]/, 'property'],

            // Handles continuation lines (e.g. '...').
            { include: 'continuationLines' },

            // Detects scalar, list, dictionary and environment variables.
            { include: 'variables' },

            // Detects booleans (e.g. 'true', 'false').
            { include: 'booleans' },

            // Detects strings between double or simple quotes (e.g. "This is a string", 'This is a string').
            { include: 'strings' },

            // Detects Robot Framework statements.
            [/\b(IF|ELSE|ELSE IF|END|FOR|IN|RANGE|WHILE|BREAK|CONTINUE|TRY|EXCEPT|FINALLY|RETURN)\b/, 'statement'],

            // Jumps back to the items state on dedent.
            [/^[^\s].*$/, { token: '@rematch', next: '@pop' }],
        ],

        commentsSection: [
            // Sets all text as comments.
            [/^.*$/, 'comment'],

            // Handles sections detection (e.g. '*** Settings ***, *** Variables ***, ...).
            { include: 'sections' }
        ],

        lineComments: [
            // Handles line comments (e.g. '# This is a line comment').
            [/#.*$/, 'comment']
        ],

        sections: [
            // Detects the '*** Settings ***' section and jumps to the settingsSection state.
            [/\*{3}\s*Settings\s*\*{3}/, { token: 'section', next: '@settingsSection' }],

            // Detects the '*** Variables ***' section and jumps to the variablesSection state.
            [/\*{3}\s*Variables\s*\*{3}/, { token: 'section', next: '@variablesSection' }],

            // Detects the '*** Test Cases ***', '*** Tasks ***' and '*** Keywords ***' sections and jumps to the itemsSection state.
            [/\*{3}\s*(Test Cases|Tasks|Keywords)\s*\*{3}/, { token: 'section', next: '@itemsSection' }],

            // Detects the '*** Comments ***' section and jumps to the commentsSection state.
            [/\*{3}\s*Comments\s*\*{3}/, { token: 'section', next: '@commentsSection' }]
        ],

        documentation: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Handles continuation lines (e.g. '...').
            [/^(\s*)(\.\.\.)(\s+)([^#]*)(.*)$/, ['', 'property', '', 'string', 'comment']],

            // Detects any indented line that does not start with '...' to jump back to the previous state.
            [/^\s+(?!\.\.\.).*$/, { token: '@rematch', next: '@pop' }],

            // Detects non-indented lines to jump back to the previous state.
            [/^[^\s].*$/, { token: '@rematch', next: '@pop' }],

            // Detects empty lines to jump back to the previous state.
            [/^\s*$/, { token: '@rematch', next: '@pop' }],
        ],

        continuationLines: [
            // Handles line comments (e.g. '# This is a line comment').
            { include: 'lineComments' },

            // Handles continuation lines (e.g. '...').
            [/^(\s*)(\.\.\.)(\s+)/, ['', 'property', { token: '@rematch' }]],

            // Detects scalar, list, dictionary and environment variables.
            { include: 'variables' },

            // Detects booleans (e.g. 'true', 'false').
            { include: 'booleans' },

            // Detects strings between double or simple quotes (e.g. "This is a string", 'This is a string').
            { include: 'strings' }
        ],

        variables: [
            // Detects scalar, list, dictionary and environment variables.
            [/[$@&%]\{[^\}]+\}/, 'variable']
        ],

        booleans: [
            // Detects booleans (e.g. 'true', 'false').
            [/\b(true|false)\b/i, 'boolean']
        ],

        strings: [
            // Detects strings between double quotes (e.g. "This is a string").
            [/\"[^\"]*\"/, 'string'],

            // Detects strings between simple quotes (e.g. 'This is a string').
            [/'[^\']*'/, 'string']
        ]
    }
}

/**
 * Provides an object with empty values for Robot Framework files parsing results.
 */
export const EMPTY_PARSING_RESULTS: ParsingResults = {
    suite_documentation: '',
    suite_setup: '',
    suite_teardown: '',
    imported_resources: [],
    imported_libraries: [],
    imported_variables: [],
    created_variables: {},
    created_test_cases: [],
    created_keywords: []
}

/**
 * Intercepts HTTP responses to catch HTTP 401 errors.
 * 
 * When caught, state is set as non-authenticated and a blocking
 * dialog is opened to prompt the user for credentials.
 * 
 * @param request - Outgoing HTTP request.
 * @param next - Next handler in the interceptor chain.
 * @returns An Observable of the HTTP response.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const dialog = inject(MatDialog);
    const state = inject(GitlabStateService);
    return next(request).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                state.isAuthenticated = false;
                if (!dialog.openDialogs.length) {
                    dialog.open(AuthenticationDialogComponent, {
                        disableClose: true,
                        panelClass: 'dialog'
                    });
                }
            }
            return throwError(() => error); 
        }) 
    )
}
