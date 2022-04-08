import express from 'express';
import bodyParser from 'body-parser';


export default class FileServer {
    private app: express.Application;
    private _events = {};

    constructor(port: number) {
        // express server with one GET route
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.listen(port, () => {
            console.log(`[File] Server listening on port ${port}.`);
        });
    }

    public serveFile(route: string, filePath: string) {
        // replace "\\ and \\" with "/"
        filePath = filePath.replace(/\\/g, '/');
        const fileName = filePath.split('/').pop();

        this.app.get(route, (req, res) => {
            res.set('Content-disposition', `attachment; filename=${fileName}`);
            res.sendFile(filePath);
            this.emit('serve', { route, filePath, req });
        });
    }

    public removeRoute(route: string) {
        this.app._router.stack.forEach((middleware, index, stack) => {
            if (middleware.route && middleware.route.path === route) {
                stack.splice(index, 1);
            }
        });

        this.app.get(route, (req, res) => {
            this.emit('requestFail', { route});
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