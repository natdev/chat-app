import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from './user';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from "@angular/router";
import { Login as L } from '../services/login';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, InputTextModule, CardModule, FloatLabel, ButtonModule, RouterLink,],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  
  private loginService = inject(L);
  private router =  inject(Router)
  user: User = new User('', '');


  async onSubmit() {
    if( await this.loginService.login(this.user.username, this.user.password)) {
      this.router.navigate(['/chat']);
    } else {
      console.log('login failed');
    }
  }
}
