const Repository = require('../models/Repository');
const Bookmark = require('../models/bookmark');
const CollectionFilter = require('../models/collectionFilter');
const { decomposePath } = require('../utilities');

module.exports = 
class WordsController extends require('./Controller') {
    constructor(req, res){
        super(req, res, false /* needAuthorization */);
        this.wordsRepository = new Repository('Words', true /* useETag */);
        this.collectionFilter = new CollectionFilter();
    }
    error(params, message){
        params["error"] = message;
        this.response.JSON(params);
        return false;
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all bookmarks sorted by key values (Id, Name, Category, Url)";
        content += "<h4>? sort=key,desc <br> return all bookmarks sorted by descending key values";        
        content += "<h4>? key=value <br> return the bookmark with key value = value";
        content += "<h4>? key=value* <br> return the bookmark with key value that start with value";
        content += "<h4>? key=*value* <br> return the bookmark with key value that contains value";        
        content += "<h4>? key=*value <br> return the bookmark with key value end with value";
        content += "</div>";
        return content;
    }
    queryStringHelp() {
        // expose all the possible query strings
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(this.queryStringParamsList());
    }
  
    head() {
        this.response.JSON(null, this.wordsRepository.ETag);
    }
    // GET: api/bookmarks
    // GET: api/bookmarks?sort=key&key=value....
    // GET: api/bookmarks/{id}
    get(id){
       
        let decomposedPath = decomposePath(this.req.url);
        let params = decomposedPath["params"];
        
        // if we have no parameter, expose the list of possible query strings
        if (params === null) {
            if(!isNaN(id)) {
                this.response.JSON(this.wordsRepository.get(id));
            }
            else  
                this.response.JSON(this.wordsRepository.getAll(), this.wordsRepository.ETag);
        }
        else {
            let limit = decomposedPath["limit"];
            let offset = decomposedPath["offset"];
            
            if (Object.keys(params).length === 0) {
                this.queryStringHelp();
            } else {
                this.collectionFilter.init(this.wordsRepository.getAll(), limit, offset);
                if ('word' in params)
                    this.collectionFilter.addSearchKey('word', params['word']);
                if ('sort' in params)
                    this.collectionFilter.setSortFields(params['sort']);
                    this.response.JSON(this.collectionFilter.get(), this.wordsRepository.ETag);
            }
        }
    }
    // POST: api/bookmarks body payload[{"Id": ..., "Name": "...", "Url": "...", "Category": "...", "UserId": ...}]
    post(bookmark){  
        if (this.requestActionAuthorized()) {
            // validate bookmark before insertion
            if (Bookmark.valid(bookmark)) {
                // avoid duplicate names
                if (this.wordsRepository.findByField('Name', bookmark.Name) !== null){
                    this.response.conflict();
                } else {
                    let newBookmark = this.wordsRepository.add(bookmark);
                    if (newBookmark)
                        this.response.created(newBookmark);
                    else
                        this.response.internalError();
                }
            } else 
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "...", "UserId": ..}]
    put(bookmark){
        if (this.requestActionAuthorized()) {
            // validate bookmark before updating
            if (Bookmark.valid(bookmark)) {
                let foundBookmark = this.wordsRepository.findByField('Name', bookmark.Name);
                if (foundBookmark != null){
                    if (foundBookmark.Id != bookmark.Id) {
                        this.response.conflict();
                        return;
                    }
                }
                if (this.wordsRepository.update(bookmark))
                    this.response.ok();
                else 
                    this.response.notFound();
            } else 
                this.response.unprocessable();
        } else 
        this.response.unAuthorized();
    }
    // DELETE: api/bookmarks/{id}
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.wordsRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
            } else 
        this.response.unAuthorized();
    }
}