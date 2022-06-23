import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  open = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private flashmessage: FlashmessageService
  ) { }

  ngOnInit(): void {
  }

  toggle(): void {
    this.open = !this.open;
  }

  logout(): void {
    this.authService.logOut();
    this.flashmessage.userSuccess('Logged out');
    this.router.navigate(['/login']);
  }
}
