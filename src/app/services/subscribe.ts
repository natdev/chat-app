import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Subscribe {
   private http = inject(HttpClient);
  subscription(username: string, password: string): Observable<any> {
    const url = 'http://localhost:3000/subscribe';
    return this.http.post(url, { username, password });
  }
}
