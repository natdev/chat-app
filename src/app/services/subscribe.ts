import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Subscribe {
   private http = inject(HttpClient);
  subscription(username: string, password: string): Observable<any> {
    const url = `${environment.apiUrl}/subscribe`;
    return this.http.post(url, { username, password });
  }
}
