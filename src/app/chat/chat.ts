import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ChatUserItem } from './chat-user-item/chat-user-item';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ChangeEvent, CKEditorComponent, CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, Bold, Essentials, Italic, Paragraph, Emoji, Mention } from 'ckeditor5';
import { Howl } from 'howler';
import { MessageBubble } from './message-bubble/message-bubble';
import { FormsModule } from "@angular/forms";
import { socket as s } from '../socket';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatUserItem, ButtonModule, AvatarModule, CKEditorModule, MessageBubble, FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements  OnInit {
  @ViewChild( 'editor' ) editorComponent: CKEditorComponent | undefined;
  @ViewChild('messageContainer') messageContainer: any;
  @ViewChild('localVideoContainer') localVideoContainer: any;
  @ViewChild('remoteVideoContainer') remoteVideoContainer: any;

  items: {item: number}[] = [{item: 1}, {item: 2}, {item: 3}];
  users:any[] = [];
  licenseKey: string = 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTQ1Mjc5OTksImp0aSI6ImRjY2EwZWNmLTUyNGYtNDNlNS04MTI3LTVlY2Y3OTRhYmJlZiIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIl0sInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJiYmQ3OTYxNiJ9.vILjWOT1wpGW2rqizkAviZip39A4whd-VcXOGZZ19TTK6AjSfLGLxayIDBbtFg9fdGrZ8X1BWgHOBqno_zSiEw';
  messageBubbles: any[] = [];
  private socket = s;
  private router =  inject(Router);
  private pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});
  private pendingCandidates: RTCIceCandidateInit[] = [];
  public ringTones = new Howl({
    src: ['/assets/pickup.mp3'],
    loop: true,
    volume: 0.5
  });
  public mediaStreamConstraints = { video: true };
  public localStream: MediaStream | null = null;
  public isCalling: boolean = false;
  public isCalled: boolean = false;
  public isPickingCall: boolean = false;
  public currentUser = JSON.parse(window.localStorage.getItem('userData') || '{}');
  public Editor = ClassicEditor;
  public editorData = '';
  public message = '';
	public config = {
		licenseKey: 'GPL', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, Emoji, Mention ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'emoji' ]
	}
  public selectedUser: any = null;

   constructor() {
    const loggedIn = window.localStorage.getItem('loggedIn') === 'true';
      this.createPeerConnection();
    if (loggedIn && this.socket.disconnected) {
      this.socket.auth = {isAuthenticated: loggedIn, userId: JSON.parse(window.localStorage.getItem('userData') || '{}').id, token: JSON.parse(window.localStorage.getItem('userData') || '{}').token };
      this.socket.connect();
    }
  }

  ngOnInit(){
    this.getUsers();
    this.getOtherUserOnlineStatus();
    this.receiveMessage();
    this.initWebRTCSignaling();
    this.socket.on('webrtc_hang_up', () => {
      console.log('Remote hung up');
      this.deactivateVideoTracks();
      this.createPeerConnection();
    });
    this.socket.emit('get_users');
  }

  private createPeerConnection() {
  this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  this.pc.ontrack = (event) => {
    const [remoteStream] = event.streams;
    this.remoteVideoContainer.nativeElement.srcObject = remoteStream;
  };

  this.pc.onicecandidate = (event) => {
    if (event.candidate && this.selectedUser?.socketId) {
      this.socket.emit('webrtc_ice_candidate', {
        candidate: event.candidate.toJSON(),
        to: this.selectedUser.socketId
      });
    }
  };

  this.pendingCandidates = [];
}


  private async flushCandidates() {
  if (!this.pc.remoteDescription) return;
  for (const c of this.pendingCandidates) {
    await this.pc.addIceCandidate(new RTCIceCandidate(c));
  }
  this.pendingCandidates = [];
}


  public getEditor() {
		return this.editorComponent?.editorInstance;
	}

  deactivateVideoTracks() {
    // 1) Stopper les tracks locales
  if (this.localStream) {
    this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    this.localStream = null;
  }

  // 2) Nettoyer les vidéos dans le DOM
  if (this.localVideoContainer?.nativeElement) {
    this.localVideoContainer.nativeElement.srcObject = null;
  }
  if (this.remoteVideoContainer?.nativeElement) {
    this.remoteVideoContainer.nativeElement.srcObject = null;
  }

  // 3) Fermer la RTCPeerConnection
  if (this.pc) {
    this.pc.close();
  }

  // 4) Recréer une nouvelle RTCPeerConnection pour un futur appel
  this.pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  });


  this.isCalled = false;
  this.isCalling = false;
  }

  getMessages(){
    this.currentUser.otherUserId = this.selectedUser.id
    this.socket.emit('messages', this.currentUser);

    this.socket.on('messages', (messages) => {
      const msgs = messages?.map((message: any) => {
        if(message.user_id === this.currentUser.id) {
          message.fromSelf = true;
        } else {
          message.fromSelf = false;
        }

        return message
      });
      this.messageBubbles = [];
      msgs.forEach((msg: any) => {
        this.messageBubbles.push({message: msg.message, fromSelf: msg.fromSelf});
      });
    });
  }

  getMessage({ editor }: ChangeEvent){
    this.message = editor.getData();
  }

  receiveMessage(){
    this.socket.on('private message', (content) => {
      this.messageBubbles.push({message: content.fullMessage.message, fromSelf: false});
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  getUsers(){
    this.socket.off('users');
    this.socket.on('users',(users:any[])=> {
      console.log(users);
      
        this.users = users;
    });
  }

  getOtherUserOnlineStatus(){
    this.socket.on('user_connected', (userStatus: any) => {
      this.otherUserOnlineStatusChange(userStatus);
    });

    this.socket.on('other_user_disconnected', (user:any) => {
      if(!user.isOnline){
        this.otherUserOnlineStatusChange(user);
      }
    });
  }

  otherUserOnlineStatusChange(userStatus: any){
    this.users = this.users.map(user => {
      if(user.id === userStatus.id) {
        user.isOnline = userStatus.isOnline;
        user.socketId = userStatus.socketId;
      }
      return user;
    });
  }


  private initWebRTCSignaling() {
  
  this.receiveOffer();
  
  this.socket.on('webrtc_answer', async (answer: any) => {
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer.sdp));
    await this.flushCandidates();
  });

  this.socket.on('webrtc_ice_candidate', async (data: any) => {
    const candidate = data?.candidate;
    if (!candidate) return;

    // Si remoteDescription pas prête, on stocke
    if (!this.pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }

    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('addIceCandidate error:', e, candidate);
    }
  });


  this.socket.on('webrtc_reject_call', () => {
    console.log('Appel rejeté par l’autre utilisateur.');
    this.pc.close();
    this.isCalled = false;
    navigator.mediaDevices.getUserMedia({ video: false, audio: false });
  });

      this.pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
      
      this.socket.once('webrtc_pick_call', (data: any) => {
        this.socket.off('webrtc_pick_call');
        if(data.pick){
          this.remoteVideoContainer.nativeElement.srcObject = remoteStream;
          this.socket.emit('webrtc_pick_call', { to: this.selectedUser.socketId, pick: true });
            }
          });
        };
    
}

