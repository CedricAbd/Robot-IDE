import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatesPanelComponent } from './templates-panel.component';

describe('TemplatesPanelComponent', () => {
  let component: TemplatesPanelComponent;
  let fixture: ComponentFixture<TemplatesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatesPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
