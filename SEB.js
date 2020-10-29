const { existsSync, readdirSync, readFileSync, statSync, lstatSync, rmdirSync, unlinkSync, mkdirSync, copyFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const distPath = resolve('dist');
const assetPath = resolve('Assets');
const htmlPath = resolve('src/index.html');
const configPath = resolve('SnowballEngineConfig.json');
const distAssetPath = resolve(distPath, 'Assets');
const distHtmlPath = resolve(distPath, 'index.html');
const tscDistPath = resolve(distPath, 'ts-build');
const assetListPath = resolve(assetPath, 'AssetList.json');

const newAssetList = getProcessParameter('-newassetlist') || getProcessParameter('--a');
const mergeAssetList = getProcessParameter('-mergenewassetlist') || getProcessParameter('--m');
const debugBuild = getProcessParameter('-debug') || getProcessParameter('--d');

const config = loadJSONFile(configPath);


start();


async function start() {
    const start = Date.now();

    if (newAssetList) {
        console.log('create asset list');

        let list = createAssetList(assetPath);

        if (mergeAssetList) {
            console.log('merge asset lists');
            list = mergeAssetLists(JSON.stringify(loadJSONFile(assetListPath)) || [], list)
        }

        console.log('write asset list');
        writeFileSync(assetListPath, list);

        return;
    }

    if (debugBuild) {
        console.log('start debug build');
        await buildDebug();
        console.log('debug build finished');
    } else {
        console.log('start build');
        await build();
        console.log('build finished');
    }

    console.log('in', (Date.now() - start) / 1000 + 's');
}

function buildHTML() {
    let html = loadTextFile(htmlPath);
    html = html.replace(/<title>.*?<\/title>/, `<title>${config.title}</title>`);
    html = html.replace(/<meta name="description"[^\/]*?\/>/, config.description ? `<meta name="description" content="${config.description}" />` : '');
    return html;
}

function createHTML() {
    if (config) writeFileSync(distHtmlPath, buildHTML());
    else copyFileSync(htmlPath, distHtmlPath);
}

async function build() {
    try {
        deleteFolderRecursive(distPath);
        mkdirSync(distPath);

        copyFolderSync(assetPath, distAssetPath);
        createHTML();

        await exec('npx tsc --build');
        await exec('npx webpack ./ts-build/Game.js -o build.js', { cwd: distPath });

        deleteFolderRecursive(tscDistPath);
    } catch (error) {
        console.log(error);
    }
}

async function buildDebug() {
    try {
        deleteFolderRecursive(distPath);
        mkdirSync(distPath);

        copyFolderSync(assetPath, distAssetPath);
        createHTML();

        await exec('npx tsc --build');

        copyFolderSync(tscDistPath, distPath);

        deleteFolderRecursive(tscDistPath);
    } catch (error) {
        console.log(error);
    }
}


function getProcessParameter(name) {
    return process.argv.slice(2).includes(name);
}

function loadJSONFile(path) {
    try {
        return JSON.parse(loadTextFile(path));
    } catch { }
}

function loadTextFile(path) {
    try {
        return readFileSync(path, { encoding: 'utf8' });
    } catch { }
}


async function exec(command = '', options = {}, callback = (error, stdout, stderr) => undefined) {
    return new Promise((resolve, reject) => {
        const child = require('child_process').exec(command, options, callback);
        child.on('error', e => { reject(e); child.kill(); });
        child.on('exit', resolve);
        child.stdout.on('data', data => ('' + data).includes('error') ? console.error(('' + data)) : '');
        child.stderr.pipe(process.stdout);
    });
}

function copyFolderSync(from, to) { // https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js#answer-52338335
    if (!existsSync(to)) mkdirSync(to);
    for (const element of readdirSync(from)) {
        if (lstatSync(resolve(from, element)).isFile()) {
            copyFileSync(resolve(from, element), resolve(to, element));
        } else {
            copyFolderSync(resolve(from, element), resolve(to, element));
        }
    }
}

function deleteFolderRecursive(path) { // https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty#answer-32197381
    if (existsSync(path)) {
        for (const file of readdirSync(path)) {
            const curPath = resolve(path, file);
            if (lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                unlinkSync(curPath);
            }
        }
        rmdirSync(path);
    }
}


/* AssetList start */

function listDir(dir, filelist = [], startDir = dir) {
    for (const file of readdirSync(dir)) {
        if (file === 'AssetList.json') continue;
        if (statSync(resolve(dir, file)).isDirectory()) listDir(resolve(dir, file), filelist, startDir);
        else filelist.push(dir.substr(startDir.length) + file);
    }

    return filelist;
}

function getFileType(path) {
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

function createAssetList(path) {
    const patharr = listDir(path);
    const assetList = [];

    for (const p of patharr) {
        assetList.push({
            path: p,
            name: '',
            type: getFileType(p)
        });
    }

    return JSON.stringify(assetList);
}

function mergeAssetLists(...lists) {
    return JSON.stringify(lists.map(x => JSON.parse(x)).reduce((t, c) => {
        for (const o1 of c) {
            let exists;

            for (const o2 of t) {
                if (o1.path === o2.path) {
                    exists = true;
                    o2.name = o1.name || o2.name;
                }
            }

            if (!exists) t.push(o1);
        }

        return t;
    }, []));
}


/* AssetList end */