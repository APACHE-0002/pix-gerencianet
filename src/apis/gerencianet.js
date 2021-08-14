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
    path.resolve(__dirname, `../../certs/${process.env.GN_CERT}`)
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

const authenticate = () => {

     //axios.post enviando, o token transformado, o certificado,
// entao no .then, ja com a resposta

   return axios({
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
    });

}


const GNRequest = async () => {
    const authResponse = await authenticate();
    const accessToken = authResponse.data?.access_token;

    return axios.create({
        baseURL: process.env.GN_ENDPOINT,
        httpsAgent: agent,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
}
   

module.exports = GNRequest;