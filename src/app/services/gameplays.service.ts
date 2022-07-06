import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { BuildGame, Game, GameplayGame, GameplayGameStage, GameplayHistory, GameplayStageStatusOptions, GameplayStatusOptions, HistoryType } from '../models/API-Models';
import { Storage } from '@ionic/storage-angular';
import { DatabaseService } from './database.service';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class GameplaysService {

	constructor(
		public  http            : HttpClient,
		public  alertController: AlertController,
		public  storage        : Storage,
		public  databaseService: DatabaseService,
		public  toastController: ToastController,
		private router         : Router,
		public  tokenService    : TokenService
	){}

	ngOnInit(){}

	

	// MÉTODOS GERAIS
	public comingFromSearch = false;
	public save(){
		this.saveGameplaysToStorage(this.allGameplays);
	}

	public saveGameplaysToStorage(auxGameplayGames: GameplayGame[] ){
		this.storage.set('gameplays', auxGameplayGames);
	}

	public updateGameplays(){
		this.saveGameplaysToStorage(this.allGameplays);
		this.updateGameplayLastModifiedDate(this.gameplayToShow);
	}

	public async showErrorToast(messageToShow: string){
		const toast = await this.toastController.create({
			cssClass: 'error-toast-style',
			position: 'bottom',
			message: messageToShow,
			duration: 3000,
			animated: true
		});
		toast.present();
	}

	public async showSuccessToast(messageToShow: string){
		const toast = await this.toastController.create({
			cssClass: 'success-toast-style',
			position: 'bottom',
			message: messageToShow,
			duration: 800,
			animated: true
		});
		toast.present();
	}

	public setComingFromSearch(comingFromSearch){
		this.comingFromSearch = comingFromSearch;
	}

	public returnFromGameplaysPage(){
		if(this.comingFromSearch){
			this.router.navigate(['search']);
		} else {
			this.router.navigate(['home']);
		}
	}

	public createHistoryItem(play: GameplayGame, historyType: HistoryType, oldValue: string, newValue: string, additional: any){
		let now = new Date().toLocaleDateString('pt-BR', this.databaseService.dateTimeFormat);
		switch (historyType) {
			case HistoryType.CriacaoPlay:
				play.history.unshift({
					play: play,
					type: historyType,
					text: 'Gameplay com nome "' + newValue + '" e status "' + additional + '" criada em ' + now + '.'
				});
				break;
		
			case HistoryType.StatusPlay:
				play.history.unshift({
					play: play,
					type: historyType,
					text: 'Status da gameplay modificado de "' + oldValue + '" para "' + newValue + '" em ' + now + '.'
				});
				break;

			case HistoryType.AdicionarStage:
				play.history.unshift({
					play: play,
					type: historyType,
					text: 'Fase com nome "' + newValue + '" e status "' + additional + '" criada em ' + now + '.'
				});
				break;

			case HistoryType.DeletarStage:
				play.history.unshift({
					play: play,
					type: historyType,
					text: 'Fase com nome "' + oldValue + '" deletada em ' + now + '.'
				});
				break;

			case HistoryType.TituloStage:
				play.history.unshift({
					play: play,
					type: historyType,
					text: 'Fase com título modificado de "' + oldValue + '" para "' + newValue + '" em ' + now + '.'
				});
				break;

			case HistoryType.StatusStage:
				play.history.unshift({
					play: play,
					type: historyType,
					text: 'Status da fase "' + additional + '" modificado de "' + oldValue + '" para "' + newValue + '" em ' + now + '.'
				});
				break;
			default:
				break;
		}

		this.loadAllHistoriesToShowMap(play);
	}

	public importPlays(){
		this.showImportExportAlert('', true);
	}
	
	public exportPlays(){
		let allGameplaysBackup: string = '';
		for (const gameplay of this.allGameplays) {
			let gameplayObject = {
				buildGameId      : gameplay.buildGameId,
				buildGameName    : gameplay.buildGameName,
				buildGameCoverURL: gameplay.buildGameCoverURL,
				name             : gameplay.name,
				addingDate       : gameplay.addingDate,
				lastModifiedDate : gameplay.lastModifiedDate,
				oldStatus        : gameplay.oldStatus,
				status           : gameplay.status,
				stagesCreated    : gameplay.stagesCreated,
				notes            : gameplay.notes,
				stages           : [],
				history          : []
			}

			let stagesObjectList = []
			for(let stage of gameplay.stages){
				stagesObjectList.push({
					id              : stage.id,
					name            : stage.name,
					description     : stage.description,
					createdDate     : stage.createdDate,
					lastModifiedDate: stage.lastModifiedDate,
					status          : stage.status,
					oldStatus       : stage.oldStatus
				});
			}
			gameplayObject.stages = stagesObjectList;

			let historyObjectList = []
			for(let history of gameplay.history){
				historyObjectList.push({
					type: history.type,
					text: history.text
				});
			}
			gameplayObject.history = historyObjectList;

			allGameplaysBackup += JSON.stringify(gameplayObject) + ',,,,,';
		}
		this.showImportExportAlert(allGameplaysBackup, false);
	}
	
	public makeImportProcess(value, isImport: boolean){
		if(isImport){
			let importedValue: string = value.gameplayName;
			let gameplayObjects: string[] = importedValue.split(',,,,,');
			
			for(let stringObject of gameplayObjects){
				if(stringObject != ''){
					let parsedObject = JSON.parse(stringObject);
					
					let newGameplay: GameplayGame = {
						buildGameId      : parsedObject.buildGameId,
						buildGameName    : parsedObject.buildGameName,
						buildGameCoverURL: parsedObject.buildGameCoverURL,
						name             : parsedObject.name,
						addingDate       : parsedObject.addingDate,
						lastModifiedDate : parsedObject.lastModifiedDate,
						oldStatus        : parsedObject.oldStatus,
						status           : parsedObject.status,
						stagesCreated    : parsedObject.stagesCreated,
						notes            : parsedObject.notes,
						stages           : [],
						history          : []
					};

					let stagesObjectList: GameplayGameStage[] = [];
					for(let stage of parsedObject.stages){
						stagesObjectList.push({
							gameplayGame    : newGameplay,
							id              : stage.id,
							name            : stage.name,
							description     : stage.description,
							createdDate     : stage.createdDate,
							lastModifiedDate: stage.lastModifiedDate,
							status          : stage.status,
							oldStatus       : stage.oldStatus
						});
					}
					newGameplay.stages = stagesObjectList;

					let historiesObjectList: GameplayHistory[] = [];
					for(let history of parsedObject.history){
						historiesObjectList.push({
							play: newGameplay,
							type: history.type,
							text: history.text
						});
					}
					newGameplay.history = historiesObjectList;

					this.allGameplays.unshift(newGameplay);
					this.storage.set('gameplays', this.allGameplays);
					this.loadAllGameplaysToShowMap();
				}
			}
		}
	}

	public async showImportExportAlert(content: string, isImport: boolean) {
		let message = isImport ? 'Cole abaixo o texto com o backup das suas jogatinas.' : 'Copie e cole o texto abaixo em um local seguro, este é o seu backup.';
		let value = isImport ? '' : content;

		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: message,
			inputs: [
				{
					name: 'gameplayName',
					value: value,
					type: 'text'
				}
			],
			buttons: [
				{
					text: 'OK',
					handler: importValue => this.makeImportProcess(importValue, isImport)
				},
			]
		});
		alert.present();
	}

	// MÉTODOS PARA GAMEPLAY
	public gameplayToShow: GameplayGame;
	public GameplayStageStatusOptions: string[] = [
		"Na lista",
		"Pausado",
		"Jogando",
		"Concluído"
	];

	public progressName: string = 'Jogando';
	public chosenGameplay: GameplayGame;

	public playEditOption: string = 'Fases';

	public allGameplays: GameplayGame[] = [];
	
	public isTabSelected(tabValue: string, chosenValue: string){
		return tabValue == chosenValue;
	}

	public loadProgressGames(progressName: string) {
		this.resetPages();
		this.progressName = progressName;
		this.loadAllGameplaysToShowMap();
		this.searchGameplayByTextInput();
	}

	public loadPlayOption(playEditOption: string) {
		this.resetPages();
		this.playEditOption = playEditOption;
	}

	public isGameAlreadyAdded(gameId: number) {
		return this.allGameplays.find(
			game => game.buildGameId == gameId
		) != null;
	}

	public addGameToPlayList(gameAPI: BuildGame, chosenStatus: string, gameplayName: string) {
		let now = new Date().toLocaleDateString('pt-BR', this.databaseService.dateTimeFormat);
		let play: GameplayGame = {
			buildGameId      : gameAPI.gameId,
			buildGameName    : gameAPI.gameName,
			buildGameCoverURL: gameAPI.coverURL,
			name             : gameplayName,
			addingDate       : now,
			lastModifiedDate : now,
			oldStatus        : chosenStatus,
			status           : chosenStatus,
			stages           : [],
			stagesCreated    : 0,
			notes            : '',
			history          : []
		};
		this.createHistoryItem(play, HistoryType.CriacaoPlay, null, play.name, chosenStatus);

		this.allGameplays.unshift(play);
		this.reorderMapByStatus(chosenStatus);

		this.saveGameplaysToStorage(this.allGameplays);
		this.showSuccessToast('Gameplay criada com sucesso!');
	}

	public async confirmGameAdding(gameAPI: BuildGame) {
		let messageToShow: string =
			this.isGameAlreadyAdded(gameAPI.gameId) ?
				'Você já adicionou esse jogo à sua lista. Deseja realmente adicioná-lo de novo?' :
				'Deseja mesmo adicionar esse jogo à lista?';

		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: messageToShow,
			buttons: [
				{
					text: 'Sim',
					handler: () => this.askGameplayName(gameAPI)
				},
				'Não'
			]
		});
		alert.present();
	}

	public async askGameplayName(gameAPI: BuildGame) {
		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: 'Escolha um título para a sua jogatina',
			inputs: [
				{
					name: 'gameplayName',
					value: '',
					type: 'text'
				}
			],
			buttons: [
				{
					text: 'OK',
					handler: alertInput => this.enterGameplayStatus(gameAPI, alertInput.gameplayName)
				},
				'Cancelar'
			]
		});
		alert.present();
	}

	public async enterGameplayStatus(gameAPI: BuildGame, chosenGameplayName: string) {
		if(
			chosenGameplayName != null && chosenGameplayName != ''
		){
			if(chosenGameplayName.length > 30){
				this.showErrorToast('O título deve ter no máximo 30 caracteres!');
				this.askGameplayName(gameAPI);
			} else {
				const alert = await this.alertController.create({
					cssClass: 'base-alert-style',
					message: 'Entre com o status da gameplay',
					inputs: [
						{
							name: 'naLista',
							type: 'radio',
							label: GameplayStatusOptions.NaLista,
							value: GameplayStatusOptions.NaLista,
							checked: true
						},
						{
							name: 'pausado',
							type: 'radio',
							label: GameplayStatusOptions.Pausado,
							value: GameplayStatusOptions.Pausado,
							checked: false
						},
						{
							name: 'jogando',
							type: 'radio',
							label: GameplayStatusOptions.Jogando,
							value: GameplayStatusOptions.Jogando,
							checked: false
						},
						{
							name: 'concluido',
							type: 'radio',
							label: GameplayStatusOptions.Concluido,
							value: GameplayStatusOptions.Concluido,
							checked: false
						},
					],
					buttons: [
						{
							text: 'OK',
							handler: alertInputs => this.addGameToPlayList(gameAPI, alertInputs, chosenGameplayName)

						},
						'Cancelar'
					]
				});
				alert.present();
			}	
		} else {
			this.showErrorToast('Você deve inserir valores antes de continuar!');
			this.askGameplayName(gameAPI);
		}
	}

	public async confirmGameStatusChange(game: GameplayGame) {
		let newStatus = game.status;
		let oldStatus = game.oldStatus;

		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: 'Você deseja mesmo mudar esse jogo de "' + game.oldStatus + '" para "' + game.status + "?",
			buttons: [
				{
					text: 'Sim',
					handler: () => this.makeGameStatusChange(game, newStatus)
				},
				{
					text: 'Não'
				}
				
			]
		});

		game.status = oldStatus;

		await alert.present();
		this.saveGameplaysToStorage(this.allGameplays);
	}

	public makeGameStatusChange(game: GameplayGame, newStatus: string){
		let statusToLoad = game.oldStatus;
		
		game.status = newStatus;
		game.oldStatus = game.status;
		
		this.createHistoryItem(game, HistoryType.StatusPlay, statusToLoad, newStatus, null);
		this.updateGameplayLastModifiedDate(game);

		this.loadProgressGames(statusToLoad);
		this.saveGameplaysToStorage(this.allGameplays);

		this.showSuccessToast('Status da gameplay alterado com sucesso!');
	}

	public async confirmGameDeletion(game: GameplayGame){
		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: 'Você deseja mesmo deletar essa gameplay? Essa ação não pode ser desfeita',
			buttons: [
				{
					text: 'Sim',
					handler: () => this.deleteGame(game)
				},
				{
					text: 'Não'
				}
				
			]
		});
		await alert.present();
	}

	public async deleteGame(game: GameplayGame){
		let currentStatus: string = game.status;
		this.allGameplays.splice(
			this.allGameplays.indexOf(game), 1
		);

		this.saveGameplaysToStorage(this.allGameplays);
		this.loadProgressGames(currentStatus);

		this.showSuccessToast('Gameplay deletada com sucesso!');
	}

	public redirectToGameDetails(gameId: number, comingFromGameplays: boolean){
		this.comingFromGameplays = comingFromGameplays;
		this.router.navigate(['game-searching/' + gameId]);
	}

	public searchGameplayByTextInput(){
		if(this.gameplayTextInput != null && this.gameplayTextInput != ''){
			this.resetPages();
			let allGameplaysOfProgress: GameplayGame[] = [];
			for (const value of Array.from(this.buildGameplaysToShowMap.get(this.progressName).values())) {
				allGameplaysOfProgress.push.apply(allGameplaysOfProgress, value);
			}
			
			let filteredPlays: GameplayGame[] = 
				allGameplaysOfProgress.filter(
					play =>  	this.formatInput(play.name).includes(this.formatInput(this.gameplayTextInput)) || 
								this.formatInput(play.buildGameName).includes(this.formatInput(this.gameplayTextInput))
				);
			this.loadFilteredGameplaysMap(filteredPlays);
		} else {
			this.loadAllGameplaysToShowMap();
		}
	}

	public updateGameplayLastModifiedDate(game: GameplayGame){
		game.lastModifiedDate = new Date().toLocaleString('pt-BR', this.databaseService.dateTimeFormat);
		this.reorderGameplaysByDate();
		this.loadProgressGames(this.progressName);
	}

	public reorderGameplaysByDate(){
		let length = this.allGameplays.length;
		
		let isNotInOrder = true;
		while(isNotInOrder){
			isNotInOrder = false;
			for(let i = 0; i < length - 1; i++){
				for(let j = i + 1; j < length; j++){
					if(this.allGameplays[i].lastModifiedDate < this.allGameplays[j].lastModifiedDate){
						let auxI = this.allGameplays[i];
						let auxJ = this.allGameplays[j];
						this.allGameplays[i] = auxJ;
						this.allGameplays[j] = auxI;

						isNotInOrder = true;
					}
				}
			}
		}
		this.loadAllGameplaysToShowMap();
	}

	// MÉTODOS PARA STAGES
	public stageStatusOptions: string[] = [
		"Em progresso",
		"Pausado",
		"Concluído"
	];

	public currentStage: GameplayGameStage;
	public comingFromGameplays: Boolean = false;
	public loadedStagesAmount: number = 0;
	public loadedGameplayStages: GameplayGameStage[] = [];
	public stageTextInput: string;
	public statusOptions = GameplayStageStatusOptions;
	public chosenStageStatus: string = 'Todos';
	public currentFilteredStagesByStatus: GameplayGameStage[] = [];
	public gameplayTextInput: string;

	public async confirmStageStatusChange(stage: GameplayGameStage) {
		let newStatus = stage.status;
		let oldStatus = stage.oldStatus;

		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: 'Você deseja mesmo mudar essa fase de "' + stage.oldStatus + '" para "' + stage.status + "?",
			buttons: [
				{
					text: 'Sim',
					handler: () => this.makeStageStatusChange(stage, newStatus)
				},
				{
					text: 'Não'
				}
				
			]
		});

		stage.status = oldStatus;

		await alert.present();
		this.saveGameplaysToStorage(this.allGameplays);
	}

	public makeStageStatusChange(stage: GameplayGameStage, newStatus: GameplayStageStatusOptions){
		this.createHistoryItem(stage.gameplayGame, HistoryType.StatusStage, stage.status, newStatus, stage.name);

		stage.status = newStatus;
		stage.oldStatus = stage.status;
		this.updateStageLastModifiedDate(stage);

		this.saveGameplaysToStorage(this.allGameplays);

		this.showSuccessToast('Status da fase alterado com sucesso!');
	}

	public async addStage(chosenStageName, chosenStageDescription, chosenStatus){
		let date = new Date();

		let stage: GameplayGameStage = {
			gameplayGame    : this.gameplayToShow,
			id              : this.gameplayToShow.stagesCreated + 1,
			name            : chosenStageName,
			description     : chosenStageDescription,
			status          : chosenStatus,
			oldStatus       : chosenStatus,
			createdDate     : date.toLocaleString('pt-BR', this.databaseService.dateTimeFormat),
			lastModifiedDate: date.toLocaleString('pt-BR', this.databaseService.dateTimeFormat)
		}

		this.gameplayToShow.stagesCreated++;
		this.createHistoryItem(this.gameplayToShow, HistoryType.AdicionarStage, null, stage.name, chosenStatus);
		this.gameplayToShow.stages.unshift(stage)

		this.loadedGameplayStages.unshift(stage)
		this.updateGameplays();

		this.loadStage(stage);
		this.loadAllStagesToShowMap();

		this.showSuccessToast('Fase criada com sucesso!');
	}

	public loadStage(stage: GameplayGameStage) {
		this.currentStage = stage;

		this.router.navigate(['stages']);
	}

	public loadGameplayStagesAllStatus() {
		this.loadedGameplayStages = this.gameplayToShow.stages;
		this.currentFilteredStagesByStatus = this.loadedGameplayStages;

		this.resetPages();
		this.loadAllStagesToShowMap();
		this.loadAllHistoriesToShowMap(this.gameplayToShow);
	}

	public async enterNameDescription() {
		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: 'Entre com as informações da fase',
			inputs: [
				{
					name: 'stageName',
					value: '',
					type: 'text',
					placeholder: 'Nome'
				},
				{
					name: 'stageDescription',
					value: '',
					type: 'text',
					placeholder: 'Descrição'
				}
			],
			buttons: [
				{
					text: 'OK',
					handler: alertInputs => this.enterStageStatus(alertInputs.stageName, alertInputs.stageDescription)

				},
				'Cancelar'
			]
		});

		alert.present();

	}

	public async enterStageStatus(chosenStageName, chosenStageDescription) {
		if(
			chosenStageName != null && chosenStageName != '' && 
			chosenStageDescription != null && chosenStageDescription != ''
		){
			const alert = await this.alertController.create({
				cssClass: 'base-alert-style',
				message: 'Entre com o status da fase',
				inputs: [
					{
						name: 'emProgresso',
						type: 'radio',
						label: GameplayStageStatusOptions.EmProgresso,
						value: GameplayStageStatusOptions.EmProgresso,
						checked: true
					},
					{
						name: 'pausado',
						type: 'radio',
						label: GameplayStageStatusOptions.Pausado,
						value: GameplayStageStatusOptions.Pausado
					},
					{
						name: 'concluido',
						type: 'radio',
						label: GameplayStageStatusOptions.Concluido,
						value: GameplayStageStatusOptions.Concluido
					}
				],
				buttons: [
					{
						text: 'OK',
						handler: alertInputs => this.addStage(chosenStageName, chosenStageDescription, alertInputs)

					},
					'Cancelar'
				]
			});
			alert.present();
		} else {
			this.showErrorToast('Você deve inserir valores antes de continuar!');
			this.enterNameDescription();
		}
	}

	public searchStageByTextInput(){
		if(this.stageTextInput != null && this.stageTextInput != ''){
			this.loadedGameplayStages = this.currentFilteredStagesByStatus.filter(
				stage =>  	(String)(stage.id) == this.stageTextInput || 
							this.formatInput(stage.name).includes(this.formatInput(this.stageTextInput)) || 
							this.formatInput(stage.description).includes(this.formatInput(this.stageTextInput))
			);
		} else {
			this.loadedGameplayStages = this.currentFilteredStagesByStatus;
		}

		this.restrictViewStagesNumber();
	}

	public applyStatusFilter(){
		this.resetPages();
		if(this.chosenStageStatus != 'Todos'){
			this.loadedGameplayStages = this.gameplayToShow.stages.filter(
				stage => this.formatInput(stage.status) == this.formatInput(this.chosenStageStatus)
			);
		} else {
			this.loadGameplayStagesAllStatus();
		}
		this.currentFilteredStagesByStatus = this.loadedGameplayStages;
		this.searchStageByTextInput();
	}

	public restrictViewStagesNumber(){
		this.loadedGameplayStages = this.loadedGameplayStages.slice(0, 10);
	}

	public replaceSpecialCharactersLetters(text: string): string{
		return text
			.replace('á', 'a')
			.replace('à', 'a')
			.replace('ã', 'a')
			.replace('â', 'a')
			.replace('ä', 'a')
			.replace('é', 'e')
			.replace('è', 'e')
			.replace('ê', 'e')
			.replace('ë', 'e')
			.replace('í', 'i')
			.replace('ì', 'i')
			.replace('î', 'i')
			.replace('ï', 'i')
			.replace('ó', 'o')
			.replace('ò', 'o')
			.replace('ô', 'o')
			.replace('õ', 'o')
			.replace('ö', 'o')
			.replace('ú', 'u')
			.replace('ù', 'u')
			.replace('û', 'u')
			.replace('ü', 'u')
			.replace('ñ', 'n');
	}

	public formatInput(input: string): string{
		return this.replaceSpecialCharactersLetters(input).toUpperCase();
	}

	public getCardStyleNeeded(stageToShow: GameplayGameStage) : string{
		return stageToShow.id % 2 == 0 ? 'green' : 'yellow';
	}

	public updateStageLastModifiedDate(stage: GameplayGameStage){
		stage.lastModifiedDate = new Date().toLocaleString('pt-BR', this.databaseService.dateTimeFormat);
		this.updateGameplayLastModifiedDate(stage.gameplayGame);
		this.reorderStagesByDate(stage);
		this.loadAllStagesToShowMap();
		this.applyStatusFilter();
	}

	public reorderStagesByDate(stage: GameplayGameStage){
		let allStages = stage.gameplayGame.stages;
		let length = allStages.length;
		
		let isNotInOrder = true;
		while(isNotInOrder){
			isNotInOrder = false;
			for(let i = 0; i < length - 1; i++){
				for(let j = i + 1; j < length; j++){
					if(allStages[i].lastModifiedDate < allStages[j].lastModifiedDate){
						let auxI = allStages[i];
						let auxJ = allStages[j];
						allStages[i] = auxJ;
						allStages[j] = auxI;

						isNotInOrder = true;
					}
				}
			}
		}
	}

	public async confirmStageDeletion(stage: GameplayGameStage){
		const alert = await this.alertController.create({
			cssClass: 'base-alert-style',
			message: 'Você deseja mesmo deletar essa fase? Essa ação não pode ser desfeita',
			buttons: [
				{
					text: 'Sim',
					handler: () => this.deleteStage(stage)
				},
				{
					text: 'Não'
				}
				
			]
		});
		await alert.present();
	}

	public async deleteStage(stage: GameplayGameStage){
		this.updateGameplayLastModifiedDate(this.gameplayToShow);
		this.createHistoryItem(stage.gameplayGame, HistoryType.DeletarStage, stage.name, null, null);
		
		this.gameplayToShow.stages.splice(
			this.gameplayToShow.stages.indexOf(stage), 1
		);

		this.saveGameplaysToStorage(this.allGameplays);
		this.applyStatusFilter();
		this.showSuccessToast('Stage deletada com sucesso!');
	}

	public async getGameplayGamesInfoFromAPI(){
		let gameplayGames: Game[] = [];

		let oldQueryValues: string[] = [
			this.databaseService.currentWhere,
			this.databaseService.currentLimit
		];
		let oldOffset = this.databaseService.currentOffset;

		for(let index = 0; index < this.allGameplays.length; index += 50){
			let gameIds = [];
			try{
				for(let i = index; i < index + 50; i++){
					gameIds.push(this.allGameplays[i].buildGameId);
				}
			}catch(e){}

			this.databaseService.currentWhere = 'where id = (' + gameIds.join(',') + ');';
			this.databaseService.currentLimit = 'limit 50;';
			this.databaseService.currentOffset = 0;

			let result;
			try{
				result = await this.http.post<Game>(
					this.tokenService.getBaseURL() + 'games', 
					this.databaseService.getBuildQueryBody(),
					{
						headers: new HttpHeaders()
						.set('Client-ID', this.tokenService.getClientID())
						.set('Authorization', 'Bearer ' + this.tokenService.getToken())
					}
				).toPromise();
				// console.log(result)
			}catch(error){
				console.log(error);
			}

			await gameplayGames.push(...result);
			this.databaseService.currentOffset += 5;
		}
		await this.databaseService.buildCoversToBeLoaded(gameplayGames);
		await this.databaseService.buildInvolvedCompaniesToBeInserted(gameplayGames);
		await this.databaseService.buildAppGames(gameplayGames, true, null, true);

		this.databaseService.currentWhere = oldQueryValues[0];
		this.databaseService.currentLimit = oldQueryValues[1];
		this.databaseService.currentOffset = oldOffset
	}

	// MÉTODOS PAGES
	public loadingElementType: string = 'Gameplay';
	public buildGameplaysToShowMap: Map<String, Map<Number, GameplayGame[]>> = new Map();
	public renderedBuildGameplaysToShowMap: Map<String, Map<Number, GameplayGame[]>> = new Map();
	public buildStagesToShowMap: Map<String, Map<Number, GameplayGameStage[]>> = new Map();
	public buildHistoriesToShowMap: Map<Number, GameplayHistory[]> = new Map();
	
	public keyIndex = 1;
	public itemPosition;
	public loadAllGameplaysToShowMap(){
		for (let status of Object.values(GameplayStatusOptions)){
			this.keyIndex = 1;
			
			this.buildGameplaysToShowMap.set(status, new Map([
				[this.keyIndex, []]
			]));
			
			this.putItemsToMap(status, this.buildGameplaysToShowMap.get(status), this.allGameplays);
			this.renderedBuildGameplaysToShowMap = new Map(this.buildGameplaysToShowMap);
		}
	}

	public loadFilteredGameplaysMap(filteredGameplays: GameplayGame[]){
		for (let status of Object.values(GameplayStatusOptions)){
			this.keyIndex = 1;
			
			this.renderedBuildGameplaysToShowMap.set(status, new Map([
				[this.keyIndex, []]
			]));
			
			this.putItemsToMap(status, this.renderedBuildGameplaysToShowMap.get(status), filteredGameplays);
		}
	}

	public loadAllStagesToShowMap(){
		for (let status of Object.values(GameplayStageStatusOptions)){
			this.keyIndex = 1;
			
			this.buildStagesToShowMap.set(status, new Map([
				[this.keyIndex, []]
			]));
			
			this.putItemsToMap(status, this.buildStagesToShowMap.get(status), this.gameplayToShow.stages);
		}
		
		this.keyIndex = 1;
		this.buildStagesToShowMap.set('Todos', new Map([
			[this.keyIndex, []]
		]));
		this.putItemsToMap(null, this.buildStagesToShowMap.get('Todos'), this.gameplayToShow.stages);
	}

	public loadAllHistoriesToShowMap(game: GameplayGame){
		this.keyIndex = 1;
		this.buildHistoriesToShowMap.set(this.keyIndex, []);
		this.putItemsToMap(null, this.buildHistoriesToShowMap, game.history);
	}

	public putItemsToMap(status: string, mapToAdd, mapToFilter){
		this.itemPosition = 0;
		for(let item of status != null ? 
			mapToFilter.filter(play => play.status == status) : 
			mapToFilter
		){
			if(this.itemPosition < 10){
				this.itemPosition++;
			} else {
				this.keyIndex++;
				this.itemPosition = 1;
				
				mapToAdd.set(this.keyIndex, []);
			}
			
			mapToAdd.get(this.keyIndex).push(item);
		}
	}

	public reorderMapByStatus(status: string){
		this.keyIndex = 1;
		this.itemPosition = 0;
		
		this.buildGameplaysToShowMap.set(status, new Map([
			[this.keyIndex, []]
		]));

		this.putItemsToMap(status, this.buildGameplaysToShowMap.get(status), this.allGameplays);
		this.renderedBuildGameplaysToShowMap = new Map(this.buildGameplaysToShowMap);

	}

	public currentPage: number = 1;
	
	public backPage(){
		if(this.currentPage > 1){
			this.currentPage--;
		}
	}
	
	public forwardPage(pageType: string){
		let pageItems = 
			pageType == 'Gameplays' ? this.renderedBuildGameplaysToShowMap.get(this.progressName).get(this.currentPage) : 
			pageType == 'Stages' ? this.buildStagesToShowMap.get(this.chosenStageStatus).get(this.currentPage) : 
			pageType == 'History' ? this.buildHistoriesToShowMap.get(this.currentPage) : null;
		
		let nextPageItems = 
			pageType == 'Gameplays' ? this.renderedBuildGameplaysToShowMap.get(this.progressName).get(this.currentPage + 1) : 
			pageType == 'Stages' ? this.buildStagesToShowMap.get(this.chosenStageStatus).get(this.currentPage + 1) : 
			pageType == 'History' ? this.buildHistoriesToShowMap.get(this.currentPage + 1) : null;
		
		if(
			pageItems != null && 
			pageItems.length == 10 &&
			nextPageItems != null &&
			nextPageItems.length > 0
		){
			this.currentPage++;
		}
	}

	public resetPages(){
		this.currentPage = 1;
	}
}