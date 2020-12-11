const Repository = require('../models/Repository');
module.exports = 
class WordsController extends require('./Controller') {
    constructor(req, res){
        super(req, res, false /* needAuthorization */);
       this.wordsRepository = new Repository('Words', true /* cached */, this.params);
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all words sorted by key values (word)";
        content += "<h4>? sort=key,desc <br> return all words sorted by descending key values";        
        content += "<h4>? key=value <br> return the bookmark with key value = value";
        content += "<h4>? key=value* <br> return the bookmark with key value that start with value";
        content += "<h4>? key=*value* <br> return the bookmark with key value that contains value";        
        content += "<h4>? key=*value <br> return the bookmark with key value end with value";
        content += "<h4>page?limit=int&offset=int <br> return limit words of page offset";
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
    // GET: api/words
    // GET: api/words?sort=key&key=value....
    // GET: api/words/{id}
    get(id){
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) {
            if(!isNaN(id)) {
                this.response.JSON(this.wordsRepository.get(id));
            }
            else  
                this.response.JSON(this.wordsRepository.getAll(), this.wordsRepository.ETag);
        }
        else {       
            if (Object.keys(this.params).length === 0) {
                this.queryStringHelp();
            } else {
                this.response.JSON(this.wordsRepository.getAll(), this.wordsRepository.ETag);
            }
        }
    }
    // POST: api/words body payload[{"Id": ..., "Word": "...", "Definition": "..."}]
    post(word){  
        if (this.requestActionAuthorized()) {
            // validate word before insertion
            if (Word.valid(bookwordmark)) {
                // avoid duplicate names
                if (this.wordsRepository.findByField('Word', word.Word) !== null){
                    this.response.conflict();
                } else {
                    let newWord = this.wordsRepository.add(word);
                    if (newWord)
                        this.response.created(newWord);
                    else
                        this.response.internalError();
                }
            } else 
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    // PUT: api/words body payload[{"Id":..., "Word": "...", "Definition": "..."}]
    put(word){
        if (this.requestActionAuthorized()) {
            // validate bookmark before updating
            if (Word.valid(word)) {
                let foundWord = this.wordsRepository.findByField('Word', word.Word);
                if (foundWord != null){
                    if (foundWord.Id != word.Id) {
                        this.response.conflict();
                        return;
                    }
                }
                if (this.wordsRepository.update(word))
                    this.response.ok();
                else 
                    this.response.notFound();
            } else 
                this.response.unprocessable();
        } else 
        this.response.unAuthorized();
    }
    // DELETE: api/words/{id}
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