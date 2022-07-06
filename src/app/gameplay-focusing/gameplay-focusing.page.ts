import { Component, OnInit } from '@angular/core';
import { GameplaysService } from '../services/gameplays.service';

@Component({
	selector: 'app-gameplay-focusing',
	templateUrl: './gameplay-focusing.page.html',
	styleUrls: ['./gameplay-focusing.page.scss'],
})
export class GameplayFocusingPage implements OnInit {

	constructor(
		public gameplaysService: GameplaysService
	){}

	ngOnInit(){}

}
