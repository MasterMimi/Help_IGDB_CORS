import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GameplayGame } from 'src/app/models/API-Models';
import { GameplaysService } from 'src/app/services/gameplays.service';

@Component({
	selector: 'app-games-by-progress',
	templateUrl: './games-by-progress.component.html',
	styleUrls: ['./games-by-progress.component.scss'],
})
export class GamesByProgressComponent implements OnInit {

	constructor(
		public router: Router,
		public gameplaysService: GameplaysService,
		public alertController : AlertController
	){}

	ngOnInit(){
		this.gameplaysService.loadProgressGames('Jogando');
	}

	@Input() progressToShow: string;

	public redirectToChosenPlay(gameplayGame: GameplayGame){
		this.gameplaysService.chosenGameplay = gameplayGame;
		this.router.navigate(['gameplay-focusing/play']);
	}
}