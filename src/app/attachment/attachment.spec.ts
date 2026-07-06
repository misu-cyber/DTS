import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attachment } from './attachment';

describe('Attachment', () => {
  let component: Attachment;
  let fixture: ComponentFixture<Attachment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attachment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Attachment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
