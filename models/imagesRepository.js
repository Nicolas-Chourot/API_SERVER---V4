const Repository = require('./Repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const Image = require('./images.js');
const utilities = require("../utilities");
module.exports = 
class ImagesRepository extends Repository {
    constructor(req){
        super('Images', true);
        this.users = new Repository('Users');
        this.req = req;
    }
    bindUsernameAndImageURL(image){
        if (image) {
            let user = this.users.get(image.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let bindedImage = {...image};
            bindedImage["Username"] = username;
            if (image["GUID"] != ""){
                bindedImage["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(image["GUID"]);
                bindedImage["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
            } else {
                bindedImage["OriginalURL"] = "";
                bindedImage["ThumbnailURL"] = "";
            }
            return bindedImage;
        }
        return null;
    }
    bindUseramesAndImageURLS(images){
        let bindedImages = [];
        for(let image of images) {
            bindedImages.push(this.bindUsernameAndImageURL(image));
        };
        return bindedImages;
    }
    get(id) {
        return this.bindUsernameAndImageURL(super.get(id));
    }
    getAll() {
        return this.bindUseramesAndImageURLS(super.getAll());
    }
    add(image) {
        if (Image.valid(image)) {
            image["GUID"] = ImageFilesRepository.storeImageData("", image["ImageData"]);
            delete image["ImageData"];
            image["Created"] = utilities.nowInSeconds();
            return super.add(image);
        }
        return null;
    }
    update(image) {
        if (Image.valid(image)) {
            let foundImage = super.get(image.Id);
            if (foundImage != null) {
                image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                image["Created"] = utilities.nowInSeconds();
                delete image["ImageData"];
                return super.update(image);
            }
        }
        return false;
    }
    remove(id){
        let foundImage = super.get(id);
        if (foundImage) {
            ImageFilesRepository.removeImageFile(foundImage["GUID"]);
            return super.remove(id);
        }
        return false;
    }
}