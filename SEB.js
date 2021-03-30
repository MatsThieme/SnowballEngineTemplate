const { writeFile, mkdir, readdir, lstat, unlink, rmdir, copyFile, stat, access } = require('fs');
const { resolve, join } = require('path');
const { createServer } = require('http');
const { readFile } = require('fs');
const { getType } = require('mime');
const webpack = require('webpack');
const { promisify } = require('util');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const utility = {
    getProcessParameter: (name) => {
        return process.argv.slice(2).includes(name);
    },
    readTextFile: async (path) => {
        try {
            return await promisify(readFile)(path, { encoding: 'utf8' });
        } catch {
            console.log(`could not read ${path}`);
            return '';
        }
    },
    readJSONFile: async (path) => {
        return JSON.parse(await utility.readTextFile(path) || '{}');
    },
    writeTextFile: async (path, text) => {
        await promisify(writeFile)(path, text, { encoding: 'utf8' });
    },
    writeJSONFile: async (path, object) => {
        await utility.writeTextFile(path, JSON.stringify(object));
    },
    mkdir: async (path) => {
        try {
            await promisify(mkdir)(path);
        } catch {
            console.log(`could not create dir ${path}`);
        }
    },
    copyFolder: async (from, to) => { // https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js#answer-52338335
        await utility.mkdir(to);

        for (const element of await promisify(readdir)(from)) {
            if ((await promisify(lstat)(resolve(from, element))).isFile()) {
                await promisify(copyFile)(resolve(from, element), resolve(to, element));
            } else {
                await utility.copyFolder(resolve(from, element), resolve(to, element));
            }
        }
    },
    deleteFolderRecursive: async (path) => { // https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty#answer-32197381
        try {
            await promisify(access)(path);

            for (const file of await promisify(readdir)(path)) {
                const curPath = resolve(path, file);
                if ((await promisify(lstat)(curPath)).isDirectory()) {
                    await utility.deleteFolderRecursive(curPath);
                } else {
                    await promisify(unlink)(curPath);
                }
            }

            await promisify(rmdir)(path);
        } catch (err) { }
    },
    listDir: async (dir, filelist = [], startDir = dir) => {
        for (const file of await promisify(readdir)(dir)) {
            if ((await promisify(stat)(resolve(dir, file))).isDirectory()) await utility.listDir(resolve(dir, file), filelist, startDir);
            else {
                const d = dir.substr(startDir.length + 1).replace(/\\/g, '/');
                if (!d) filelist.push(file);
                else filelist.push(d + '/' + file);
            }
        }

        return filelist;
    },
    getAssetType: (path) => {
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
    },
    /**
     * 
     * @param {string} path 
     * @returns AssetDB object
     */
    readAssets: async (path) => {
        const assetDB = {};

        for (const p of await utility.listDir(path)) {
            if (p === 'AssetDB.json' || p === 'InputMappingButtons.json' || p === 'InputMappingAxes.json') continue;

            assetDB[p] = {
                type: utility.getAssetType(p)
            }
        }

        return assetDB;
    },
    portAvailable: (port) => {
        return new Promise(resolve => server = createServer().listen(port, () => resolve(true) || server.close()).on('error', () => resolve(false)));
    },
    getAvailablePort: async (start = 0) => {
        for (let i = start; i < 65535; i++) {
            if (await utility.portAvailable(i)) return i;
        }

        return start;
    },
    bytesToString: (bytes) => {
        const names = ['B', 'KB', 'MB'];

        for (let i = 0; i < names.length; i++) {
            if (bytes / 1024 ** i < 1024) return (bytes / 1024 ** i).toFixed(2) + ' ' + names[i];
        }
    }
};

const prepare = {
    cleanup: async () => {
        try {
            await utility.deleteFolderRecursive(distpath);
        } catch { }
        await utility.mkdir(distpath);
    },
    config: async () => {
        return await utility.readJSONFile(configpath);
    }
};


const distpath = resolve('dist');
const assetpath = resolve('Assets');
const distassetpath = resolve('dist/Assets');
const configpath = resolve('SnowballEngineConfig.json');
const assetDBpath = resolve('Assets/AssetDB.json');

