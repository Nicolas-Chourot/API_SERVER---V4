const utilities = require("../utilities");
const RepositoryCachesManager = require("./repositoryCachesManager.js");
const CollectionFilter = require('./collectionFilter');
const { v1: uuidv1 } = require('uuid');
const fs = require('fs');
///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file 
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
// Warning: no type and data validation is provided
///////////////////////////////////////////////////////////////////////////

let repositoryEtags = {};

class Repository {
    constructor(objectsName, cached = true, params = null) {
        this.objectsName = objectsName.toLowerCase();
        this.objectsList = null;
        this.objectsFile = `./data/${objectsName}.json`;
        this.initEtag();
        this.cached = cached;
        this.params = params;
        this.bindExtraDataMethod = null;
    }
    setBindExtraDataMethod(bindExtraDataMethod){
        this.bindExtraDataMethod = bindExtraDataMethod;
    }

    initEtag() {
        this.ETag = "";
        if (this.objectsName in repositoryEtags)
            this.ETag = repositoryEtags[this.objectsName];
        else
            this.newETag();
    }
    newETag(){
        this.ETag = uuidv1();
        repositoryEtags[this.objectsName] = this.ETag;
    }
    objects() {
        if (this.objectsList == null) 
            this.read();
        return this.objectsList;
    }
    read() {
        this.objectsList = null;
        if (this.cached) {
            this.objectsList = RepositoryCachesManager.find(this.objectsName);
        }
        if ( this.objectsList == null) {
            try{
                // Here we use the synchronus version readFile in order  
                // to avoid concurrency problems
                let rawdata = fs.readFileSync(this.objectsFile);
                // we assume here that the json data is formatted correctly
                this.objectsList = JSON.parse(rawdata);
                if (this.cached)
                    RepositoryCachesManager.add(this.objectsName, this.objectsList);
            } catch(error) {
                if (error.code === 'ENOENT') {
                    // file does not exist, it will be created on demand
                    this.objectsList = [];
                }
            }
        }
    }
    write() {
        // Here we use the synchronus version writeFile in order
        // to avoid concurrency problems  
        this.newETag();
        fs.writeFileSync(this.objectsFile, JSON.stringify(this.objects()));
        if (this.cached){
            RepositoryCachesManager.clear(this.objectsName);
        }
    }
    nextId() {
        let maxId = 0;
        for(let object of this.objects()){
            if (object.Id > maxId) {
                maxId = object.Id;
            }
        }
        return maxId + 1;
    }
    add(object) {
        try {
            object.Id = this.nextId();
            this.objects().push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    bindExtraData(datas){
        let bindedDatas = [];
        for(let data of datas) {
            bindedDatas.push(this.bindExtraDataMethod(data));
        };
        return bindedDatas;
    }
    getAll() {
        let objects = this.objects();
        if (this.bindExtraDataMethod != null){
            objects = this.bindExtraData(objects);
        }
        if (this.params) {
            let collectionFilter = 
            new CollectionFilter(objects, this.params);
            return collectionFilter.get();
        }
        return objects;
    }
    get(id){
        for(let object of this.objects()){
            if (object.Id === id) {
                if (this.bindExtraDataMethod != null)
                    return this.bindExtraDataMethod(object);
                else
                    return object;
            }
        }
        return null;
    }
    remove(id) {
        let index = 0;
        for(let object of this.objects()){
            if (object.Id === id) {
                this.objects().splice(index,1);
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    removeByIndex(indexToDelete){
        if (indexToDelete.length > 0){
            utilities.deleteByIndex(this.objects(), indexToDelete);
            this.write();
        }
    }
    update(objectToModify) {
        let index = 0;
        for(let object of this.objects()){
            if (object.Id === objectToModify.Id) {
                this.objects()[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    } 
    findByField(fieldName, value){
        let index = 0;
        for(let object of this.objects()){
            try {
                if (object[fieldName] === value) {
                    return this.objects()[index];
                }
                index ++;
            } catch(error) {
                break;
            }
        }
        return null;
    }
}
module.exports = Repository;