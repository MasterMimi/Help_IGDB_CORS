import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIGetTokenResult, APIHeaders } from '../models/API-Models';

@Injectable({
	providedIn: 'root'
})
export class TokenService {

	constructor(
		public http: HttpClient
	){
		this.httpHeaders = new HttpHeaders()
			.set('Client-ID', this.getClientID())
			.set('Authorization', 'Bearer ' + this.getToken());
	}

	private clientID    : string = '';
	private clientSecret: string = '';
	private token       : string;

	private baseURL     : string = 'https://thingproxy.freeboard.io/fetch/https://api.igdb.com/v4/';

	private httpHeaders : HttpHeaders;

	public async requireTokenFromAPI(){
		let getToken: APIGetTokenResult;
		let url = 'https://id.twitch.tv/oauth2/token?client_id=' + this.clientID + '&client_secret=' + this.clientSecret + '&grant_type=client_credentials';
		let result = await this.http.post<APIGetTokenResult>(url, getToken).toPromise();

		this.setToken(result.access_token);

		console.log('token ' + this.token);
		
	}

	public getHttpHeaders(): HttpHeaders{
		return this.httpHeaders;
	}
	public getBaseURL(): string{
		return this.baseURL;
	}

	public getClientID(): string{
		return this.clientID;
	}

	public getClientSecret(): string{
		return this.clientSecret;
	}

	public getToken(): string{
		return this.token;
	}

	public setToken(token): void{
		this.token = token;
	}
}
