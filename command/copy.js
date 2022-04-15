const fs = require('fs');
const ncp = require("copy-paste");
const request = require('request');

const localServerPort = 8021;

(async () => {
    try {
        // get the file path from argv
        const filePath = process.argv[2];
        const fileData = await requestFileServe(filePath);
        await ncp.copy(fileData.url);
    } catch (e) {
        console.log(e);
    }
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


