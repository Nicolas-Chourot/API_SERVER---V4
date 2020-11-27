module.exports = 
class Image{
    constructor(id, title, description, created, userId, shared, GUID, imageData)
    {
        this.Id = 0;
        this.Title = title !== undefined ? title : "";
        this.Description = description !== undefined ? description : "";
        this.Created = created !== undefined ? created : 0;
        this.UserId = userId !== undefined ? userId : 0;
        this.Shared = shared !== undefined ? shared : false;
        this.GUID = GUID !== undefined ? GUID : "";
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Title','string');
        validator.addField('Description','string');
        validator.addField('UserId', 0);
        validator.addField('Shared','boolean');
        validator.addField('Created','integer');
        return validator.test(instance);
    }

    
}