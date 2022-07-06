import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Filters } from '../models/API-Models';
import { DatabaseService } from '../services/database.service';
import { FiltersService } from '../services/filters.service';
import { GameplaysService } from '../services/gameplays.service';

@Component({
	selector: 'app-search',
	templateUrl: './search.page.html',
	styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

	constructor(
		public  databaseService : DatabaseService,
		public  gameplaysService: GameplaysService,
		public  filtersService: FiltersService,
		private router          : Router
	){}

	ngOnInit(){
		this.databaseService.resetPages();
	}

	public originalOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
		return 0;
	}

	public filtersEnum = Filters;

	public searchInput: string = '';

	public searchByName(): void{
		this.databaseService.resetPages();
		this.databaseService.resetShownGameplays();
		
		this.databaseService.hasFoundGames = true;

		this.databaseService.resetBuildGames();
		this.databaseService.resetSearch();

		if(this.databaseService.inputName == null || this.databaseService.inputName == ''){
			this.databaseService.currentSearch = '';
		} else {
			this.databaseService.currentSearch += this.databaseService.baseSearch + this.databaseService.inputName + '";'
		}
		
		this.databaseService.getAllGamesFromAPI(
			this.databaseService.getBuildQueryBody()
		);
	}

	public changeCurrentFilter(filterName: string): void{
		this.databaseService.filterName = filterName;
		this.router.navigate(['filter']);
	}

	public redirectToMyGameplays(){
		this.router.navigate(['gameplays/playing-games']);
	}
}
