import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { GameplayGame } from 'src/app/models/API-Models';
import { DatabaseService } from 'src/app/services/database.service';
import { GameplaysService } from 'src/app/services/gameplays.service';

@Component({
	selector: 'app-gameplay-details',
	templateUrl: './gameplay-details.component.html',
	styleUrls: ['./gameplay-details.component.scss'],
})
export class GameplayDetailsComponent implements OnInit {
	
	constructor(
		public databaseService : DatabaseService,
		public gameplaysService: GameplaysService,
		public router          : Router,
		public alertController : AlertController,
		public toastController : ToastController
	){}
		
	ngOnInit(){
		this.gameplaysService.gameplayToShow = this.gameplayToShow;
		
		this.gameplaysService.loadGameplayStagesAllStatus();
		this.gameplaysService.restrictViewStagesNumber();
	}

	@Input() gameplayToShow: GameplayGame;

}
