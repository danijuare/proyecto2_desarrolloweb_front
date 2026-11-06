import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DiagnosticosComponent } from './diagnosticos.component';

describe('DiagnosticosComponent', () => {
  let component: DiagnosticosComponent;
  let fixture: ComponentFixture<DiagnosticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DiagnosticosComponent, HttpClientTestingModule, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
