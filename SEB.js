const { writeFile, mkdir, readdir, exists, lstat, unlink, rmdir, copyFile, stat } = require('fs');
const { resolve, join } = require('path');
const { createServer } = require('http');
const { readFile } = require('fs');
const { getType } = require('mime');
const webpack = require('webpack');
const { promisify } = require('util');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = resolve('dist');
const assetPath = resolve('Assets');
const configPath = resolve('SnowballEngineConfig.json');
const distAssetPath = resolve(distPath, 'Assets');
const assetDBPath = resolve(assetPath, 'AssetDB.json');

const newAssetDB = getProcessParameter('-newassetdb') || getProcessParameter('--a');
const mergeAssetDB = getProcessParameter('-mergenewassetdb') || getProcessParameter('--m');
const debugBuild = getProcessParameter('-debug') || getProcessParameter('--d');
const dserver = getProcessParameter('-server') || getProcessParameter('--s');


const port = 3000;
let config;


start();


async function start() {
    if (dserver) {
        serve(await getAvailablePort(port));
        return;
    }

    const start = Date.now();

    if (!await promisify(exists)(configPath)) await writeJSONFile(configPath, { title: '', description: '' });
    if (!await promisify(exists)(assetPath + '/InputMappingButtons.json')) await writeJSONFile(assetPath + '/InputMappingButtons.json', { touch: { Trigger: 0 }, keyboard: {}, mouse: { Trigger: 0 }, gamepad: {} });
    if (!await promisify(exists)(assetPath + '/InputMappingAxes.json')) await writeJSONFile(assetPath + '/InputMappingAxes.json', { touch: { PointerPosition: 0 }, keyboard: {}, mouse: { PointerPosition: 0 }, gamepad: {} });


    config = await loadJSONFile(configPath);

    const aDBExists = await promisify(exists)(assetDBPath);
    if (newAssetDB || mergeAssetDB || !aDBExists || config.build.addNewAssetsToDB) {
        console.log('create asset db');

        let db = await createAssetDB(assetPath);

        if (mergeAssetDB || config.build.addNewAssetsToDB) {
            console.log('merge existing with new asset db');
            db = mergeAssetDBs(JSON.stringify(await loadJSONFile(assetDBPath)) || '{}', db);
        }

        console.log('write asset db');
        await promisify(writeFile)(assetDBPath, db);

        if (aDBExists && !config.build.addNewAssetsToDB) return;
    }

    console.log('start build');

    await build();

    console.log('build finished');

    console.log('in', (Date.now() - start) / 1000 + 's');

    console.log('file size:', bytesToString((await promisify(stat)(distPath + '/main.js')).size));
}

async function build() {
    try {
        await deleteFolderRecursive(distPath);
        await mkdirAsync(distPath);

        await copyFolder(assetPath, distAssetPath);

        await promisify(unlink)(distAssetPath + '/AssetDB.json');
        await promisify(unlink)(distAssetPath + '/InputMappingButtons.json');
        await promisify(unlink)(distAssetPath + '/InputMappingAxes.json');

        const webpackConfig = require('./webpack.config.js');

        webpackConfig.mode = debugBuild ? 'development' : 'production';
        webpackConfig.devtool = debugBuild ? 'inline-source-map' : undefined;
        webpackConfig.plugins = [new HtmlWebpackPlugin({
            title: config.title,
            meta: {
                description: config.description,
            },
            template: './src/index.html'
        })];

        await new Promise(resolve => webpack(webpackConfig, (err, stats) => err || stats.hasErrors() ? console.log(err || stats.toString()) : resolve()));
    } catch (error) {
        console.log(error);
    }
}

function getProcessParameter(name) {
    return process.argv.slice(2).includes(name);
}

async function loadJSONFile(path) {
    try {
        return JSON.parse(await loadTextFile(path));
    } catch { }
}

async function loadTextFile(path) {
    try {
        return await promisify(readFile)(path, { encoding: 'utf8' });
    } catch { }
}

async function writeJSONFile(path, object) {
    await promisify(writeFile)(path, JSON.stringify(object), { encoding: 'utf8' });
}

