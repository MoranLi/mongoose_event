var express = require('express');
var mongoose = require('mongoose');
var body_parser = require("body-parser");
var fileUpload = require('express-fileupload');
var fs = require('file-system');
var base64Img = require('base64-img');
var slide = require("./models/slide");
var seedDB = require("./seed");

var app = express();

mongoose.connect("mongodb://localhost/slide");

seedDB();
app.set("view engine","ejs");
app.use(body_parser.urlencoded({extended:true}));
app.use(body_parser.json());

app.use(fileUpload());

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("yale camp server start");
});

// get specific image by name
app.get("/image/:path/:name", function(req,res){
    const name = __dirname +"/"+req.params.path+"/"+req.params.name;
    res.sendFile(name);
});

app.post("/image/new",function(req,res){
    var images = req.body.image;
    console.log(req.body);
    return new Promise(function (resolve, reject) {
        writeFilePromise("./image/"+images.name,images.path).then(function(value){
            resolve("./image/"+images.name);
        }).catch(function(err){
            reject(err);
        });
    });
});

// getter for all slides
app.get("/slides", function(req,res){
    slide.find({}, function(err,allslide){
        if(err){
            console.log(err);
        }
        else{
            res.render("show",{slides:allslide}); 
            // res.send(JSON.parse(allslide))
        }
    });
});

// delete a slide
app.get("/slides/delete/:id", function(req,res){
    slide.remove({_id:req.params.id},function(err){
        if(err){
            console.log(err);
            // res.send("delete fail")
        }
        res.render("main");
        // res.send("delete success")
    });
});

// get specific slide
app.get("/show/:id", function(req,res){
    slide.findById(req.params.id).exec(function(err, findslide){
        if(err){
            console.log(err);
        }
        else{
            res.render("spec", {slide:findslide});
            // res.send(JSON.parse(findslide))
        }
    });
});

// create new slide
/*
app.post("/slides/new", function(req,res){
    var fileUploaded = 0;
    var imageEncoded = 0;
    var images = req.files.image;
    var images64 = [];
    // upload multiple images
    if(Array.isArray(images)){
        images.forEach(function(aimage){
            writeFilePromise("./images/"+aimage.name,aimage.path).then(function(value){
                fileUploaded++;
                var path = "./show/"+aimage.name;
                encodeImgPromise(path).then(function(value){
                    var image = {
                        path: path,
                        data: value
                    };
                    images64.push(image);
                    imageEncoded++;
                    // wait until all image is uploaded ans encoded
                    if(fileUploaded == images.length && imageEncoded == images.length){
                        fileUploaded = 0;
                        imageEncoded = 0;
                        createOrUpdateSlide(0,req,images64);
                        res.render("main");
                    }
                }).catch(function(err){
                    console.log(err);
                });
            }).catch(function(err){
                console.log(err);
            });
        });
    }
    // upload one image
    else if (images != undefined) {
        writeFilePromise("./images/"+images.name,images.path).then(function(value){
            var path = "./show/"+images.name;
            encodeImgPromise(path).then(function(value){
                var image = {
                        path: path,
                        data: value
                };
                images64.push(image);
                createOrUpdateSlide(0,req,images64);
                res.render("main");
            }).catch(function(err){
                console.log(err);
            });
        }).catch(function(err){
            console.log(err);
        });
    }
    // do not uplaod any image
    else {
        createOrUpdateSlide(0,req,images64);
        res.render("main");
    }
});
*/
app.post("/slides/new", function(req,res){
    var slide = req.body.slide
    createOrUpdateSlide(0,slide).then(function(resolve){

    }).catch(function(err){
        console.log(err);
        
    });
    res.render("main");
});

// update exist slide
/*
app.post("/slides/:id", function(req,res){
    var fileUploaded = 0;
    var imageEncoded = 0;
    var images = req.files.image;
    var images64 = [];
    // if uplaod multiple image
    if(Array.isArray(images)){
        images.forEach(function(aimage){
            writeFilePromise("./images/"+aimage.name,aimage.path).then(function(value){
                fileUploaded++;
                var path = "./show/"+aimage.name;
                encodeImgPromise(path).then(function(value){
                    var image = {
                        path: path,
                        data: value
                    };
                    images64.push(image);
                    imageEncoded++;
                    // wait until all image uploaded and encoded
                    if(fileUploaded == images.length && imageEncoded == images.length){
                        fileUploaded = 0;
                        imageEncoded = 0;
                        createOrUpdateSlide(req.params.id,req,images64);
                        res.render("main");
                    }
                }).catch(function(err){
                    console.log(err);
                });
            }).catch(function(err){
                console.log(err);
            });
        });
    }
    // only one image uploaded
    else if (images != undefined){
        writeFilePromise("./images/"+images.name,images.path).then(function(value){
            var path = "./show/"+images.name;
            encodeImgPromise(path).then(function(value){
                var image = {
                        path: path,
                        data: value
                };
                images64.push(image);
                createOrUpdateSlide(req.params.id,req,images64);
                res.render("main");
            }).catch(function(err){
                console.log(err);
            });
        }).catch(function(err){
            console.log(err);
        });
    }
    // not image uploaded
    else {
        createOrUpdateSlide(req.params.id,req,images64);
        res.render("main");
    }
});
*/
app.post("/slides/:id", function(req,res){
    var images = req.body.image
    createOrUpdateSlide(req.params.id,req,images);
    res.render("main");
});
// following function are aim to reduce complexity and duplicate code for two post operation

