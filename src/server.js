//se o modo de desenvolvimento for diferente de production,
// vira os dados de segurança
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

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
).toString('base64')

axios({
    method: 'POST',
    url: `${process.env.GN_ENDPOINT}/oauth/token`,
    headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
    },
    httpsAgent: agent,
    data: {
        grant_type: 'client_credentials'
    }
}).then(console.log)





/*
curl --request POST \
  --url https://api-pix-h.gerencianet.com.br/oauth/token \
  --header 'Authorization: Basic Q2xpZW50X0lkXzQxODk0NDFlNmE1ZTc5YWIwNTQ1YzliNjJiZmE2YTNiMmU2ODQ5MmQ6Q2xpZW50X1NlY3JldF9iYmQ1ZWM3N2ZjZmZkZjliOTI3NjE3MTNjMThjOTM4MjI0ZDA5OGM2' \
  --header 'Content-Type: application/json' \
  --data '{
	"grant_type": "client_credentials"
}'
*/