import express from 'express';
import bodyParser from 'body-parser';
import Random from '../Utils/Random.js';
import request from 'request';
import { db, Config } from '../server.js';

export interface ServedFile {
    routeName: string;
    filePath: string;
    url: string;
}

export default class FileServer {
    private app: express.Application;
    private _events = {};

    constructor() {
        // express server with one GET route
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.listen(Config.localAPI.port, () => {
            console.log(`[API] Server listening on port ${Config.localAPI.port}.`);
        });

        /* Defune the routes */

        // Add file
        this.app.post('/serve', async (req, res) => {
            try {
                const body = req.body;

                await db.read();
                db.data ||= { files: [] };

                // check if the file is alread served
                const file = db.data.files.find((file) => file.filePath === body.filePath);

                const fileServe: ServedFile = {
                    routeName: '',
                    filePath: '',
                    url: ''
                }

                // get the file extension
                const fileExtension = body.filePath.split('.').pop();

                // if the file is already served, return the url
                if (file) {
                    fileServe.routeName = file.routeName;
                    fileServe.filePath = file.filePath;
                    fileServe.url = await this.getURL(file.routeName);

                    const responseJson = JSON.stringify(fileServe, null, 4);
                    res.send(responseJson);
                    return;
                }

                // if the file is not already served, create a new route

                fileServe.routeName = Random.string(10);
                fileServe.routeName = fileExtension ? fileServe.routeName + '.' + fileExtension : fileServe.routeName;
                fileServe.filePath = body.filePath;
                fileServe.url = await this.getURL(fileServe.routeName);

                const responseJson = JSON.stringify(fileServe, null, 4);
                res.send(responseJson);

                this.emit('serve', fileServe);

            } catch (error) {
                res.status(500).send(error);
                throw error;
            }
        });

    }

    private async getURL(routeName: string) {
        let url = 'http://';

        if (Config.localAPI.customDomain) {
            url = Config.localAPI.customDomain;
        } else {
            url += await this.getIP();
        }

        console.log(url);

        if (![80, 443].includes(Config.localAPI.urlPort)) {
            url += `:${Config.localAPI.urlPort}`;
        }

        url += `/${routeName}`;

        return url;
    }

    public getIP() {
        // get the IP from ipSource
        // assumes it is plain text
        return new Promise((resolve, reject) => {
            request(Config.localAPI.ipSource, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    }

    public on(name, listener) {
        if (!this._events[name]) {
            this._events[name] = [];
        }

        this._events[name].push(listener);
    }

    public removeListener(name, listenerToRemove) {
        if (!this._events[name]) {
            throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
        }

        const filterListeners = (listener) => listener !== listenerToRemove;

        this._events[name] = this._events[name].filter(filterListeners);
    }

    private emit(name, data) {
        if (!this._events[name]) {
            return;
        }

        const fireCallbacks = (callback) => {
            callback(data);
        };

        this._events[name].forEach(fireCallbacks);
    }

}