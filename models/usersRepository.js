const Repository = require('./Repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const User = require('./user.js');
const utilities = require("../utilities");
module.exports = 
class UsersRepository extends Repository {
    constructor(req, params){
        super('Users', true);
        this.req = req;
        this.params = params;
    }
    bindAvatarURL(user){
        if (user) {
            let bindedUser = {...user};
            if (user["AvatarGUID"] != ""){
                bindedUser["AvatarURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } else {
                bindedUser["AvatarURL"] = "";
            }
            return bindedUser;
        }
        return null;
    }
    bindAvatarURLS(images){
        let bindedUsers = [];
        for(let image of images) {
            bindedUsers.push(this.bindAvatarURL(image));
        };
        return bindedUsers;
    }
    get(id) {
        return this.bindAvatarURL(super.get(id));
    }
    getAll() {
        return this.bindAvatarURLS(super.getAll());
    }
    add(user) {
        user["Created"] = utilities.nowInSeconds();
        if (User.valid(user)) {
            user["AvatarGUID"] = ImageFilesRepository.storeImageData("", user["ImageData"]);
            delete user["ImageData"];
            return this.bindAvatarURL(super.add(user));
        }
        return null;
    }
    update(user) {
        user["Created"] = 0; // will take the original creation date, see lower
        if (User.valid(user)) {
            let foundUser = super.get(user.Id);
            if (foundUser != null) {
                user["Created"] = foundUser["Created"];
                user["AvatarGUID"] = ImageFilesRepository.storeImageData(user["AvatarGUID"], user["ImageData"]);
                delete user["ImageData"];
                return super.update(user);
            }
        }
        return false;
    }
    remove(id){
        let foundUser = super.get(id);
        if (foundUser) {
            ImageFilesRepository.removeImageFile(foundUser["AvatarGUID"]);
            return super.remove(id);
        }
        return false;
    }
}