import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparacionesComponent } from './reparaciones.component';

describe('ReparacionesComponent', () => {
  let component: ReparacionesComponent;
  let fixture: ComponentFixture<ReparacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReparacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReparacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
