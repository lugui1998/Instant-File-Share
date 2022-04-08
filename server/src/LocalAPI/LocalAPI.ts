import express from 'express';
import bodyParser from 'body-parser';
import Random from '../Utils/Random.js';
import { db } from '../server.js';


export default class FileServer {
    private app: express.Application;
    private _events = {};

    constructor(port: number) {
        // express server with one GET route
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.listen(port, () => {
            console.log(`[API] Server listening on port ${port}.`);
        });

        /* Defune the routes */

        // Add file
        this.app.post('/serve', async (req, res) => {
            const body = req.body;

            await db.read();
            db.data ||= { files: [] };

            // check if the file is alread served
            const file = db.data.files.find((file) => file.filePath === body.filePath);

            if (file) {
                res.send(JSON.stringify({
                    routeName: file.routeName,
                    filePath: file.filePath,
                }, null, 2));
                return;
            }

            const routeName = Random.string(10);

            const fileServe = {
                routeName: routeName,
                filePath: body.filePath
            }

            if (body.filePath) {
                res.send(JSON.stringify(fileServe));
                this.emit('serve', fileServe);
                return;
            }

            // error
            res.status(400).send('Bad request.');
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