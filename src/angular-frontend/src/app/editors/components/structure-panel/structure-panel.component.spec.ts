import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructurePanelComponent } from './structure-panel.component';

describe('StructurePanelComponent', () => {
  let component: StructurePanelComponent;
  let fixture: ComponentFixture<StructurePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructurePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructurePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
