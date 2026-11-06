import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OrdenesTrabajoComponent } from './ordenes-trabajo.component';

describe('OrdenesTrabajoComponent', () => {
  let component: OrdenesTrabajoComponent;
  let fixture: ComponentFixture<OrdenesTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ OrdenesTrabajoComponent, HttpClientTestingModule, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenesTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
