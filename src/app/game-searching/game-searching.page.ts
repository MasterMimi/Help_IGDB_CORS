import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildGame } from '../models/API-Models';
import { DatabaseService } from '../services/database.service';

@Component({
	selector: 'app-game-searching',
	templateUrl: './game-searching.page.html',
	styleUrls: ['./game-searching.page.scss'],
})
export class GameSearchingPage implements OnInit {

	constructor(
		private route           : ActivatedRoute,
		private databaseService : DatabaseService
	){
		this.game = this.databaseService.allBuildGames.find(
			buildGame => buildGame.gameId == +this.idValue
		);

		if(this.game == null){
			this.game = this.databaseService.similarBuildGames.find(
				buildGame => buildGame.gameId == +this.idValue
			);	
		}

		if(this.game == null){
			this.game = this.databaseService.gameplayBuildGames.find(
				buildGame => buildGame.gameId == +this.idValue
			);
		}

		if(
			this.game.similarGamesIds.length != 0 &&
			this.game.similarBuildGames.length == 0
		){
			this.databaseService.loadSimilarGames(this.game);
		}
	}

	ngOnInit() {
	}

	public idValue = this.route.snapshot.paramMap.get('id');
	public game: BuildGame;

}