//se o modo de desenvolvimento for diferente de production,
// vira os dados de segurança
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const { reset } = require('nodemon');

//utilizando do fs para que o diretorio apontado consiga ser lido
// em qualquer tipo de sistema, windows, mac, etc...
// __dirname aponta diretamente ao repositorio em questao
// ../ retorna uma pasta
// const cert esta direcionando ao arquivo de certificado
const cert = fs.readFileSync(
    path.resolve(__dirname, `../certs/${process.env.GN_CERT}`)
)

//certificado
const agent = new https.Agent({
    pfx: cert,
    passphrase: ''
});

//somando clientid e clientsecurity, e transformando em base64, 
// que é a transformaçao necessaria pra fazer o token
//token tipo basic
const credentials = Buffer.from(
    `${process.env.GN_CLIENT_ID}:${process.env.GN_CLIENT_SECRET}`
).toString('base64');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/', async (req, res) => {

    //axios.post enviando, o token transformado, o certificado,
// entao no .then, ja com a resposta
const authResponse = await axios({
    method: 'POST',
    url: `${process.env.GN_ENDPOINT}/oauth/token`,
    headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type':'application/json'
    },
    httpsAgent: agent,
    data: {
        grant_type: 'client_credentials'
    }
})


    const accessToken = authResponse.data?.access_token;

    const reqGN = axios.create({
        baseURL: process.env.GN_ENDPOINT,
        httpsAgent: agent,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

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

