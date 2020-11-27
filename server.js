function ShowRequestInfo(req){
   /* console.log(`User agent:${req.headers["user-agent"]}`);
    if (req.headers["content-type"] != undefined)
        console.log(`Content-type:${req.headers["content-type"]}`);
    if (req.headers["authorization"] != undefined)
        console.log(`Authorisation:${req.headers["authorization"]}`);*/
    console.log(`${req.method}:${req.url}`);
}
function AccessControlConfig(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');    
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*'); /// in order to have access to all header at the client side
    res.setHeader('Access-Control-Allow-Credential', false);    
    res.setHeader('Access-Control-Allow-Max-Age', '86400'); // 24 hours
}
function CORS_Prefligth(req, res){  
    if (req.method === 'OPTIONS'){
        console.log('preflight CORS verifications');
        res.end();
        // request handled
        return true;
    }
    // request not handled
    return false;
}
function responseNotFound(res) {
    res.writeHead(404, {'content-type':'text/plain'});
    res.end();
}
function API_Endpoint(req, res) {
    return require('./router').dispatch_API_EndPoint(req, res);
}
function token_Endpoint(req, res) {
    return require('./router').dispatch_TOKEN_EndPoint(req, res);
}
function routeConfig() {
    const RouteRegister = require('./routeRegister');
    RouteRegister.add('GET','accounts');
    RouteRegister.add('POST','accounts','register');
    RouteRegister.add('POST','accounts','logout');
    RouteRegister.add('PUT','accounts','change');
    RouteRegister.add('DELETE','accounts','remove');
}
function registered_Enpoint(req, res) {
    return require('./router').dispatch_Registered_EndPoint(req, res);
}
function cached_GetRequest(req, res){
    if (req.method == 'GET') {
        const Cache = require('./getRequestsCacheManager.js');
        let content = Cache.find(req.url);
        if (content != null) {
            res.writeHead(200, {'content-type':'application/json'});
            res.end(content);
            return true;
        }
    }
    return false;
}

const process = require('process');
const PORT = process.env.PORT || 5000;

let requestProcessStartTime = null;

function setRequestProcessStartTime() {
    requestProcessStartTime = process.hrtime();
}

function showRequestProcessTime() {
    let requestProcessEndTime = process.hrtime(requestProcessStartTime);
    console.log('Request process time: %ds %dms', requestProcessEndTime[0], requestProcessEndTime[1] / 1000000);
}
routeConfig();
function migration() {
    let objectsList = null;
    const fs = require('fs');
    try{
        // Here we use the synchronus version readFile in order  
        // to avoid concurrency problems
        let rawdata = fs.readFileSync("data/words.json");
        // we assume here that the json data is formatted correctly
        objectsList = JSON.parse(rawdata);
        let words = [];
        let index = 0;
        Object.keys(objectsList).forEach( function(key) {
            let v = objectsList[key];
            let word = {id:index, Word: key, Definition: v};
            words.push(word);
            index ++;
        });
        fs.writeFileSync("data/words2.json", JSON.stringify(words));
    } catch(error) {
        if (error.code === 'ENOENT') {
            // file does not exist, it will be created on demand
            this.objectsList = [];
        }
    }
}
function Static_Ressource_Request(req,res) {
    const staticRessourcesServer = require('./staticRessourcesServer.js');
    return staticRessourcesServer.sendRequestedFile(req, res);
}

require('http').createServer((req, res) => {
    console.log('<--------------------------------------------------------');
    ShowRequestInfo(req);
    setRequestProcessStartTime();
    AccessControlConfig(res);
    // Middlewares pipeline
    if (!Static_Ressource_Request(req, res))
        if (!CORS_Prefligth(req, res))
            if (!cached_GetRequest(req, res))
                if (!token_Endpoint(req, res))
                    if (!registered_Enpoint(req, res))
                        if (!API_Endpoint(req, res))
                            // do something else with request
                            responseNotFound(res);
    showRequestProcessTime();
    console.log('-------------------------------------------------------->');
}).listen(PORT, () => console.log(`HTTP Server running on port ${PORT}...`));