import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BuildGame } from 'src/app/models/API-Models';
import { DatabaseService } from 'src/app/services/database.service';
import { GameplaysService } from 'src/app/services/gameplays.service';

@Component({
	selector: 'app-game-details',
	templateUrl: './game-details.component.html',
	styleUrls: ['./game-details.component.scss'],
})
export class GameDetailsComponent implements OnInit {

	@Input() gameToShow: BuildGame;
	
	constructor(
		public databaseService : DatabaseService,
		public gameplaysService: GameplaysService,
		public router          : Router
	){}

	ngOnInit(){}

	public redirectToSimilarGame(gameId: number){		
		this.router.navigate(['game-searching/' + gameId]);
	}

}
