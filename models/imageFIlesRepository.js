const fs = require('fs');
module.exports = 
class ImageFilesRepository{
    
    static getServerImageFilesFolder() {
        return "./wwwroot/images/";
    }
    static getImageFilesFolder() {
        return "/images/";
    }
    static getImageFileURL(GUID) {
        if (GUID !="")
            return this.getImageFilesFolder() + GUID +  ".png";
        return "";
    }
    static getThumbnailFileURL(GUID) {
        if (GUID !="")
            return this.getImageFilesFolder() + "thumbnails/" + GUID +  ".png";
        return "";
    }
    static getServerImageFileURL(GUID) {
        return this.getServerImageFilesFolder() + GUID +  ".png";
    }
    static getServerThumbnailFileURL(GUID) {
        return this.getServerImageFilesFolder() + "thumbnails/" + GUID +  ".png";
    }
    static removeImageFile(GUID){
        if (GUID != "") {
            try {
                fs.unlinkSync(this.getServerImageFileURL(GUID)); 
                fs.unlinkSync(this.getServerThumbnailFileURL(GUID)); 
            } catch(err) {
                console.log('image not found');
            }
        }
    }
    static storeImageData(previousGUID, imageDataBase64) {
        if (imageDataBase64) {
            let formatSpecifier = "data:image/png;base64,";
            imageDataBase64 = imageDataBase64.replace(formatSpecifier,'');
           
            const resizeImg = require('resize-img');
            const thumbnailSize = 256;
            const { v1: uuidv1 } = require('uuid');

            // remove previous image
            this.removeImageFile(previousGUID);

            // get a new GUID
            let GUID =  uuidv1();

            // Store new image file in images folder
            let imageDataBinary = new Buffer.from(imageDataBase64, 'base64');
            fs.writeFileSync(this.getServerImageFileURL(GUID), imageDataBinary);

            // Store new image file in thumbnails folder
            let tempGUID =  uuidv1();
            let tempFile = this.getServerThumbnailFileURL(tempGUID);
            fs.writeFileSync(tempFile, imageDataBinary);

            // compute thumbnail resizes dimension keeping proportion of original size
            var sizeOf = require('image-size');
            var dimensions = sizeOf(tempFile);
            let newHeight = 0;
            let newWidth = 0;
            if (dimensions.height > dimensions.width){
                newWidth = dimensions.width * thumbnailSize / dimensions.height;
                newHeight = thumbnailSize;
            } else {
                newHeight = dimensions.height * thumbnailSize / dimensions.width;
                newWidth = thumbnailSize;
            }

            // resize new image thumbnail 
            (async()=>{
                const thumbnailImage = await resizeImg(fs.readFileSync(tempFile), { width: newWidth, height: newHeight });
                fs.writeFileSync(this.getServerThumbnailFileURL(GUID), thumbnailImage);
                fs.unlinkSync(tempFile);
            })();
            return GUID;
        } else
        return previousGUID;
    }
}