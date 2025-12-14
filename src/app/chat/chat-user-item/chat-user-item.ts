import { Component, Input, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-chat-user-item',
  imports: [AvatarModule, AvatarGroupModule, OverlayBadgeModule],
  templateUrl: './chat-user-item.html',
  styleUrl: './chat-user-item.css'
})
export class ChatUserItem implements OnInit{
@Input() user: any;
@Input() selectedUser: any;
@Input() currentUser: any;

  ngOnInit(): void {

  }
}
