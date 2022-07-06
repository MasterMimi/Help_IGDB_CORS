export interface APIGetTokenResult{
    "access_token": string;
    "expires_in"  : number;
    "token_type"  : string;
}

export interface APIHeaders{
    "Client-ID"    : string;
    "Authorization": string;
}

export interface BuildGame{
    gameId              : number;
    gameName            : string;
    formattedName       : string;
    releaseDate         : Date;
    releaseDateFormatted: string;
    genreNames          : string[];
    coverURL            : string;
    rating              : string;
    platforms           : string[];
    companies           : string[];
    franchises          : string[];
    description         : string;
    ageRatings          : string[];
    similarGamesIds     : number[];
    similarBuildGames   : BuildGame[];
}

export interface Game{
    id                : number;
    genres            : number[];
    name              : string;
    first_release_date: number;
    cover             : number;
    age_ratings       : number[];
    franchises        : number[];
    platforms         : number[];
    total_rating      : number;
    similar_games     : number[];
    summary           : string;
    game_modes        : number[];
    involved_companies: number[];
}

export interface Genre{
    id        : number;
    checksum  : string;
    created_at: number;
    name      : string;
    slug      : string;
    updated_at: number;
    url       : string;
}

export interface Cover{
    id           : number;
    alpha_channel: boolean;
    animated     : boolean;
    checksum     : string;
    game         : number;
    height       : number;
    image_id     : string;
    url          : string;
    width        : number;
}

export interface Platform{
    id  : number;
    name: string;
}

export interface InvolvedCompany{
    id     : number;
    company: number;
}

export interface Company{
    id  : number;
    name: string;
}

export interface InvolvedCompany{
    id     : number
    company: number;
}

export interface Franchise{
    id  : number;
    name: string;
}

export interface AgeRating{
    id      : number;
    category: number;
    rating  : number;
}

export interface FilterOption{
    selected: boolean;
    name    : string;
    value   : number;
}

export interface GameplayGame{
    // buildGame       : BuildGame;
    buildGameId      : number;
    buildGameName    : string;
    buildGameCoverURL: string;
    name             : string;
    addingDate       : string;
    lastModifiedDate : string;
    oldStatus        : string;
    status           : string;
    stages           : GameplayGameStage[];
    stagesCreated    : number;
    notes            : string;
    history          : GameplayHistory[];
}

export interface GameplayGameStage{
    gameplayGame    : GameplayGame;
    id              : number;
    name            : string;
    description     : string;
    status          : GameplayStageStatusOptions;
    oldStatus       : GameplayStageStatusOptions;
    createdDate     : string;
    lastModifiedDate: string;
}

export interface GameplayHistory{
    play: GameplayGame;
    type: HistoryType;
    text: string;
}

export enum GameplayStatusOptions {
    NaLista   = 'Na lista',
    Pausado   = 'Pausado',
    Jogando   = 'Jogando',
    Concluido = 'Concluído'
}

export enum GameplayStageStatusOptions {
    EmProgresso = 'Em progresso',
    Pausado     = 'Pausado',
    Concluido   = 'Concluído'
}

export enum Filters {
    Generos        = 'Gêneros',
    Plataformas    = 'Plataformas',
    Empresas       = 'Empresas',
    Franquias      = 'Franquias',
    Nota           = 'Nota',
    DataLancamento = 'Data de lançamento'
}

export enum HistoryType {
    CriacaoPlay,
    StatusPlay,
    AdicionarStage,
    DeletarStage,
    TituloStage,
    StatusStage
}