import { Component, OnInit } from '@angular/core';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {

  constructor(private _signupService: SignupService) {
    // Preventing back button in browser
    window.onpopstate = function (e: any) { window.history.forward(); }
  }

  ngOnInit(): void {
  }

  login() {
    this._signupService.deleteSignUpSession();
  }

}
