import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordsPanelComponent } from './keywords-panel.component';

describe('KeywordsPanelComponent', () => {
  let component: KeywordsPanelComponent;
  let fixture: ComponentFixture<KeywordsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeywordsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeywordsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
