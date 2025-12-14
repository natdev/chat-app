import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message-bubble',
  imports: [CommonModule],
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.css'
})
export class MessageBubble {
  @Input() message: any;
}
