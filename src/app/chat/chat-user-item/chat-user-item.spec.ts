import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUserItem } from './chat-user-item';

describe('ChatUserList', () => {
  let component: ChatUserItem;
  let fixture: ComponentFixture<ChatUserItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUserItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatUserItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
