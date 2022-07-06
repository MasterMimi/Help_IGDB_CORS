import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { AgeRating, BuildGame, Company, Cover, Franchise, Game, Genre, InvolvedCompany, Platform } from '../models/API-Models';
import { TokenService } from './token.service';


@Injectable({
	providedIn: 'root'
})
export class DatabaseService {

	constructor(
		public http             : HttpClient,
		public tokenService     : TokenService,
		public storage          : Storage,
		public loadingController: LoadingController
	){}

	public haveAppOpened: boolean = false;
	public hasFoundGames: boolean = true;

	public loadingGames: boolean = true;
	public loadingSimilarGames: boolean = false;

	public baseFields: string = 
		'fields id, genres, name, first_release_date, cover, age_ratings, franchises, platforms, screenshots,' +
		'total_rating, similar_games, summary, game_modes, involved_companies;';
	public currentFields: string = this.baseFields;
	public baseWhere: string = 'where ';
	public currentWhere: string = '';
	public baseSearch: string = 'search "';
	public currentSearch: string = '';
	public baseLimit: string = 'limit 15;'
	public currentLimit: string = this.baseLimit;
	public baseOffset: number = 0;
	public currentOffset: number = this.baseOffset;

	public inputName: string;
	public filterName: string;

	public allGamesLength: number;
	public allGames: Game[] = [];
	public similarGames: Game[] = [];

	public allGenres: Genre[] = [];
	public allPlatforms: Platform[] = [];
	public allAgeRatings: AgeRating[] = [];
	public allCompanies: Company[] = [];
	public allFranchises: Franchise[] = [];
	
	public coversToBeLoaded: Cover[] = [];
	public franchisesToBeLoaded: Franchise[] = [];
	public involvedCompanyIdToCompanyId: Map<number, number> = new Map();

	public ageRatingsCategoryMap: Map<number, string> = new Map([
		[1, 'ESRB'],
		[2, 'PEGI'],
		[3, 'CERO'],
		[4, 'USK'],
		[5, 'GRAC'],
		[6, 'CLASS_IND'],
		[7, 'ACB']
	]);
	public ageRatingsRatingMap: Map<number, string> = new Map([
		[1, 'Three'],	
		[2, 'Seven'],	
		[3, 'Twelve'],	
		[4, 'Sixteen'],	
		[5, 'Eighteen'],	
		[6, 'RP'],	
		[7, 'EC'],	
		[8, 'E'],	
		[9, 'E10'],	
		[10, 'T'],	
		[11, 'M'],	
		[12, 'AO'],	
		[13, 'A'],	
		[14, 'B'],	
		[15, 'C'],	
		[16, 'D'],	
		[17, 'Z'],	
		[18, '0'],	
		[19, '6'],	
		[20, '12'],	
		[21, '18'],	
		[22, 'ALL'],	
		[23, 'Twelve'],	
		[24, 'Fifteen'],	
		[25, 'Eighteen'],	
		[26, 'TESTING'],	
		[27, 'L'],	
		[28, 'Ten'],	
		[29, 'Twelve'],	
		[30, 'Fourteen'],	
		[31, 'Sixteen'],	
		[32, 'Eighteen'],	
		[33, 'G'],	
		[34, 'PG'],	
		[35, 'M'],	
		[36, 'MA15'],	
		[37, 'R18'],	
		[38, 'RC']
	]);

	public dateTimeFormat: Intl.DateTimeFormatOptions = {
		hour  : '2-digit',
		minute: '2-digit',
		second: '2-digit',
		day   : '2-digit',
		month : '2-digit',
		year  : 'numeric'
	};

