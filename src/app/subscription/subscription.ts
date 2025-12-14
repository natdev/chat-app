import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from './user';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Subscribe } from '../services/subscribe';
import { AppComparePassword } from './app-compare-password';
import { Router } from '@angular/router';


@Component({
  selector: 'app-subscription',
  imports: [FormsModule, InputTextModule, CardModule, FloatLabel, ButtonModule, AppComparePassword],
  templateUrl: './subscription.html',
  styleUrl: './subscription.css',
  standalone: true
})
export class Subscription {
user: User = new User('', '');
private router =  inject(Router);
private subscribeService = inject(Subscribe);

  onSubmit() {
    this.subscribeService.subscription(this.user.username, this.user.password).subscribe((response)=>{
      if( response?.isSubcribed ){
        this.router.navigate(['/']);
      }
    })
  }
}
