import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RepuestosComponent } from './repuestos.component';

describe('RepuestosComponent', () => {
  let component: RepuestosComponent;
  let fixture: ComponentFixture<RepuestosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RepuestosComponent, HttpClientTestingModule, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
