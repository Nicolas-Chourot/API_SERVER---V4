const utilities = require('./utilities');
const serverVariables = require("./serverVariables");
let getRequestsCache = [];

let getRequestsCacheExpirationTime = serverVariables.get("main.getRequestscache.expirationTime");

class GetRequestsCacheManager {
   
    static add(url, content) {
        if (url != "") {
            getRequestsCache.push({url, content, expireIn: utilities.nowInSeconds() + getRequestsCacheExpirationTime});
            console.log("ADDED IN GET REQUEST CACHE");
        }
    }
    static find(url) {
        try {
            if (url != "") {
                for(let endpoint of getRequestsCache){
                    if (endpoint.url == url) {
                        // renew cache
                        endpoint.expireIn = utilities.nowInSeconds() + getRequestsCacheExpirationTime;
                        console.log("RETRIEVED FROM GET REQUESTS CACHE");
                        return endpoint.content;
                    }
                }
            }
        } catch(error) {
            console.log("get requests cache error", error);
        }
        return null;
    }
    static clear(url) {
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for(let endpoint of getRequestsCache){
                if (endpoint.url.indexOf(url) > -1) indexToDelete.push(index);
                index ++;
            }
            if (index > 0)
                utilities.deleteByIndex(getRequestsCache, indexToDelete);
        }
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for(let endpoint of getRequestsCache){
            if (endpoint.expireIn < now) {
                console.log("Cached get request", endpoint.url + " expired");
                indexToDelete.push(index);
            }
            index ++;
        }
        utilities.deleteByIndex(getRequestsCache, indexToDelete);
    }
}

// periodic cleaning of expired cached GET request
console.log("Periodic GET requests cache cleaning process started...");
setInterval(GetRequestsCacheManager.flushExpired, getRequestsCacheExpirationTime * 1000);
module.exports = GetRequestsCacheManager;