const _build = utility.getProcessParameter('-build') || utility.getProcessParameter('--b');
const _debugbuild = utility.getProcessParameter('-debugbuild') || utility.getProcessParameter('--d');
const _createADB = utility.getProcessParameter('-createADB') || utility.getProcessParameter('--c');
const _updateADB = utility.getProcessParameter('-updateADB') || utility.getProcessParameter('--u');
const _server = utility.getProcessParameter('-server') || utility.getProcessParameter('--s');


const port = 3000;



start();

async function start() {
    const config = await prepare.config();

    if (_createADB) await createADB();
    if (_updateADB || (_build || _debugbuild) && config.build.updateADB) await updateADB();
    if (_build) await build(config);
    if (_debugbuild) await debugbuild(config);
    if (_server) await server();
}

async function build(config) {
    console.log('start build');
    const start = Date.now();

    await prepare.cleanup();

    await utility.copyFolder(assetpath, distassetpath);

    await promisify(unlink)(resolve(distassetpath, 'AssetDB.json'));
    await promisify(unlink)(resolve(distassetpath, 'InputMappingButtons.json'));
    await promisify(unlink)(resolve(distassetpath, 'InputMappingAxes.json'));


    const webpackConfig = require('./webpack.config.js');

    webpackConfig.mode = 'production';
    webpackConfig.devtool = undefined;
    webpackConfig.plugins = [new HtmlWebpackPlugin({
        title: config.title,
        meta: { description: config.description },
        template: './src/index.html'
    })];

    await new Promise(resolve => webpack(webpackConfig, (err, stats) => err || stats.hasErrors() ? console.log(err || stats.toString()) : resolve()));

    console.log('build time:', (Date.now() - start) / 1000 + 's');
    console.log('file size:', utility.bytesToString((await promisify(stat)(distpath + '/main.js')).size));
}

async function debugbuild(config) {
    console.log('start build');
    const start = Date.now();

    await prepare.cleanup();

    await utility.copyFolder(assetpath, distassetpath);

    await promisify(unlink)(resolve(distassetpath, 'AssetDB.json'));
    await promisify(unlink)(resolve(distassetpath, 'InputMappingButtons.json'));
    await promisify(unlink)(resolve(distassetpath, 'InputMappingAxes.json'));


    const webpackConfig = require('./webpack.config.js');

    webpackConfig.mode = 'development';
    webpackConfig.devtool = 'inline-source-map';
    webpackConfig.plugins = [new HtmlWebpackPlugin({
        title: config.title,
        meta: {
            description: config.description,
        },
        template: './src/index.html'
    })];

    await new Promise(resolve => webpack(webpackConfig, (err, stats) => err || stats.hasErrors() ? console.log(err || stats.toString()) : resolve()));

    console.log('build time:', (Date.now() - start) / 1000 + 's');
    console.log('file size:', utility.bytesToString((await promisify(stat)(distpath + '/main.js')).size));
}

async function server() {
    const p = await utility.getAvailablePort(port);

    createServer((request, response) => {
        let path = join(__dirname, 'dist', decodeURI(request.url));

        if (request.url === '/') path += 'index.html';

        const contentType = getType(path);

        console.log(decodeURI(request.url));

        readFile(path, (error, content) => {
            if (error) console.log(error.message);

            response.setHeader('Content-Type', contentType);
            response.end(content, 'utf-8');
        });
    }).listen(p);

    console.log('http://localhost:' + p);
}

async function createADB() {
    const adb = await utility.readAssets(assetpath);

    await utility.writeJSONFile(assetDBpath, adb);

    console.log('created AssetDB.json');
}

async function updateADB() {
    const assets = await utility.readAssets(assetpath);
    const adb = await utility.readJSONFile(assetDBpath);

    for (const key of Object.keys(adb)) {
        if (Object.keys(adb[key]).length > 1) assets[key] = adb[key]; // 1 key == type, 2 keys == type and asset name
    }

    await utility.writeJSONFile(assetDBpath, assets);

    console.log('updated AssetDB.json');
}