import { Routes } from '@angular/router';
import { Chat } from './chat/chat';
import { Login } from './login/login';
import { Subscription } from './subscription/subscription';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [{
  path: 'chat',
  component: Chat,
  title: 'Chat',
  canActivate: [authGuard]
},{
  path: 'subscribe',
  component: Subscription,
  title: 'subscribe'
},{
  path: '**',
  component: Login,
  title: 'Login'
}];
