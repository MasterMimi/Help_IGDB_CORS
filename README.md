Projeto pessoal desenvolvido com Ionic 5 + Angular. Preciso de ajuda quanto à problemas com o CORS, mais especificamente ao tentar hospedar na web (por Netlify ou Firebase). Estou usando a API IGDB da Twitch, que é bem restritiva quanto a isso. Já passei horas tentando todas as prováveis soluções possíveis, tais como estas:

- Configurar Proxy no ionic.config.json -> Não funciona pois dá erro 404

![ionic-1](https://user-images.githubusercontent.com/69723545/177648185-0cd3647d-33fa-4e8b-bd68-ff7ed7274bdc.png)

- Configurar arquivo proxy.conf.json para inicializar nos builds/serves através de mudanças no angular.json -> Também dá o 404

![ionic-2](https://user-images.githubusercontent.com/69723545/177648230-ed7eaa8b-8aba-4913-8e8a-1d26acc94644.png)

- Também já tentei usar métodos diferentes de bibliotecas diferentes pra fazer as operações de GET e POST, e nada deu certo também.

- A única solução que achei, e que funcionou perfeitamente ao rodar tanto pelo browser (ionic serve) quanto pelo meu dispositivo Android, foi seguir a solução presente nesse repo https://github.com/Freeboard/thingproxy:

![ionic-3](https://user-images.githubusercontent.com/69723545/177648257-e2fdd75e-d2ca-4a53-9391-9bdedb165f41.png)

Porém, o erro do CORS volta ao rodar a aplicação de forma hospedada, tanto no Netlify quanto no Firebase.

Preciso de toda ajuda que puder, só me falta resolver isto pra poder finalizar o projeto e poder publicar em meu portfólio. Por favor não reparem na bagunça que está o código, sou apenas uma estudante recém formada em Ciência da Computação 😁

Sintam-se a vontade pra clonar o repo e ajustar o código como for preciso (apenas gerem as suas chaves no site da Twitch, e adicionem no arquivo token.service.ts). Caso alguma solução tenha funcionado, podem entrar em contato comigo pelo meu LinkedIn https://www.linkedin.com/in/michellenascimentosilva/.

Agradeço antecipadamente pela atenção!