	public dateFormat: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}

	public allBuildGames: BuildGame[] = [];
	public similarBuildGames: BuildGame[] = [];
	public gameplayBuildGames: BuildGame[] = [];
	public buildGamesToShowMap: Map<Number, BuildGame[]> = new Map();

	private httpHeaders: HttpHeaders;
	private body;

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

	public getBuildQueryBody(): string{
		return 	this.currentFields +
				this.currentWhere +
				this.currentSearch +
				this.currentLimit +
				'offset ' + this.currentOffset + ';';
	}
	
	public async getAllGamesFromAPI(body: string){
		await this.createLoading('Aguarde...');
		this.presentLoading();

		this.loadingGames = true;	
		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());

			console.log(body)
		let auxAllGames: Game[] = [];

		let result;
		try{
			result = await this.http.post<Game>(
				this.tokenService.getBaseURL() + 'games', 
				body, 
				{
					headers: this.httpHeaders
				}
			).toPromise();
			// console.log(result)
		}catch(error){
			console.log(error);
		}

		auxAllGames.push(...result);
		this.allGames = auxAllGames;
		this.allGamesLength = this.allGames.length; 
		
		this.buildGamesToShowMap.set(this.currentPage, []);
		await this.buildAppGames(this.allGames, true, null, false);

		this.setHasFoundGames();

		this.dismissLoading();
	}

	public resetBuildGames(){
		this.allGamesLength = 0;
		this.allGames = []; 
		this.allBuildGames = [];
	}

	public resetSearch(){
		this.currentOffset = 0;
		this.currentSearch = '';
	}

	public async buildCoversToBeLoaded(games: Game[]){
		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());

		let allGameIdsQuery: string = '';
		let result;
		for(let game of games){
			if(game['cover'] != null){
				allGameIdsQuery += game['cover'] + ','
			}
		}
		allGameIdsQuery = allGameIdsQuery.substring(0, allGameIdsQuery.length - 1);

		if(allGameIdsQuery.length != 0){
			this.body = 
				'fields url, game; ' + 
				'where id = (' + allGameIdsQuery + '); ' +
				'limit 500;';
			
			try{
				result = await this.http.post<Cover>(
					this.tokenService.getBaseURL() + 'covers', 
					this.body, 
					{
						headers: this.httpHeaders
					}
				).toPromise();
				// console.log(result);
			}catch(error){
				console.log(error);
			}
			
			await this.coversToBeLoaded.push(...result);
		}
	}

	public async buildInvolvedCompaniesToBeInserted(games: Game[]){
		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());

		let allInvolvedCompaniesIds: string = '';
		let result;
		for(let game of games){
			if(game['involved_companies'] != null){
				for (let involvedId of game['involved_companies']) {
					allInvolvedCompaniesIds += involvedId + ','
				}
			}
		}
		allInvolvedCompaniesIds = allInvolvedCompaniesIds.substring(0, allInvolvedCompaniesIds.length - 1);
		
		if(allInvolvedCompaniesIds.length != 0){
			this.body = 
				'fields company; ' +
				'where id = (' + allInvolvedCompaniesIds + '); ' +
				'limit 500;';

			try{
				result = await this.http.post<InvolvedCompany>(
					this.tokenService.getBaseURL() + 'involved_companies', 
					this.body, 
					{
						headers: this.httpHeaders
					}
				).toPromise();
				// console.log(result);
			}catch(error){
				console.log(error);
			}

			for(let queryItem of result){
				this.involvedCompanyIdToCompanyId.set(queryItem['id'], queryItem['company']);
			}
		}
	}

	public async buildAppGames(allGames: Game[], insertIntoAll: boolean, baseGameIfFalse: BuildGame, loadingFromGameplays: boolean){
		await this.buildCoversToBeLoaded(this.allGames);
		await this.buildInvolvedCompaniesToBeInserted(this.allGames);

		for (let game of allGames) {
			let cover : Cover = this.coversToBeLoaded.find(cover => cover.game == game['id']);
			let buildGame: BuildGame = {
				gameId              : game['id'],
				gameName            : game['name'],
				formattedName		: game['name'].substring(0, 25) + " [...]",
				releaseDate         : this.getReleaseDate(game['first_release_date']),
				releaseDateFormatted: null,
				genreNames          : [],
				coverURL            : cover != null ?
									  cover.url : 
									 './assets/images/broken-cover.png',
				rating				: 	game['total_rating'] == null ? 'N/A' : 
										game['total_rating'] < 10 ? game['total_rating'].toPrecision(3) : 
										game['total_rating'] == 100 ? game['total_rating'].toPrecision(5) : 
										game['total_rating'].toPrecision(4),
				platforms			: [],
				companies			: [],
				franchises			: [],
				description			: game['summary'],
				ageRatings			: [],
				similarGamesIds		: [],
				similarBuildGames 	: []
			};

			buildGame.releaseDateFormatted = this.formatDate(buildGame.releaseDate);
			if(game['genres'] == null){
				buildGame.genreNames.push("Sem gênero registrado");
			} else {
				for(let genreId of game['genres']){
					buildGame.genreNames.push(
						this.allGenres.find(
							genre => +genreId === genre['id']
						)['name']
					);
				}
			}

			if(game['platforms'] == null){
				buildGame.platforms.push("Sem plataforma registrada");
			} else {
				for(let platformId of game['platforms']){
					buildGame.platforms.push(
						this.allPlatforms.find(
							platform => +platformId === platform['id']
						)['name']
					);
				}
			}

			if(game['involved_companies'] == null){
				buildGame.companies.push("Sem empresa registrada");
			} else {
				for(let involvedId of game['involved_companies']){
					try{
						buildGame.companies.push(
							this.allCompanies.find(
								company => company.id == this.involvedCompanyIdToCompanyId.get(involvedId)
							).name
						);
					} catch (error){
						console.log(error);
						// console.log(involvedId);
						// console.log(this.involvedCompanyIdToCompanyId)
						// console.log(this.involvedCompanyIdToCompanyId.get(involvedId))
						// console.log(this.allCompanies.find(company => company.id == this.involvedCompanyIdToCompanyId.get(involvedId)))
					}
				}
			}

			if(game['franchises'] == null){
				buildGame.franchises.push("Sem franquia registrada");
			} else {
				for(let franchiseId of game['franchises']){
					buildGame.franchises.push(
						this.allFranchises.find(
							franchise => franchise.id == franchiseId
						).name
					);
				}
			}

			if(game['age_ratings'] == null){
				buildGame.ageRatings.push("Sem classificação etária registrada");
			} else {
				for(let ratingId of game['age_ratings']){
					let ageRating = this.allAgeRatings.find(
						rating => rating.id == ratingId
					);

					try{
						buildGame.ageRatings.push(
							this.ageRatingsCategoryMap.get(ageRating['category']) + ': ' +	//ATENCAO: Cannot read properties of undefined (reading 'category')
							this.ageRatingsRatingMap.get(ageRating['rating'])
						);
					} catch(error){
						console.log(error)
						// console.log(ratingId)
					}
				}

			}

			let i = 0;
			if(game['similar_games'] != null){
				for (let gameId of game['similar_games']) {
					buildGame.similarGamesIds.push(gameId)
					i++;

					if(i == 3){
						break;
					}
				}
			}

			if(!loadingFromGameplays){
				if(insertIntoAll){
					this.buildGamesToShowMap.get(this.currentPage).push(buildGame);
					this.allBuildGames.push(buildGame);
				} else {
					this.similarBuildGames.push(buildGame)
					baseGameIfFalse.similarBuildGames.push(buildGame);
				}
			} else {
				this.gameplayBuildGames.push(buildGame);
			}
		}

		if(!loadingFromGameplays){
			if(insertIntoAll){
				this.loadingGames = false;
			} else {
				this.loadingSimilarGames = false;
			}
		}
	}

	public async loadSimilarGames(buildGame: BuildGame){
		await this.createLoading('Aguarde...');
		this.presentLoading();
		if(buildGame.similarGamesIds != null && buildGame.similarGamesIds.length != 0){
			this.loadingSimilarGames = true;
			let notFoundGameIds: number[] = [];
			
			for(let id of buildGame.similarGamesIds){
				let game = this.allBuildGames.find(
					game => game.gameId == id
				);
				if(game != null){
					buildGame.similarBuildGames.push(game)
					continue;
				} else {
					game = this.similarBuildGames.find(
						game => game.gameId == id
					);
					if(game != null){
						buildGame.similarBuildGames.push(game)
					} else {
						notFoundGameIds.push(id)
					}
				}
			}

			if(notFoundGameIds.length != 0){
				this.httpHeaders = new HttpHeaders()
					.set('Client-ID', this.tokenService.getClientID())
					.set('Authorization', 'Bearer ' + this.tokenService.getToken());

				let allGameIdsQuery: string = '';
				
				for(let id of notFoundGameIds){
					allGameIdsQuery += id + ','
				}
				allGameIdsQuery = allGameIdsQuery.substring(0, allGameIdsQuery.length - 1);
				
				if(allGameIdsQuery.length != 0){
					this.body = this.baseFields;
					
					let result;
					try{
						result = await this.http.post<Game>(
							this.tokenService.getBaseURL() + 'games', 
							this.body + 'where id = (' + allGameIdsQuery + ');',
							{
								headers: this.httpHeaders
							}
						).toPromise();
						// console.log(result)
					}catch(error){
						console.log(error);
					}

					this.similarGames = [];
					this.similarGames.push(...result);
					await this.buildInvolvedCompaniesToBeInserted(this.similarGames);
					await this.buildCoversToBeLoaded(this.similarGames);
					
					await this.buildAppGames(this.similarGames, false, buildGame, false);
				}
			} else {
				this.loadingSimilarGames = false;
			}
		}
		this.dismissLoading();
	}

	
	public async getInvolvedCompaniesByCompaniesIds(idsToSearch: string){
		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());

		let result;
		let involvedCompaniesToReturn: InvolvedCompany[] = [];
		let offset = 0;
		let lastRequestLength = 1;
		while(lastRequestLength != 0){
			this.body = 
				'fields id, company; ' +
				'where company = (' + idsToSearch + '); ' +
				'limit 500;'+
				'offset ' + offset + ';'

			try{
				result = await this.http.post<InvolvedCompany>(
					this.tokenService.getBaseURL() + 'involved_companies', 
					this.body, 
					{
						headers: this.httpHeaders
					}
				).toPromise();
				// console.log(result);
			}catch(error){
				console.log(error);
			}

			involvedCompaniesToReturn.push(...result);
			// console.log(involvedCompaniesToReturn);
			
			offset += 500;
			lastRequestLength = result.length;
		}

		return involvedCompaniesToReturn;
	}
	
	//MÉTODOS PARA PEGAR TUDO DE ALGUMA COISA
	public getAllGamesFromStorage(){
		let auxAllGames: Game[] = [];
		this.storage.get('allGames').then(
			gameAPI =>  auxAllGames.push(...gameAPI)
		);
		this.allGames = auxAllGames;
	}

	public setAllGamesToStorage(){
		this.storage.set('allGames', this.allGames);
	}

	//GENEROS - Deixar no storage
	public async getAllGenresFromAPI(){
		let result;
		let auxAllGenres: Genre[] = [];

		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());
		this.body = 'fields name; limit 500;'

		try{
			result = await this.http.post<Genre>(
				this.tokenService.getBaseURL() + 'genres',
				this.body, 
				{
					headers: this.httpHeaders
				}
			).toPromise();
			// console.log(result);
		}catch(error){
			console.log(error);
		}

		auxAllGenres.push(...result);
		this.storage.set('genres', auxAllGenres);
	}

	//PLATFORMS - Deixar no storage
	public async getAllPlatformsFromAPI(){
		let result;
		let auxAllPlatforms: Platform[] = [];

		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());
		this.body = 'fields name; limit 500;'
		try{
			result = await this.http.post<Platform>(
				this.tokenService.getBaseURL() + 'platforms', 
				this.body, 
				{
					headers: this.httpHeaders
				}
			).toPromise();
			// console.log(result);
		}catch(error){
			console.log(error);
		}

		auxAllPlatforms.push(...result);
		this.storage.set('platforms', auxAllPlatforms);
	}

	//AGE RATINGS - Deixar no storage
	public async getAllAgeRatingsFromAPI(){
		console.log('inicio getAllAgeRatingsFromAPI');
		
		let result;
		let auxAllAgeRatings: AgeRating[] = [];

		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken())
			.set('Access-Control-Allow-Origin', '*');

		let offset = 0;
		let lastRequestLength = 1;
		while(lastRequestLength != 0){
			this.body = 
				'fields category, rating;' +
				'limit 500;' +
				'offset ' + offset + ';'
			try{
				result = await this.http.post<AgeRating>(
                    this.tokenService.getBaseURL() + 'age_ratings',
					this.body, 
					{
						headers: this.httpHeaders
					}
				).toPromise();
				// console.log(result);
			}catch(error){
				console.log(error);
			}
			auxAllAgeRatings.push(...result);
			
			offset += 500;
			lastRequestLength = result.length;
		}

		this.storage.set('age-ratings', auxAllAgeRatings);

		console.log('fim getAllAgeRatingsFromAPI');

	}

	//COMPANIES - deixar no storage
	public async getAllCompaniesFromAPI(){
		let result;
		let auxAllCompanies: Company[] = [];

		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());

		let offset = 0;
		let lastRequestLength = 1;
		while(lastRequestLength != 0){
			this.body = 
				'fields name;' +
				'limit 500;' +
				'offset ' + offset + ';'
			try{
				result = await this.http.post<Company>(
					this.tokenService.getBaseURL() + 'companies', 
					this.body, 
					{
						headers: this.httpHeaders
					}
				).toPromise();
				// console.log(result);
			}catch(error){
				console.log(error);
			}
			auxAllCompanies.push(...result);
			
			offset += 500;
			lastRequestLength = result.length;
		}

		this.storage.set('companies', auxAllCompanies);
	}


	//FRANCHISES - deixar no storage
	public async getAllFranchisesFromAPI(){
		let result;
		let auxAllFranchises: Company[] = [];

		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.tokenService.getClientID())
			.set('Authorization', 'Bearer ' + this.tokenService.getToken());

		let offset = 0;
		let lastRequestLength = 1;
		while(lastRequestLength != 0){
			this.body = 
				'fields name;' +
				'limit 500;' +
				'offset ' + offset + ';'
			try{
				result = await this.http.post<Franchise>(
					this.tokenService.getBaseURL() + 'franchises', 
					this.body, 
					{
						headers: this.httpHeaders
					}
				).toPromise();
				// console.log(result);
			}catch(error){
				console.log(error);
			}
			auxAllFranchises.push(...result);
			
			offset += 500;
			lastRequestLength = result.length;
		}

		this.storage.set('franchises', auxAllFranchises);
	}

	public getReleaseDate(secondsTo1970: number): Date{
		if(secondsTo1970 == null){
			return null;
		}
		let date = new Date('1970-01-02');
		date.setDate(date.getDate() + (secondsTo1970 / 60 / 60 / 24));

		return date;
	}

	public formatDate(date: Date): string{
		if(date == null){
			return "Sem data registrada";
		}
		return 	date.toLocaleDateString('pt-BR', this.dateFormat);
	}

	public delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}


	public setHasFoundGames(){
		if(this.allGamesLength == 0){
			this.hasFoundGames = false;
		} else {
			this.hasFoundGames = true;
		}
	}

	public loadMore(): void{
		if(this.buildGamesToShowMap.get(this.currentPage) == null){
			this.hasFoundGames = true;

			this.loadingGames = true;
			this.currentOffset += 15;
			this.getAllGamesFromAPI(
				this.getBuildQueryBody()
			);
		}
	}

	public currentPage: number = 1;
	
	public backPage(){
		if(this.currentPage > 1){
			this.currentPage--;
			this.hasFoundGames = true;
		}
	}
	
	public forwardPage(){
		let pageGames: BuildGame[] = this.buildGamesToShowMap.get(this.currentPage);
		let postPageGames: BuildGame[] = this.buildGamesToShowMap.get(this.currentPage + 1);
		
		if(
			pageGames != null && 
			pageGames.length != 0 && 
			(postPageGames == null || postPageGames.length != 0)
		){
			this.currentPage++;
			this.loadMore();
		} else {
			if(postPageGames == null){
				this.hasFoundGames = false;
			}		
		}		
	}

	public resetShownGameplays(){
		this.buildGamesToShowMap = new Map();
	}

	public resetPages(){
		this.currentPage = 1;
	}
}

