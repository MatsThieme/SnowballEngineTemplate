const { createServer } = require('http');
const { readFile } = require('fs');
const { join, extname } = require('path');

createServer((request, response) => {
    const contentType = getContentType(extname(request.url));

    let path = join(__dirname, process.argv[2] || '', request.url);

    if (request.url === '/') path += 'index.html';

    readFile(path, (error, content) => {
        if (error) console.log('error:', path);

        response.setHeader('Content-Type', contentType);
        response.end(content, 'utf-8');
    });

    console.log(request.url);
}).listen(3000);

function getContentType(extname) {
    switch (extname) {
        case '.js': return 'text/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpg';
        case '.wav': return 'audio/wav';
    }

    return 'text/html';
}