const fs = require('fs');
const request = require('request');

const localServerPort = 1021;

(async () => {
    try {
        request.get(`http://localhost:${localServerPort}/toggleUpload`).on('response', (response) => {
            if (response.statusCode === 200) {
                console.log('Upload toggled');
            } else {
                console.log('Upload toggle failed');
            }
        });
    } catch (e) {
        console.log(e);
    }
})();



