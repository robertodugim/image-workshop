(function (root) {

    var extend = function(original, extra) {
        return Object.keys(extra).forEach(function(key) {
            original[key] = extra[key];
        });
    };

    root.ImgWS = function(config){
        extend(this.config, config);
        if(typeof this.config.file !== 'undefined' && this.CheckFile()){
            if(typeof EXIF !== 'undefined' && this.config.exif === true){
                var self = this;
                EXIF.getData(this.config.file, function () {

                    self.config.ImageOrientation = EXIF.getTag(this, 'Orientation');
                });
            }
            if(typeof this.config.callback === 'function'){
                this.getBase64(this.config.callback);
            }

        }else {
            console.log("File Cannot be undefined, large than the max size or have a different file type");
        }
    };
    root.ImgWS.prototype.config = {
        file:undefined,
        exif:false,
        height:0,
        width:0,
        ImageOrientation:1,
        maxSize:10010000, //10MB
        callback:undefined,
        validTypes:["image/jpeg","image/png"]
    };
    root.ImgWS.prototype.CheckFile = function(){
        if(this.config.validTypes.indexOf(this.config.file.type) >= 0 && this.config.file.size <= this.config.maxSize){
            return true;
        }else{
            return false;
        }
    };
    root.ImgWS.prototype.base64 = "";
    root.ImgWS.prototype.blob = "";

    root.ImgWS.prototype.getBase64 = function(callback){
        var reader = new FileReader();
        var self = this;
        reader.onloadend = function (e) {
            self.base64 = e.target.result;
            if ((self.config.height > 0 && self.config.width > 0) || self.config.ImageOrientation != 1) {
                self.resize(self.base64, self.config.file.name, self.config.file.size,callback);
            } else {
                callback(self.base64, self.config.file.name, self.config.file.size);
            }
        };
        reader.readAsDataURL(this.config.file);
    };
    root.ImgWS.prototype.resize = function(base64data,index,size,callback) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        var image = new Image();
        image.src = base64data;
        var self = this;
        image.onload = function() {
            canvas.width  = image.width;
            canvas.height = image.height;
            var height = canvas.height,
                width = canvas.width;

            if (self.config.ImageOrientation > 4) {
                //noinspection JSSuspiciousNameCombination
                canvas.width = height;
                //noinspection JSSuspiciousNameCombination
                canvas.height = width;
            }

            var compareHeight = self.config.height,
                compareWidth = self.config.width;

            if(compareHeight <= 0){
                compareHeight = canvas.height;
            }
            if(compareWidth <= 0){
                compareWidth = canvas.width;
            }
            if(canvas.width > compareWidth || canvas.height > compareHeight){
                if(canvas.width > canvas.height){
                    canvas.height = (compareWidth*canvas.height)/canvas.width;
                    canvas.width = compareWidth;
                }else{
                    canvas.width = (compareHeight*canvas.width)/canvas.height;
                    canvas.height = compareHeight;
                }
            }

            if (self.config.ImageOrientation > 4) {
                //noinspection JSSuspiciousNameCombination
                height = canvas.width;
                //noinspection JSSuspiciousNameCombination
                width = canvas.height;
            }else{
                height = canvas.height;
                width = canvas.width;
            }
            switch (self.config.ImageOrientation) {
                case 2:
                    // horizontal flip
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    break;
                case 3:
                    // 180� rotate left
                    ctx.translate(width, height);
                    ctx.rotate(Math.PI);
                    break;
                case 4:
                    // vertical flip
                    ctx.translate(0, height);
                    ctx.scale(1, -1);
                    break;
                case 5:
                    // vertical flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    // 90� rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    // horizontal flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);
                    break;
                case 8:
                    // 90� rotate left
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
                    break;
            }
            if (self.config.ImageOrientation > 4) {
                ctx.drawImage(image, 0, 0, canvas.height, canvas.width);
            }else{
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
            self.base64 = canvas.toDataURL();
            callback(self.base64,index,size);
        };
        root.ImgWS.prototype.toBlob = function(dataURI){
            if(typeof dataURI === 'undefined'){
                dataURI = self.base64;
            }

            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = decodeURI(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }
    };
})(this);