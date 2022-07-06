import { Component, Input, OnInit } from '@angular/core';
import { GameplayGameStage, HistoryType } from 'src/app/models/API-Models';
import { DatabaseService } from 'src/app/services/database.service';
import { GameplaysService } from 'src/app/services/gameplays.service';

@Component({
	selector: 'app-stage-details',
	templateUrl: './stage-details.component.html',
	styleUrls: ['./stage-details.component.scss'],
})
export class StageDetailsComponent implements OnInit {

	constructor(
		public gameplaysService: GameplaysService,
		public databaseService: DatabaseService
	){}

	ngOnInit(){
		this.styleColor = this.gameplaysService.getCardStyleNeeded(this.stageToShow);

		this.insertedName = this.stageToShow.name;
		this.insertedDescription = this.stageToShow.description;
	}

	@Input() stageToShow: GameplayGameStage;

	public styleColor: string;

	public insertedName: string;
	public insertedDescription: string;

	public isNameDescriptionDataValid(): boolean{
		if(this.insertedName == '' || this.insertedDescription == ''){
			this.gameplaysService.showErrorToast('O nome e descrição precisam estar preenchidos!');
			return false;
		}
		return true;
	}

	public areInputsDifferent(): boolean{
		return this.didTitleChanged() || this.stageToShow.description != this.insertedDescription;
	}

	public didTitleChanged(){
		return this.stageToShow.name != this.insertedName;
	}

	public saveStage(){
		if(this.isNameDescriptionDataValid()){
			if(this.didTitleChanged()){
				this.gameplaysService.createHistoryItem(this.stageToShow.gameplayGame, HistoryType.TituloStage, this.stageToShow.name, this.insertedName, null);
			}

			this.stageToShow.name = this.insertedName;
			this.stageToShow.description = this.insertedDescription;
			this.gameplaysService.updateStageLastModifiedDate(this.stageToShow);

			this.gameplaysService.showSuccessToast('Salvo!');
			this.gameplaysService.save();
		}
	}


}
