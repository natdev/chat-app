import { Injectable } from '@angular/core';
import socket from '../socket';

@Injectable({
  providedIn: 'root'
})
export class Login {
  login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      socket.auth = { username, password };
    if (socket.disconnected) {
      socket.connect();
    }
  socket.on("connect_error", (err) => {
      if(err.message === "authentication error" ) {
        window.localStorage.setItem('loggedIn', 'false');
        socket.disconnect();
        resolve(false);
      }
    });

    
    socket.on('user', (userData:any) => {
      console.log('hello: ', userData);
      
      window.localStorage.setItem('userData', JSON.stringify(userData));
      window.localStorage.setItem('loggedIn', 'true');
      socket.off('user');
      resolve(true);
    });
     
    // socket.on("connect", () => {
      
    //   });
    });
    
  }
}
