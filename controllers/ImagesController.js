const ImagesRepository = require('../models/ImagesRepository');
const utilities = require("../utilities");
const CollectionFilter = require('../models/collectionFilter');
const Image = require('../models/images.js');
const ImageFilesRepository = require('../models/imageFilesRepository.js');

module.exports = 
class ImagesController extends require('./Controller') {
    constructor(req, res){
        super(req, res, false /* needAuthorization */);
        this.imagesRepository = new ImagesRepository(req);
    }
    error(params, message){
        params["error"] = message;
        this.response.JSON(params);
        return false;
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all images sorted by key values (Id, Name, Category, Url)";
        content += "<h4>? sort=key,desc <br> return all images sorted by descending key values";        
        content += "<h4>? key=value <br> return the image with key value = value";
        content += "<h4>? key=value* <br> return the image with key value that start with value";
        content += "<h4>? key=*value* <br> return the image with key value that contains value";        
        content += "<h4>? key=*value <br> return the image with key value end with value";
        content += "<h4>page?limit=int&offset=int <br> return limit images of page offset";
        content += "</div>";
        return content;
    }
    queryStringHelp() {
        // expose all the possible query strings
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(this.queryStringParamsList());
    }
    head() {
        console.log("ETag: " + this.imagesRepository.ETag);
        this.response.JSON(null, this.imagesRepository.ETag);
    }
    get(id){
        let params = this.getQueryStringParams(); 
        // if we have no parameter, expose the list of possible query strings
        if (params === null) {
            if(!isNaN(id)) {
                this.response.JSON(this.imagesRepository.get(id));
            }
            else  
                this.response.JSON( this.imagesRepository.getAll(), 
                                    this.imagesRepository.ETag);
        }
        else {
            if (Object.keys(params).length === 0) {
                this.queryStringHelp();
            } else {
                let collectionFilter = 
                new CollectionFilter(this.imagesRepository.getAll(), params);
                this.response.JSON(collectionFilter.get(), this.imagesRepository.ETag);
            }
        }
    }
    post(image){  
        if (this.requestActionAuthorized()) {
            let newImage = this.imagesRepository.add(image);
            if (newImage)
                this.response.created(newImage);
            else
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    put(image){
        if (this.requestActionAuthorized()) {
            if (this.imagesRepository.update(image))
                this.response.ok();
            else
                this.response.unprocessable();
        } else
            this.response.unAuthorized();
    }
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.imagesRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        } else
            this.response.unAuthorized();
    }
}