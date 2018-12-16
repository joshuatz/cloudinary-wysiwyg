/**
 * @author Joshua Tzucker
 * @file Cobbled together code to download the fabric.js prebuilt js file rather than deal with the dependency chain it requires.
 */

/**
 * constants
 */
const FOLDERPATH = './public/lib/js/';
const FABRICJS_CDNJS = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/2.4.5/fabric.min.js';

/**
 * Dependencies
 */
var fs = require('fs-extra');
var http = require('http');
var https = require('https');
var protocol = http;
var overwrite = true;

// Check protocol
if (/https/.test(FABRICJS_CDNJS)){
  protocol = https;
}

// Make sure folder exists
if(!fs.existsSync(FOLDERPATH)){
  console.log('Could not find ' + FOLDERPATH + ' - making directory');
  fs.mkdirSync(FOLDERPATH);
}

// Make sure fabric.js has been downloaded
if(fs.existsSync(FOLDERPATH + 'fabric.min.js') && !overwrite){
  console.log('File already downloaded!');
}
else {
  downloadFile(FABRICJS_CDNJS,FOLDERPATH + 'fabric.min.js',function(res){
    if (res){
      console.log('File downloaded successfully!');
    }
    else {
      console.error('File download failed!');
    }
  },false);
}


/**
 * Reusable download function (reminder to self: also in zipcode project WIP)
 */
function downloadFile(remote,local,callback,OPT_useCache){
  var skipDownload = false;
  // Default to use cache
  OPT_useCache = typeof(OPT_useCache)!=='undefined' ? OPT_useCache : true;
  if (OPT_useCache && fs.existsSync(local)){
      skipDownload = true;
      console.log("Skipped file download; used cache instead");
      callback(false);
  }
  if (!skipDownload){
      var outputFile = fs.createWriteStream(local);

      outputFile.on("open",function(){
        protocol.get(remote,function(response){
              response.pipe(outputFile);
              response.on("end",function(){
                  outputFile.end();
                  console.log("DONE");
                  callback(true);
              });
          }).on("error",function(err){
              console.error("Error: " + err);
              fs.unlink(local);
              callback(false);
          });
      });
  }
}