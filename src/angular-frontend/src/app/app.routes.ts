import { Routes } from '@angular/router';
import { EditorsLayoutComponent } from './editors/components/editors-layout/editors-layout.component';
import { RunnerLayoutComponent } from './runner/components/runner-layout/runner-layout.component';

/**
 * Defines routes in the application.
 * 
 * Defined routes are:
 * - '' redirects to /editors
 * - /editors displays the text editors
 * - /runner displays the tests runner interface
 */
export const routes: Routes = [
    { path: '', redirectTo: 'editors', pathMatch: 'full' },
    { path: 'editors', component: EditorsLayoutComponent },
    { path: 'runner', component: RunnerLayoutComponent }
];
