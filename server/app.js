let express = require('express'),
     _ = require('underscore'),
    app = express();

let session = require('express-session');
app.use(session({
  secret: 'geiserbybmm',
  resave: true,
  saveUninitialized: true
}));

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
let fs = require('fs');
var db = {
  jogadores: JSON.parse(fs.readFileSync(__dirname+'/data/jogadores.json'),'utf8'),
  jogosPorJogador: JSON.parse(fs.readFileSync(__dirname+'/data/jogosPorJogador.json'),'utf8')
};

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');
app.set('views', 'server/views');


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
app.get('/', function(request, response) {

  if (request.session.views) {  // contador de vis. nesta sessão
    request.session.views++;
  } else {
    request.session.views = 1;
  }

  response.render('index', {
    jogadores: db.jogadores.players,
    numSessoes: request.session.views
  });

});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código
app.get('/jogador/:steamid', function(request, response) {
  let jogador = _.find(db.jogadores.players, function(el) {
    return el.steamid === request.params.steamid;
  });

  let jogosDoJogador = db.jogosPorJogador[request.params.steamid];

  //Contando jogos jogados e não jogados
  jogador.quantidadeJogos = jogosDoJogador.game_count;
  let qtd=0;
  jogosDoJogador.games.forEach(function(jogo){
    if(jogo.playtime_forever === 0) qtd++;
  });
  jogador.numJogosNaoJogados = qtd;
  jogador.numJogosJogados = jogador.quantidadeJogos - qtd;

  //Ordenar decrescente por playtime_forever e pegar 5 primeiros (http://fegemo.github.io/cefet-web/classes/ssn4/#20)
  let ordenadoDesc = _.sortBy(jogosDoJogador.games, function(el) {
    return -el.playtime_forever;
  });

  let primeiros5 = _.first(ordenadoDesc, 5);
  jogosDoJogador.games = primeiros5;

  //Arredondando minutos para horas
  jogosDoJogador.games.forEach(function(jogo){
    jogo.playtime_forever = Math.round(jogo.playtime_forever/60);
  });



  response.render('jogador', {
    player: jogador,
    jogos: jogosDoJogador.games,
    jogoFavorito: jogosDoJogador.games[0]
  });
});


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(__dirname + '/../client'));

// abrir servidor na porta 3000
// dica: 1-3 linhas de código
let server = app.listen(3000, function () {
  console.log('Servidor escutando!');
});
