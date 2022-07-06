import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
	selector: 'app-filter',
	templateUrl: './filter.page.html',
	styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {

	constructor(
		public databaseService: DatabaseService
	){}

	ngOnInit(){}

}
