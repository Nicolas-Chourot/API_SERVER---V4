module.exports = 
class User{
    constructor(name, email, password, avatarGUID)
    {
        this.Id = 0;
        this.Name = name !== undefined ? name : "";
        this.Email = email !== undefined ? email : "";
        this.Password = password !== undefined ? password : "";
        this.Created = 0;
        this.AvatarGUID = avatarGUID !== undefined ? avatarGUID : "";
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Name','string');
        validator.addField('Email','email');
        validator.addField('Created','integer');
        return validator.test(instance);
    }
}