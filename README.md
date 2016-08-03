# image-workshop
Javascript library for Resize, Get Base64, Check Format, Check Size and aplly EXIF Orientation of a IMAGE....and Convert dataURI to Blob

###Opcional Js File for EXIF
  You Must included the Plugin:
  https://github.com/exif-js/exif-js
  
###Simple Usage
  
  ```
  <input type="file" id="ThisImage" onchange="MakeSamething(this)">
  <img id="ThumbImg" src="eg.jpg">
  <script>
  function MakeSamething(event){
      if( !event ) event = window.event;
      
      newAvatar = new ImgWS({
          file:event.target.files[0],//required
          exif:true,//opcional - default false
          height:96,//opcional - default do not resize
          width:96,//opcional - default do not resize
          ImageOrientation:1,//opcional - default 1
          maxSize:10010000, //10MB - opcional - default 10MB
          validTypes:["image/jpeg","image/png"], //opcional - default "image/jpeg","image/png"
          callback:function(base64,name,size){//required
            document.getElementById("ThumbImg").src = base64;
          }
      });
      //Convert To blob
      var blob = newAvatar.toBlob();
      var blob2 = new ImgWS.toBlob(document.getElementById("ThumbImg").src);
  }
  </script>
  ```

