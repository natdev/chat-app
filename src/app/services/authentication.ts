import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Authentication {
  isAuthenticated(): boolean {
    return window.localStorage.getItem('loggedIn') === 'true';
  }
}
