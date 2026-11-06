import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ReparacionesComponent } from './reparaciones.component';

describe('ReparacionesComponent', () => {
  let component: ReparacionesComponent;
  let fixture: ComponentFixture<ReparacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReparacionesComponent, HttpClientTestingModule, RouterTestingModule ]
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
