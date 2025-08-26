import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitlabDialogComponent } from './gitlab-dialog.component';

describe('GitlabDialogComponent', () => {
  let component: GitlabDialogComponent;
  let fixture: ComponentFixture<GitlabDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GitlabDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GitlabDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
