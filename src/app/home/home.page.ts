import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../services/token.service';

import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { LoadingController } from '@ionic/angular';
import { GameplaysService } from '../services/gameplays.service';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
	constructor(
		public http             : HttpClient,
		public tokenService     : TokenService,
		public databaseService  : DatabaseService,
		public gameplaysService : GameplaysService,
		public storage          : Storage,
		public router           : Router,
		public loadingController: LoadingController
	){}

	async ngOnInit(){
		if(!this.databaseService.haveAppOpened){
			await this.createLoading('Carregando informações necessárias, aguarde...');
			this.presentLoading();

			await this.tokenService.requireTokenFromAPI();

			if(await this.isStorageCreated()){
				console.log('ja tem storage')
				
				await this.getAllStorageData();

				this.updateAllStorageData();
				
				await this.gameplaysService.loadAllGameplaysToShowMap();
			} else {
				console.log('nao tem storage')
				
				try{
					await this.storage.get('gameplays').then(
						gameplay => this.gameplaysService.allGameplays.push(...gameplay)
					);
				} catch (error){
					this.storage.set('gameplays', []);
				}
				await this.databaseService.getAllAgeRatingsFromAPI();
				await this.databaseService.getAllGenresFromAPI();
				await this.databaseService.getAllPlatformsFromAPI();
				await this.databaseService.getAllFranchisesFromAPI();
				await this.databaseService.getAllCompaniesFromAPI();

				await this.gameplaysService.loadAllGameplaysToShowMap();

				await this.getAllStorageData();
			}
			
			await this.databaseService.getAllGamesFromAPI(
				this.databaseService.getBuildQueryBody()
				);
			await this.gameplaysService.getGameplayGamesInfoFromAPI();

			this.databaseService.haveAppOpened = true;

			this.dismissLoading();
		}
	}

	public async updateAllStorageData(){
		await this.databaseService.getAllAgeRatingsFromAPI();
		await this.databaseService.getAllGenresFromAPI();
		await this.databaseService.getAllPlatformsFromAPI();
		await this.databaseService.getAllFranchisesFromAPI();
		await this.databaseService.getAllCompaniesFromAPI();
		
		this.getAllStorageData();
	}

	public async getAllStorageData(){
		console.log('inicio getAllStorageData')

		this.gameplaysService.allGameplays = [];
		try{
			await this.storage.get('gameplays').then(
				gameplay => this.gameplaysService.allGameplays.push(...gameplay)
			);
		} catch (error){}

		this.databaseService.allGenres = [];
		await this.storage.get('genres').then(
			genre => this.databaseService.allGenres.push(...genre)
		);

		this.databaseService.allPlatforms = [];
		await this.storage.get('platforms').then(
			platform => this.databaseService.allPlatforms.push(...platform)
		);

		this.databaseService.allFranchises = [];
		await this.storage.get('franchises').then(
			franchise => this.databaseService.allFranchises.push(...franchise)
		);

		this.databaseService.allAgeRatings = [];
		await this.storage.get('age-ratings').then(
			ageRating => this.databaseService.allAgeRatings.push(...ageRating)
		);

		this.databaseService.allCompanies = [];
		await this.storage.get('companies').then(
			company => this.databaseService.allCompanies.push(...company)
		);

		console.log('fim getAllStorageData')
		
	}

	public async isStorageCreated(){
		return (await this.storage.keys()).length >= 5;
	}

	public redirectToGameSearching(){
		this.router.navigate(['search']);
	}

	public redirectToMyGameplays(){
		this.gameplaysService.setComingFromSearch(false);
		this.router.navigate(['gameplays/playing-games']);
	}

	public loading: HTMLIonLoadingElement;

	public async createLoading(messageToShow: string){
		this.loading = await this.loadingController.create({
			message : messageToShow,
			cssClass: 'loading-info-style'
		});
	}

	public async dismissLoading(){
		this.loading.dismiss();
	}

	public async presentLoading(){
		await this.loading.present();
	}
}