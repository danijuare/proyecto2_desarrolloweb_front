import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EstadosAccionComponent } from './estados-accion.component';

describe('EstadosAccionComponent', () => {
  let component: EstadosAccionComponent;
  let fixture: ComponentFixture<EstadosAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EstadosAccionComponent, HttpClientTestingModule, RouterTestingModule ]
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
