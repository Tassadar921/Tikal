import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../shared/services/api.service';
import {TranslationService} from '../shared/services/translation.service';
import {CheckingService} from '../connection/checking.service';
import {ToastService} from '../shared/services/toast.service';
import {SignupComponent} from '../connection/signup/signup.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  @ViewChild(SignupComponent) signupComponent: SignupComponent;

  public retour;

  public waiting = false;

  private token;

  constructor(
    private getVarInURL: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    public translationService: TranslationService,
    public loginService: CheckingService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    await this.translationService.triggerOnLoad(); //new page, needs initialisation
    this.getVarInURL.queryParams.subscribe(async params => { //get token param from URL
      this.retour = await this.apiService.checkResetPasswordToken(params.token);
      if(this.retour.status){
        this.token = params.token;
      }
    });
  }

  submit = async () => {
    this.waiting = true;
    this.retour = await this.apiService.resetPassword(this.token, this.loginService.password);
    await this.toastService.displayToast(this.retour.message, 5000, 'Bottom');
    this.waiting = false;
    await this.router.navigateByUrl('/connection');
  };
}
