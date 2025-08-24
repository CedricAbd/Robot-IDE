import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesPanelComponent } from './resources-panel.component';

describe('ResourcesPanelComponent', () => {
  let component: ResourcesPanelComponent;
  let fixture: ComponentFixture<ResourcesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourcesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
