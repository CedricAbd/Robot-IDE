import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerLayoutComponent } from './runner-layout.component';

describe('RunnerLayoutComponent', () => {
  let component: RunnerLayoutComponent;
  let fixture: ComponentFixture<RunnerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunnerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
