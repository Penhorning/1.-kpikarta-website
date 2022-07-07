import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {

  constructor(private _signupService: SignupService, private router: Router) {
    if (!this._signupService.getSignUpSession().token) this.router.navigate(['/login']);
  }

  ngOnInit(): void {
  }

  login() {
    this._signupService.deleteSignUpSession();
  }

}
