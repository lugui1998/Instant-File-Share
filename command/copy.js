const fs = require('fs');
const ncp = require("copy-paste");
const request = require('request');
const crypto = require('crypto');

const ipSource = `https://api.ipify.org/?format=text`;
const localServerPort = 8021;


(async () => {
    // get the file path from argv
    const filePath = process.argv[2];
    const fileData = await requestFileServe(filePath);

    // grab the IP and generate the URL
    const ip = await getIP();
    const url = `http://${ip}/${fileData.routeName}`;

    await ncp.copy(url);
})();


function requestFileServe(filePath) {
    return new Promise((resolve, reject) => {
        request.post(
            `http://localhost:${localServerPort}/serve`,
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
        request(ipSource, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}
