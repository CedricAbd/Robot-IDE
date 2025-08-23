import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorsLayoutComponent } from './editors-layout.component';

describe('EditorsLayoutComponent', () => {
  let component: EditorsLayoutComponent;
  let fixture: ComponentFixture<EditorsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
