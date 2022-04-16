import * as fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import * as mime from 'mime-types'; 

import { Config } from '../server.js';

export default class FileServer {
    private app: express.Application;
    private _events = {};

    constructor() {

        // express server with one GET route
        this.app = express();
        this.app.use(bodyParser.json());

        this.app.listen(Config.fileServer.port, function () {
            console.log(`[File] Server listening on port ${Config.fileServer.port}.`);
        });

        let options = {};
        if (Config.fileServer.cert && Config.fileServer.key) {
            // check if those files exist
            if (fs.existsSync(Config.fileServer.cert) && fs.existsSync(Config.fileServer.key)) {
                options = {
                    cert: fs.readFileSync(Config.fileServer.cert, 'utf8'),
                    key: fs.readFileSync(Config.fileServer.key, 'utf8'),
                };

                https.createServer(options, this.app).listen(Config.fileServer.httpsPort, () => {
                    console.log(`[File] Server listening on port ${Config.fileServer.httpsPort}.`);
                });
            } else {
                console.log(`[File] Couldn't find cert or key files. HTTPS won't be available.`);
            }
        }


        this.app.get(`/ping`, (req, res) => {
            res.send('pong');
        });

        this.app.get(`/`, (req, res) => {
            res.redirect(302, Config.fileServer.rootRedirect);
        });

    }

    public serveFile(route: string, filePath: string) {
        // replace "\\ and \\" with "/"
        filePath = filePath.replace(/\\/g, '/');
        let fileName = filePath.split('/').pop();

        console.log(`[File] Serving file "${fileName}" at route "${route}".`);

        if (fileName) {
            // remove characters that are not allowed in a header
            fileName = fileName.replace(/[^a-zA-Z0-9-_\.]/g, '');

            const fileExtension = fileName.split('.').pop();
            const contentType = mime.lookup(fileExtension);

            this.app.get(`${route}`, (req, res) => {
                res.set('Content-disposition', `${Config.fileServer.contentDisposition}; filename=${fileName}`);
                res.set('Content-type', contentType ? contentType : 'application/octet-stream');
                res.sendFile(filePath);
                this.emit('serve', { route, filePath, req });
            });
        }
    }

    public removeRoute(route: string) {
        this.app._router.stack.forEach((middleware, index, stack) => {
            if (middleware.route && middleware.route.path === route) {
                stack.splice(index, 1);
            }
        });

        this.app.get(route, (req, res) => {
            this.emit('requestFail', { route });
            res.status(410).send('Gone.');
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