import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MecanicosComponent } from './mecanicos.component';

describe('MecanicosComponent', () => {
  let component: MecanicosComponent;
  let fixture: ComponentFixture<MecanicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MecanicosComponent, HttpClientTestingModule, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MecanicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
