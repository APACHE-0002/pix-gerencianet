//se o modo de desenvolvimento for diferente de production,
// vira os dados de segurança
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express');
const GNRequest = require('./apis/gerencianet');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqGNAlready = GNRequest();

app.get('/', async (req, res) => {
    const reqGN = await reqGNAlready;
    const dataCob ={
        calendario: {
            expiracao: 3600
        },
        valor:{
            original: '100.00'
        },
        chave: '48762700820',
        solicitacaoPagador: 'Cobrança dos serviços'
    };


    const cobResponse = await reqGN.post('/v2/cob', dataCob);

    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);

    //se der mais de um res.send, a aplicaçao retornara erro

    
    res.render('qrcode',  { qrcodeImage: qrcodeResponse.data.imagemQrcode });




/*
curl --request POST \
  --url https://api-pix-h.gerencianet.com.br/oauth/token \
  --header 'Authorization: Basic Q2xpZW50X0lkXzQxODk0NDFlNmE1ZTc5YWIwNTQ1YzliNjJiZmE2YTNiMmU2ODQ5MmQ6Q2xpZW50X1NlY3JldF9iYmQ1ZWM3N2ZjZmZkZjliOTI3NjE3MTNjMThjOTM4MjI0ZDA5OGM2' \
  --header 'Content-Type: application/json' \
  --data '{
	"grant_type": "client_credentials"
}'
*/

});

app.listen(8000, () => {
    console.log('running');
});

