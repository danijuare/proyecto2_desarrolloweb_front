import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadosAccionComponent } from './estados-accion.component';

describe('EstadosAccionComponent', () => {
  let component: EstadosAccionComponent;
  let fixture: ComponentFixture<EstadosAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadosAccionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadosAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