// conver req inforrmation to an object
function getSlideInfo(req){
    // read all request arguments
    var atitle = req.body.title;
    var atitle_color = req.body.title_color;
    var atitle_font_size = req.body.title_font_size;
    var atitle_font_style = req.body.title_font_style;
    var atitle_font_weight = req.body.title_font_weight;
    var adescription = req.body.description;
    var adescription_color = req.body.description_color;
    var adescription_font_size = req.body.description_font_size;
    var adescription_font_style = req.body.description_font_style;
    var adescription_font_weight = req.body.description_font_weight;
    var adate = req.body.date;
    var adate_color = req.body.date_color;
    var adate_font_size = req.body.date_font_size;
    var adate_font_style = req.body.date_font_style;
    var adate_font_weight = req.body.date_font_weight;
    var atime = req.body.time;
    var atime_color = req.body.time_color;
    var atime_font_size = req.body.time_font_size;
    var atime_font_style = req.body.time_font_style;
    var atime_font_weight = req.body.time_font_weight;
    var aslide_settings = req.body.slide_settings;
    // create object
    var aslide = {
        title: {
            title: atitle,
            color: atitle_color,
            font_size: atitle_font_size,
            font_weight: atitle_font_weight,
            font_style: atitle_font_style
        },
        description: {
            description: adescription,
            color: adescription_color,
            font_size: adescription_font_size,
            font_weight: adescription_font_weight,
            font_style: adescription_font_style
        },
        date: {
            date: adate,
            color: adate_color,
            font_size: adate_font_size,
            font_weight: adate_font_weight,
            font_style: adate_font_style
        },
        time:  {
            time: atime,
            color: atime_color,
            font_size: atime_font_size,
            font_weight: atime_font_weight,
            font_style: atime_font_style
        },
        images:[],
        slide_settings: aslide_settings
    };
    return aslide;
}

// switch case for create or update slide by id input
function createOrUpdateSlide(id, aslide){
    // var aslide = getSlideInfo(req);
    // aslide.images = images64;
    if(id == 0){
        return new Promise(function (resolve, reject) {
            slide.create(aslide, function(err, aslide){
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
        
    }
    else {
        return new Promise(function (resolve, reject) {
            slide.update({_id:id},aslide,function(err){
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    }
}

// promise for handle case write file
function writeFilePromise(name, path){
    return new Promise(function (resolve, reject) {
        fs.writeFile(name, path, function (err) {
            if (err) {
                reject(err);
            }
            else{
                resolve("the file is saved");
            }
        });
    });
}

// promise for handle case get img base64 code
function encodeImgPromise(path){
    return new Promise(function(resolve, reject){
        base64Img.base64(path,function(err, data){
            if(err){
                reject(err);
            }
            else{
                resolve(data);
            }
        });
    });
}

// following code is only useful for testing, can be deleted for actual implementation

// goto create new slide
app.get("/slides/new", function(req,res){
    res.render("new");
});

// main page generally for testing
app.get("/", function(req,res){
    res.render("main");
});

// go to edit slide 
app.get("/slides/:id", function(req,res){
    slide.findById(req.params.id).exec(function(err, findslide){
        if(err){
            console.log(err);
        }
        else{
            res.render("edit", {slide:findslide, id:req.params.id});
        }
    });
});

// view all image 
app.get("/image", function(req,res){
    var images = [];
    fs.readdir("./image", (err, files) => {
        if(err){
            console.log(err);
        }
        var length = files.length;
        var count = 0;
        fs.recurse("./image", function(filepath, relative, filename) { 
            encodeImgPromise("./"+filepath).then(function(value){
                count++;
                var image = {
                    name: filename,
                    data: value
                };
                images.push(image);
                if(count == length){
                    res.render("image",{images:images});
                }
            }).catch(function(err){
                console.log(err);
            });
        });
    });
});

// delete a image 
app.post("/image/:path", function(req,res){
    var path = req.params.path;
    fs.unlink("./image/"+path,function(err){
        if(err){
            console.log(err);
        }
        else{
            slide.find({}, function(err,allslide){
                if(err){
                    console.log(err);
                }
                else{
                   allslide.forEach(function(slide, allindex){
                       slide.images.forEach(function(image,index){
                           if(image.path == ("image/"+path)){
                               slide.images.splice(index,1);
                               slide.save();
                               if(allindex == allslide.length-1 && index == slide.images.length-1){
                                    allslide.save();
                                    res.render("main");
                               }
                           }
                       });
                   });
                   res.render("main");
                }
            });
            res.render("main");
        }
    });
});