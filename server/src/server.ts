import * as fs from 'fs';
import { Low, JSONFile } from 'lowdb';
import axios from 'axios';

import FileServer from './FileServer/FileServer.js';
import LocalAPI from './LocalAPI/LocalAPI.js';

const Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

export interface Data {
    files: {
        routeName: string;
        filePath: string;
        timesServed: number
        createdAt: Date;
        lastServedAt: Date;
    }[]
}


let db: Low<Data>;
let fileServer: FileServer;
let localAPI: LocalAPI;

(async () => {
    const filePath = Config.databasePath;
    const adapter = new JSONFile<Data>(filePath)
    db = new Low<Data>(adapter);


    fileServer = new FileServer();
    localAPI = new LocalAPI();

    // On Start, load files that should be served from db
    await db.read();
    db.data ||= { files: [] };
    await db.write();
    db.data.files.forEach(file => {
        fileServer.serveFile(`${Config.fileServer.baseRoute}${file.routeName}`, file.filePath);
    });

    // API Requested a file to be served
    localAPI.on('serve', async (fileServe) => {
        const routeName = fileServe.routeName;
        const filePath = fileServe.filePath;

        await db.read();
        db.data ||= { files: [] };


        // check if the file is alread served
        const isServed = db.data.files.find((file) => file.filePath === filePath);

        if (isServed) {
            console.log(`[API] File "${filePath}" is already served.`);
            return;
        }

        // serve the file
        fileServer.serveFile(`${Config.fileServer.baseRoute}${routeName}`, filePath);

        // add the file to the database
        const fileData = {
            routeName: routeName,
            filePath: filePath,
            timesServed: 0,
            createdAt: new Date(),
            lastServedAt: new Date()
        }
        db.data.files.push(fileData);
        await db.write();

        // watch the file. If it changes, stop serving it and remove it from the database

        fs.watch(filePath, async (eventType, filename) => {
            // on delete
            if (eventType === 'rename') {

                console.log(`[API] File "${filePath}" ${eventType}.`);
                await db.read();
                db.data ||= { files: [] };

                const file = db.data.files.find((file) => file.filePath === filePath);

                if (!file) {
                    return;
                }

                // stop serving the file
                fileServer.removeRoute(`${Config.fileServer.baseRoute}${file.routeName}`);

                // remove the file from the database
                db.data.files = db.data.files.filter((file) => file.filePath !== filePath);
                await db.write();

                // if the file is deleted, it doens't need to be watched anymore
                fs.unwatchFile(filePath);
            }

        });


    });

    fileServer.on('serve', async (fileServe) => {
        const route = fileServe.route;
        const filePath = fileServe.filePath;
        const req = fileServe.req;

        await db.read();
        db.data ||= { files: [] };

        // get the request IP
        const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(`[FileServer] ${ip} requested ${route} - ${filePath}`);

        // find the file entry in the database
        // the filePath and the database entry may not have consistent slashes
        const file = db.data.files.find((file) => file.filePath.replace(/\\/g, '/') === filePath.replace(/\\/g, '/'));

        if (file) {
            file.timesServed++;
            file.lastServedAt = new Date();

            if (Config.fileServer.maxTimesServed > 0 && file.timesServed >= Config.fileServer.maxTimesServed) {
                console.log(`[FileServer] File "${filePath}" has been served the maximum amount of times.`);
                fileServer.removeRoute(route);
                db.data.files = db.data.files.filter((file) => file.filePath !== filePath);
            }
        }

        await db.write();

    });

    fileServer.on('notFound', async (fileServe) => {
        // remove route
        fileServer.removeRoute(fileServe.route);
    });

    // clean up files
    setInterval(async () => {
        await db.read();
        db.data ||= { files: [] };

        db.data.files = db.data.files.filter((file) => {
            // if the file has been served the maximum amount of times, remove it
            if (Config.fileServer.maxTimesServed > 0 && file.timesServed >= Config.fileServer.maxTimesServed) {
                console.log(`[FileServer] File "${file.filePath}" has been served the maximum amount of times.`);
                fileServer.removeRoute(`${Config.fileServer.baseRoute}${file.routeName}`);
                return false;
            }

            //if the file has not ben served within the maxInactiveTime, remove it
            const timeSinceLastServed = new Date().getTime() - new Date(file.lastServedAt).getTime();
            if (Config.fileServer.maxInactiveTime > 0 && timeSinceLastServed >= Config.fileServer.maxInactiveTime) {
                console.log(`[FileServer] File "${file.filePath}" has not been served in the last ${Config.fileServer.maxInactiveTime} milliseconds.`);
                fileServer.removeRoute(`${Config.fileServer.baseRoute}${file.routeName}`);
                return false;
            }

            // if the file is too old, remove it
            const timeSinceCreated = new Date().getTime() - new Date(file.createdAt).getTime();
            if (Config.fileServer.maxAge > 0 && timeSinceCreated >= Config.fileServer.maxAge) {
                console.log(`[FileServer] File "${file.filePath}" has been created ${timeSinceCreated} milliseconds ago.`);
                fileServer.removeRoute(`${Config.fileServer.baseRoute}${file.routeName}`);
                return false;
            }

            return true;
        });

        await db.write();

    }, Config.cleanupInterval * 1000 * 60);

    if (Config.ddns.url && Config.ddns.auth) {
        // make periodic requests to the DDNS server
        // pass X-Auth as a header
        setInterval(async () => {
            await axios.get(Config.ddns.url, {
                headers: {
                    'X-Auth': Config.ddns.auth
                }
            });
        });
    }
})();

export {
    db,
    Config,
}

