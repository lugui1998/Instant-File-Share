const fs = require('fs');
const ncp = require("copy-paste");
const request = require('request');

const Config = require('./config.json');


(async () => {
    try {
        // get the file path from argv
        const filePath = process.argv[2];
        const fileData = await requestFileServe(filePath);

        // grab the IP and generate the URL
        const ip = await getIP();


        let url = `http://${ip}`;

        if(Config.customDomain){
            url = Config.customDomain;
        }

        if(Config.urlPort != 80) {
            url += `:${Config.urlPort}`;
        }

        url += `/${fileData.routeName}`;

        await ncp.copy(url);
    } catch (e) {
        console.log(e);
        fs.appendFileSync(`c:/ifsCommand.log`, `${new Date()} - ${e}\r\n`);
    }
})();

function requestFileServe(filePath) {
    return new Promise((resolve, reject) => {
        request.post(
            `http://localhost:${Config.localServerPort}/serve`,
            { json: { filePath: filePath } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            }
        );
    });
}

function getIP() {
    // get the IP from ipSource
    // assumes it is plain text
    return new Promise((resolve, reject) => {
        request(Config.ipSource, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}
