import { Injectable } from '@angular/core';
import { FilterOption, Filters, InvolvedCompany } from '../models/API-Models';
import { DatabaseService } from './database.service';
import { getUnixTime } from 'date-fns';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class FiltersService {

	constructor(
		public databaseService: DatabaseService,
		public router: Router
	){}

	public allCurrentOptions: FilterOption[] = [];
	public filteredOptions: FilterOption[] = [];

	public genreOptions: FilterOption[] = [];
	public platformOptions: FilterOption[] = [];
	public companyOptions: FilterOption[] = [];
	public franchiseOptions: FilterOption[] = [];
	public lastMinimumRating: number = 0;
	public lastMaximumRating: number = 100;
	public lastMinimumDate: Date = new Date();
	public lastMaximumDate: Date = new Date();

	public genreQuery: string  = '';
	public platformQuery: string  = '';
	public companyQuery: string = '';
	public franchiseQuery: string = '';
	public ratingQuery: string = '';
	public dateQuery: string = '';


	public searchValue       : string;
	public hasFoundValue     : boolean = true;
	public filterOperator    : string = 'and';
	public operatorCharacter1: string = '(';
	public operatorCharacter2: string = ')';
	public includeNullValues : boolean = false;
	public isResettingFilters: boolean = false;

	public minimumRating			 : number = 0;
	public maximumRating			 : number = 100;
	public ratingFilterErrorMessage  : string = '';
	public isRatingInputValid		 : boolean = true;
	public useRatingFilter 			 : boolean = false;

	public minimumDay  			 : number = 1;
	public minimumMonth			 : number = 1;
	public minimumYear  		 : number = 2021;
	public maximumDay  			 : number = 1;
	public maximumMonth			 : number = 1;
	public maximumYear 			 : number = 2021;
	public minimumDate			 : Date = new Date();
	public maximumDate			 : Date = new Date();
	public minimumUnix			 : number = getUnixTime(this.minimumDate);
	public maximumUnix			 : number = getUnixTime(this.maximumDate);
	public isDateInputValid		 : boolean = true;
	public dateFilterErrorMessage: string = '';
	public useDateFilter 	  	 : boolean = false;

	public startFiltersPage(filterName: string){
		this.allCurrentOptions = [];
		this.filteredOptions = [];
		switch (filterName){
			case Filters.Generos:
				this.putSelectedOptionsToFiltered(this.genreOptions.filter(option => option.selected));
				this.buildFilterOptions(this.genreOptions, this.databaseService.allGenres);
				this.putSelectedOptionsToFiltered(this.genreOptions.filter(option => !option.selected));
				break;

			case Filters.Plataformas:
				this.putSelectedOptionsToFiltered(this.platformOptions.filter(option => option.selected));
				this.buildFilterOptions(this.platformOptions, this.databaseService.allPlatforms);
				break;

			case Filters.Empresas:
				this.putSelectedOptionsToFiltered(this.companyOptions.filter(option => option.selected));
				this.buildFilterOptions(this.companyOptions, this.databaseService.allCompanies);
				break;
				
			case Filters.Franquias:
				this.putSelectedOptionsToFiltered(this.franchiseOptions.filter(option => option.selected));
				this.buildFilterOptions(this.franchiseOptions, this.databaseService.allFranchises);
				break;

			case Filters.Nota:
				this.minimumRating = this.lastMinimumRating;
				this.maximumRating = this.lastMaximumRating;
				break;

			case Filters.DataLancamento:
				this.minimumDay   = this.lastMinimumDate.getDate();
				this.minimumMonth = this.lastMinimumDate.getMonth() + 1;
				this.minimumYear  = this.lastMinimumDate.getFullYear();
				this.maximumDay   = this.lastMaximumDate.getDate();
				this.maximumMonth = this.lastMaximumDate.getMonth() + 1;
				this.maximumYear  = this.lastMaximumDate.getFullYear();

				this.buildDates();
				this.validateDateOrder();
				break;
		}
	}

	public putSelectedOptionsToFiltered(optionList: FilterOption[]): void{
		this.filteredOptions.push(...optionList);
	}

	public buildFilterOptions(listToAdd: FilterOption[], allData: any[]){
		if(listToAdd.length == 0){
			for(let option of allData){
				listToAdd.push({
					selected: false,
					name	: option.name,
					value   : option.id
				});
			}
		}
		this.allCurrentOptions = listToAdd;
	}

	public async searchGames(filterName: string){
		this.databaseService.resetPages();
		this.databaseService.resetShownGameplays();

		if(this.filterOperator == 'or'){
			this.operatorCharacter1 = '(';
			this.operatorCharacter2 = ')';
		} else {
			this.operatorCharacter1 = '[';
			this.operatorCharacter2 = ']';
		}

		this.databaseService.allBuildGames = [];
		let allIdsQuery = '';

		for(let option of this.allCurrentOptions.filter(option => option.selected)){
			allIdsQuery += option.value + ',';
		}
		allIdsQuery = allIdsQuery.substring(0, allIdsQuery.length - 1);
		this.databaseService.currentOffset = 0;
		this.databaseService.currentWhere = this.databaseService.baseWhere;

		if(!this.isResettingFilters){
			switch (filterName) {
				case Filters.Generos:
					this.genreQuery = '';
					if(allIdsQuery.length != 0){
						this.genreQuery += "genres = " + 
							this.operatorCharacter1 + allIdsQuery + this.operatorCharacter2;
					}
					
					if(this.includeNullValues){
						if(allIdsQuery.length != 0){
							this.genreQuery += " | ";
						}
						this.genreQuery += "genres = null";
					}
					break;

				case Filters.Plataformas:
					this.platformQuery = '';
					if(allIdsQuery.length != 0){
						this.platformQuery += "platforms = " + 
							this.operatorCharacter1 + allIdsQuery + this.operatorCharacter2;
					}
					
					if(this.includeNullValues){
						if(allIdsQuery.length != 0){
							this.platformQuery += " | ";
						}
						this.platformQuery += "platforms = null";
					}
					break;

				case Filters.Empresas:
					let doInvolvedCompaniesExist: boolean = false;
					this.companyQuery = '';
					allIdsQuery = '';

					let contextInvolvedCompanies: InvolvedCompany[] = [];
					let companiesIds : string = '';
					for(let option of this.allCurrentOptions.filter(option => option.selected)){
						companiesIds += option.value + ',';
					}
					if(companiesIds.length != 0){
						companiesIds = companiesIds.substring(0, companiesIds.length - 1);
						contextInvolvedCompanies = await this.databaseService.getInvolvedCompaniesByCompaniesIds(companiesIds);
						doInvolvedCompaniesExist = true;
					}

					for(let option of this.allCurrentOptions.filter(option => option.selected)){
						let involvedOfOption: InvolvedCompany[] = contextInvolvedCompanies.filter(involved => involved.company == option.value);
						if(involvedOfOption != null && involvedOfOption.length != 0){
							allIdsQuery += '(involved_companies = (';
							
							for(let involved of involvedOfOption){
								allIdsQuery += involved.id + ',';
								doInvolvedCompaniesExist = true;
							}

							if(!doInvolvedCompaniesExist){
								allIdsQuery += '0,';
							}
							allIdsQuery = allIdsQuery.substring(0, allIdsQuery.length - 1) + '))';

							if(this.filterOperator == 'or'){
								allIdsQuery += ' | ';
							} else {
								allIdsQuery += ' & ';
							}
						}
					}
					
					allIdsQuery = allIdsQuery.substring(0, allIdsQuery.length - 2);

					this.companyQuery = allIdsQuery;					
					
					if(this.includeNullValues){
						if(allIdsQuery.length != 0){
							this.companyQuery += " | ";
						}
						this.companyQuery += "involved_companies = null";
					}
					break;

				case Filters.Franquias:
					this.franchiseQuery = '';
					if(allIdsQuery.length != 0){
						this.franchiseQuery += "franchises = " + 
							this.operatorCharacter1 + allIdsQuery + this.operatorCharacter2;
					}
					
					if(this.includeNullValues){
						if(allIdsQuery.length != 0){
							this.franchiseQuery += " | ";
						}
						this.franchiseQuery += "franchises = null";
					}
					break;
				
				case Filters.Nota:
					this.ratingQuery = '';
					this.ratingQuery += '(total_rating >= ' + this.minimumRating + ' & total_rating <= ' + this.maximumRating + ')';
					
					if(this.includeNullValues){
						this.ratingQuery += " | total_rating = null";
					}
					
					this.lastMinimumRating = this.minimumRating;
					this.lastMaximumRating = this.maximumRating;
					this.useRatingFilter = true;
					break;

				case Filters.DataLancamento:
					this.minimumUnix = getUnixTime(this.minimumDate) - 86400;
					this.maximumUnix = getUnixTime(this.maximumDate);

					this.dateQuery = '';
					this.dateQuery += '(first_release_date >= ' + this.minimumUnix + ' & first_release_date <= ' + this.maximumUnix + ')';
					
					if(this.includeNullValues){
						this.dateQuery += " | first_release_date = null";
					}
					
					this.lastMinimumDate = this.minimumDate;
					this.lastMaximumDate = this.maximumDate;
					this.useDateFilter = true;
					break;
			}
		}

		this.writeCurrentWhere();
		this.resetWhereStatement();
		this.databaseService.setHasFoundGames();

		this.databaseService.getAllGamesFromAPI(this.databaseService.getBuildQueryBody());
		this.router.navigate(['search']);
		
		this.searchValue = '';
	}

	public writeCurrentWhere(): void{
		let amountAppliedFilters: number = 0;

		if(this.genreQuery.length != 0){
			this.databaseService.currentWhere += '(' + this.genreQuery + ')';
			amountAppliedFilters++;
		}

		if(this.platformQuery.length != 0){
			this.writeAndConditionWhereQuery(amountAppliedFilters);
			this.databaseService.currentWhere += '(' + this.platformQuery + ')';
			amountAppliedFilters++;
		}

		if(this.companyQuery.length != 0){
			this.writeAndConditionWhereQuery(amountAppliedFilters);
			this.databaseService.currentWhere += '(' + this.companyQuery + ')';
			amountAppliedFilters++;
		}

		if(this.franchiseQuery.length != 0){
			this.writeAndConditionWhereQuery(amountAppliedFilters);
			this.databaseService.currentWhere += '(' + this.franchiseQuery + ')';
			amountAppliedFilters++;
		}

		if(this.ratingQuery.length != 0){
			this.writeAndConditionWhereQuery(amountAppliedFilters);
			this.databaseService.currentWhere += '(' + this.ratingQuery + ')';
			amountAppliedFilters++;
		}

		if(this.dateQuery.length != 0){
			this.writeAndConditionWhereQuery(amountAppliedFilters);
			this.databaseService.currentWhere += '(' + this.dateQuery + ')';
			amountAppliedFilters++;
		}

		this.databaseService.currentWhere += ";";
	}

	public writeAndConditionWhereQuery(filterAmount: number): void{
		if(filterAmount > 0){
			this.databaseService.currentWhere += ' & ';
		}
	}

	public resetWhereStatement(): void{
		if(
			this.genreQuery.length == 0 &&
			this.platformQuery.length == 0 &&
			this.companyQuery.length == 0 &&
			this.franchiseQuery.length == 0 &&
			this.ratingQuery.length == 0 &&
			this.dateQuery.length == 0
		){
			this.databaseService.currentWhere = "";
		}
	}

	public isChosenFilterBeingUsed(filterName: string): boolean{
		switch (filterName){
			case Filters.Generos:
				return this.genreOptions.filter(option => option.selected).length != 0 || this.genreQuery.includes('= null');
			case Filters.Plataformas:
				return this.platformOptions.filter(option => option.selected).length != 0 || this.platformQuery.includes('= null');
			case Filters.Empresas:
				return this.companyOptions.filter(option => option.selected).length != 0 || this.companyQuery.includes('= null');
			case Filters.Franquias:
				return this.franchiseOptions.filter(option => option.selected).length != 0 || this.franchiseQuery.includes('= null');
			case Filters.Nota:
				return this.isQueryNotNull(this.ratingQuery);
			case Filters.DataLancamento:
				return this.isQueryNotNull(this.dateQuery);
			default:
				return false;
		}
	}

	public isQueryNotNull(query: string){
		return query != '' && query != null && query != undefined;
	}
	
	public resetFilter(filterName: string, isAll: boolean){
		this.isResettingFilters = true;
		switch (filterName){
			case Filters.Generos:
				this.genreQuery = '';
				this.unselectOptions(this.genreOptions)
				break;
			case Filters.Plataformas:
				this.platformQuery = '';
				this.unselectOptions(this.platformOptions)
				break;
			case Filters.Empresas:
				this.companyQuery = '';
				this.unselectOptions(this.companyOptions)
				break;
			case Filters.Franquias:
				this.franchiseQuery = '';
				this.unselectOptions(this.franchiseOptions)
				break;
			case Filters.Nota:
				this.ratingQuery = '';
				this.useRatingFilter = false;
				break;
			case Filters.DataLancamento:
				this.dateQuery = '';
				this.useDateFilter = false;
				break;
			default:
				break;
		}
		
		if(!isAll){
			this.searchGames(filterName);
			this.isResettingFilters = false;
		}
	}

	public resetAllFilters(){
		this.databaseService.inputName = '';
		this.databaseService.currentSearch = '';

		for (const filter of Object.values(Filters)){
			this.resetFilter(filter, true);
		}

		this.searchGames(Filters.Generos);
		this.isResettingFilters = false;
	}

	public unselectOptions(options: FilterOption[]){
		for(let option of options){
			option.selected = false;
		}
	}

	public search(filterName: string): void{
		this.resetFilteredOptions(filterName);

		let index: number = 0;
		
		let exactMatch: FilterOption = this.allCurrentOptions.find(
			option => option.name.toUpperCase() == (this.searchValue.toUpperCase()) && !option.selected
		);

		if(exactMatch != null){
			this.filteredOptions.push(exactMatch);
		}

		for(let option of this.allCurrentOptions.filter(
			option => option.name.toUpperCase().includes(this.searchValue.toUpperCase()) && !option.selected
		)){
			if(exactMatch != null && option.name.toUpperCase() == exactMatch.name.toUpperCase()){
				break;
			} else {
				this.filteredOptions.push(option);
				index++;

				if(index == 10){
					break;
				}
			}
		}

		if(this.filteredOptions.length == 0){
			this.hasFoundValue = false;
		} else {
			this.hasFoundValue = true;
		}
	}

	public resetNotFoundAlert(): void{
		this.hasFoundValue = true;
	}

	public resetFilteredOptions(filterName: string): void{
		this.filteredOptions = [];
		switch (filterName){
			case Filters.Generos:
				this.putSelectedOptionsToFiltered(this.genreOptions.filter(option => option.selected));
				break;
			case Filters.Plataformas:
				this.putSelectedOptionsToFiltered(this.platformOptions.filter(option => option.selected));
				break;
			case Filters.Empresas:
				this.putSelectedOptionsToFiltered(this.companyOptions.filter(option => option.selected));
				break;
			case Filters.Franquias:
				this.putSelectedOptionsToFiltered(this.franchiseOptions.filter(option => option.selected));
				break;
			default:
				break;
		}
	}

	public isFilterWordList(filterName: string){
		let wordListFilters: string[] = [
			'Gêneros',
			'Plataformas',
			'Empresas',
			'Franquias'
		];
		return wordListFilters.includes(filterName);
	}

	public isFilterNumberRange(filterName: string){
		return filterName == 'Nota';
	}

	public isFilterDate(filterName: string){
		return filterName == 'Data de lançamento';
	}

	public validateRatingInput(){
		if(this.minimumRating == null || this.maximumRating == null){
			this.throwRatingError("Digite um valor para continuar!");
		} else if(this.maximumRating > 100 || this.maximumRating < 0 || this.minimumRating > 100 || this.minimumRating < 0){
			this.throwRatingError("Digite um valor entre 0 e 100!");
		} else if(this.maximumRating < this.minimumRating){
			this.throwRatingError("O valor mínimo deve ser menor do que o máximo!");
		} else {
			this.removeRatingError();
		}
	}

	public throwRatingError(message: string){
		this.isRatingInputValid = false;
		this.ratingFilterErrorMessage = message;
	}

	public removeRatingError(){
		this.isRatingInputValid = true;
	}

	public buildDates(){
		this.minimumDate = new Date(this.minimumYear + '-' + this.minimumMonth + '-' + this.minimumDay);
		this.maximumDate = new Date(this.maximumYear + '-' + this.maximumMonth + '-' + this.maximumDay);
	}

	public validateMinimumDateInput(){
		if(this.isDateValidInGeneral()){
			switch(this.minimumMonth){
				case 1: case 3: case 5: case 7: case 8: case 10: case 12:
					if(this.minimumDay > 31){
						this.throwDateError('Data inválida!');
					} else {
						this.removeDateError();
					}
					break;
				
				case 4: case 6: case 9: case 11:
					if(this.minimumDay > 30){
						this.throwDateError('Data inválida!');
					} else {
						this.removeDateError();
					}
					break;

				case 2:
					if(this.isLeapYear(this.minimumYear)){
						if(this.minimumDay > 29){
							this.throwDateError('Data inválida!');
						} else {
							this.removeDateError();
						}
					} else {
						if(this.minimumDay > 28){
							this.throwDateError('Data inválida!');
						} else {
							this.removeDateError();
						}
					}
					break;
			}
		}

		this.buildDates();
		this.validateDateOrder();
	}

	public validateMaximumDateInput(){
		if(this.isDateValidInGeneral()){
			switch(this.maximumMonth){
				case 1: case 3: case 5: case 7: case 8: case 10: case 12:
					if(this.maximumDay > 31){
						this.throwDateError('Data inválida!');
					} else {
						this.removeDateError();
					}
					break;

				case 4: case 6: case 9: case 11:
					if(this.maximumDay > 30){
						this.throwDateError('Data inválida!');
					} else {
						this.removeDateError();
					}
					break;
			
				case 2:
					if(this.isLeapYear(this.maximumYear)){
						if(this.maximumDay > 29){
							this.throwDateError('Data inválida!');
						} else {
							this.removeDateError();
						}
					} else {
						if(this.maximumDay > 28){
							this.throwDateError('Data inválida!');
						} else {
							this.removeDateError();
						}
					}
					break;
			}
		}

		this.buildDates();
		this.validateDateOrder();
	}

	public validateDateOrder(){
		if((this.minimumDate.getTime() > this.maximumDate.getTime())){
			this.throwDateError('A data mínima deve ser menor do que a máxima!');
			return false;
		}
		return true;
	}

	public isDateValidInGeneral(){
		if(
			this.minimumDay < 1 || 
			this.maximumDay < 1 ||
			this.minimumMonth < 1 ||
			this.minimumMonth > 12 ||
			this.maximumMonth < 1 ||
			this.maximumMonth > 12 ||
			this.minimumYear < 1 ||
			this.maximumYear < 1
		){
			this.throwDateError('Data inválida!');
			return false;
		}

		this.removeDateError();
		return true;
	}

	public throwDateError(message: string){
		this.isDateInputValid = false;
		this.dateFilterErrorMessage = message;
	}

	public removeDateError(){
		this.isDateInputValid = true;
	}

	public isLeapYear(year: number){
		return year % 400 == 0 ||
		(
			year % 4 == 0 &&
			year % 100 != 0
		);
	}
	
}