rejectCall(): void {
  this.isPickingCall = false;
  this.isCalled = false;
  this.isCalling = false;
  this.socket.emit('webrtc_reject_call', { to: this.selectedUser.socketId });
}

  gotLocalOnCallMediaStream(mediaStream: any): void {
    this.localStream = mediaStream;
    this.localVideoContainer.nativeElement.srcObject = mediaStream;
    
    
    if(mediaStream.id.length > 0) {
      // Ajouter chaque piste du flux aux connexions peer
      mediaStream.getTracks().forEach((track: any) => {
        this.pc.addTrack(track, mediaStream);
      });
      this.isCalled = true;
      const offer = this.pc.createOffer();
      offer.then((offerDesc) => {
        this.pc.setLocalDescription(offerDesc);
        this.socket.emit('webrtc_offer', {
          sdp: offerDesc,
          to: this.selectedUser.socketId
        });
      });

      // Gérer les candidats ICE sortants
      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('webrtc_ice_candidate', {
            candidate: event.candidate,
            to: this.selectedUser.socketId
          });   
        }
      }
    }
  }

  

  handleLocalMediaStreamError(error: any): void {
  console.log('navigator.getUserMedia error: ', error);
}

  selectUser(user: any){
    this.selectedUser = user;
    this.getMessages();
  }

  sendMessage() {
    this.socket.emit('private message', { content: this.message, to: this.selectedUser.socketId , otherUserId: this.selectedUser.id });
    
    this.messageBubbles.push({message: this.message, fromSelf: true});
    this.getEditor()?.setData('');
    setTimeout(() => this.scrollToBottom(), 100);
  }

  receiveOffer(): void {
  this.socket.on('webrtc_offer', async (offer: any) => {
    this.ringTones.play();
    this.isCalling = true;
    this.selectedUser = this.users.find(user => user.socketId === offer.from);
    
      
        // On ne répond que si la connexion est "stable"
      if (this.pc.signalingState !== 'stable') {
        console.warn('On ignore l’offer car signalingState =', this.pc.signalingState);
        return;
      }
      // console.log(this.localStream);
      
      if (!this.localStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.localStream = stream;
        this.localVideoContainer.nativeElement.srcObject = stream;

        stream.getTracks().forEach((track: any) => {
          this.pc.addTrack(track, stream);
        });
      }

      // Gérer les candidats ICE entrant
      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('webrtc_ice_candidate', {
            candidate: event.candidate,
            to: offer.from
          });
        }
      };

      // (optionnel mais recommandé) s’assurer qu’on a déjà un localStream
      // await this.ensureLocalStream(); // si tu veux aussi envoyer ta vidéo
      const remoteDesc =  new RTCSessionDescription(offer.sdp);
      console.log(remoteDesc);
      
      await this.pc.setRemoteDescription(remoteDesc);
      await this.flushCandidates();

      const answerDesc = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answerDesc);

      this.socket.emit('webrtc_answer', {
        sdp: answerDesc,
        to: offer.from
      });
      
      this.isCalled = true;
      console.log('Answer envoyée');

      // } else {
      //   this.socket.emit('webrtc_reject_call', { to: offer.from });
      // } 
    });
}

onPickCall(choice: boolean){
  this.isPickingCall = choice;
  this.isCalling = false;
  this.isCalled = choice;
  this.ringTones.stop();
  this.socket.emit('webrtc_pick_call', { to: this.selectedUser.socketId, pick: choice });
}

  callWebRtc(): void{
    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
  .then((stream) => this.gotLocalOnCallMediaStream(stream)).catch((error) => this.handleLocalMediaStreamError(error)); 
}

  hangUpCall(): void{
    this.pc.close();
    this.isCalled = false;
    this.deactivateVideoTracks();
    this.socket.emit('webrtc_hang_up', { to: this.selectedUser.socketId });
  }

  onDisconnect(){ ;
    this.socket.emit('user_disconnecting');
    this.socket.on('user_disconnected', (user) => {
      
      if(!user.isOnline){
        this.socket.disconnect();
        window.localStorage.setItem('loggedIn', 'false');
        window.localStorage.removeItem('userData');
        this.router.navigate(['/']);
      }
    });
  }

  scrollToBottom() {
    if(this.messageContainer.nativeElement.scrollHeight > this.messageContainer.nativeElement.clientHeight) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }
}
