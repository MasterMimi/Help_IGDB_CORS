import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Filters } from 'src/app/models/API-Models';
import { DatabaseService } from 'src/app/services/database.service';
import { FiltersService } from 'src/app/services/filters.service';

@Component({
	selector: 'app-filter-details',
	templateUrl: './filter-details.component.html',
	styleUrls: ['./filter-details.component.scss'],
})
export class FilterDetailsComponent implements OnInit {

	constructor(
		public databaseService: DatabaseService,
		public filtersService: FiltersService,
		public router: Router
	){}

	@Input() filter_name;
	public filters = Filters;

	ngOnInit(){
		this.filtersService.startFiltersPage(this.filter_name);
	}
}