async function mkdirAsync(path) {
    if (!await promisify(exists)(path)) await promisify(mkdir)(path);
}


async function copyFolder(from, to) { // https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js#answer-52338335
    await mkdirAsync(to);
    for (const element of await promisify(readdir)(from)) {
        if ((await promisify(lstat)(resolve(from, element))).isFile()) {
            await promisify(copyFile)(resolve(from, element), resolve(to, element));
        } else {
            await copyFolder(resolve(from, element), resolve(to, element));
        }
    }
}

async function deleteFolderRecursive(path) { // https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty#answer-32197381
    if (await promisify(exists)(path)) {
        for (const file of await promisify(readdir)(path)) {
            const curPath = resolve(path, file);
            if ((await promisify(lstat)(curPath)).isDirectory()) {
                await deleteFolderRecursive(curPath);
            } else {
                await promisify(unlink)(curPath);
            }
        }

        await promisify(rmdir)(path);
    }
}


/* AssetDB start */

async function listDir(dir, filelist = [], startDir = dir) {
    for (const file of await promisify(readdir)(dir)) {
        if (file === 'AssetDB.json' || file === 'InputMappingButtons.json' || file === 'InputMappingAxes.json') continue;
        if ((await promisify(stat)(resolve(dir, file))).isDirectory()) await listDir(resolve(dir, file), filelist, startDir);
        else {
            const d = dir.substr(startDir.length + 1).replace(/\\/g, '/');
            if (!d) filelist.push(file);
            else filelist.push(d + '/' + file);
        }
    }

    return filelist;
}

function getAssetType(path) {
    const match = path.match(/.+\.(\w*)$/);

    if (match && match[1]) {
        switch (match[1].toLowerCase()) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'apng':
            case 'bmp':
            case 'gif': return 0;
            case 'mp3':
            case 'wav':
            case 'ogg': return 1;
            case 'mp4':
            case 'ogg':
            case 'webm': return 2;
            case 'txt':
            case 'text': return 3;
            case 'json': return 5;
            case 'otf':
            case 'woff':
            case 'woff2':
            case 'ttf': return 6;
        }
    }

    return 4;
}

async function createAssetDB(path) {
    const assetDB = {};

    for (const p of await listDir(path)) {
        assetDB[p] = {
            name: '',
            type: getAssetType(p),
            mimeType: getType(p)
        }
    }

    return JSON.stringify(assetDB);
}

function mergeAssetDBs(...dbs) {
    return JSON.stringify(dbs.map(db => JSON.parse(db)).reduce((t, c) => {
        for (const o1 in c) {
            let exists;

            for (const o2 in t) {
                if (o1 === o2) {
                    exists = true;

                    for (const p in c[o1]) {
                        t[o1][p] = c[o1][p] || t[o1][p];
                    }

                    break;
                }
            }

            if (!exists) t[o1] = c[o1];
        }

        return t;
    }, {}));
}

/* AssetDB end */


/* Debug server */
function serve(port) {
    createServer((request, response) => {
        let path = join(__dirname, 'dist', decodeURI(request.url));

        if (request.url === '/') path += 'index.html';

        const contentType = getType(path);

        readFile(path, (error, content) => {
            if (error) console.log(error.message);

            response.setHeader('Content-Type', contentType);
            response.end(content, 'utf-8');
        });

        console.log(decodeURI(request.url));
    }).listen(port);

    console.log('http://localhost:' + port);
}

async function getAvailablePort(start = 0) {
    for (let i = start; i < 65535; i++) {
        if (await portAvailable(i)) return i;
    }

    return start;
}

function portAvailable(port) {
    return new Promise(resolve => server = createServer().listen(port, () => resolve(true) || server.close()).on('error', () => resolve(false)));
}

function bytesToString(bytes) {
    const names = ['B', 'KB', 'MB'];
    for (let i = 0; i < names.length; i++) {
        if (bytes / 1024 ** i < 1024) return (bytes / 1024 ** i).toFixed(2) + ' ' + names[i];
    }
}