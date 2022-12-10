import {Component} from '@angular/core';
import {CheckingService} from '../../checking.service';
import {TranslationService} from '../../../shared/services/translation.service';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-nomenclature',
  templateUrl: './nomenclature.component.html',
  styleUrls: ['./nomenclature.component.scss'],
})
export class NomenclatureComponent {

  constructor(
    public checkingService: CheckingService,
    public translationService: TranslationService,
    public modalController: ModalController
  ) { }
  ngOnInit() {}
}
