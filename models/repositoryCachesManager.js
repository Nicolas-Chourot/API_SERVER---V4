const utilities = require("../utilities");
const serverVariables = require("../serverVariables");
let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");
let repositoryCaches = [];

class RepositoryCachesManager {
    static add(model, data){
        RepositoryCachesManager.clear(model);
        repositoryCaches.push(  {   model, 
                                    data, 
                                    expireIn:utilities.nowInSeconds() + repositoryCachesExpirationTime
                                });
        console.log("DATA of " + model +".json ADDED IN REPOSITORY CACHE");
    }
    static clear(model) {
        if (model != "") {
            let indexToDelete = [];
            let index = 0;
            for(let cache of repositoryCaches){
                if (cache.model == model) indexToDelete.push(index);
                index ++;
            }
            utilities.deleteByIndex(repositoryCaches, indexToDelete);
        }
    }
    static find(model) {
        try {
            if (model != "") {
                for(let cache of repositoryCaches){
                    if (cache.model == model) {
                        // renew cache
                        cache.expireIn = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                        console.log("DATA of " + model + ".json RETRIEVED FROM REPOSITORY CACHE");
                        return cache.data;
                    }
                }
            }
        } catch(error) {
            console.log("repository cache error", error);
        }
        return null;
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for(let cache of repositoryCaches){
            if (cache.expireIn < now) {
                console.log("Cached data of " + cache.model + ".json expired");
                indexToDelete.push(index);
            }
            index ++;
        }
        if (index > 1)
            utilities.deleteByIndex(repositoryCaches, indexToDelete);
    }
}
// periodic cleaning of expired cached repository data
console.log("Periodic respository caches cleaning process started...");
setInterval(RepositoryCachesManager.flushExpired, repositoryCachesExpirationTime * 1000);
module.exports = RepositoryCachesManager;