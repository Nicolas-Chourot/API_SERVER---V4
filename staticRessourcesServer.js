const path = require('path');
const fs = require('fs');
let wwwroot = 'wwwroot';
let defaultRessource = 'index.html';

function requestedStaticRessource(url) {
    let ressourceName = url === '/' ? defaultRessource : url;
    return path.join(__dirname, wwwroot, ressourceName);
}

exports.sendRequestedFile = (req, res) => {
    let filePath = requestedStaticRessource(req.url);
    let contentType = extToContentType(filePath);

    try {
        let content = fs.readFileSync(filePath);
         res.writeHead(200, {'Content-Type': contentType});
         res.end(content);
         return true;
    } catch(error) {
        if (error.code === 'ENOENT') {
            return false;
        } else {
            res.writeHead(500);
            res.end(`Server error: ${err.code}`);
            return true;
        }
    }
}
function extToContentType(filePath){
    let contentType = 'text/html';
    switch (path.extname(filePath)){
        // complete MIME list defined @ https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        case '.js': 
            contentType = 'text/javascript';
            break;
        case '.css': 
            contentType = 'text/css';
            break;
        case '.png': 
            contentType = 'image/png';
            break;
        case '.jpg': 
            contentType = 'image/jpg';
        break;
        case '.ico': 
            contentType = 'image/x-icon';
            break;
        case '.json': 
            contentType = 'application/json';
            break;
    }
    return contentType;
}