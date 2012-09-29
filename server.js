//
// UpNode 
//
// v0.0.1
// Author: Alexander Schuch 
//
// http://github.com/aschuch
// http://schuch.me
// hello@schuch.me
//
var http = require('http')
  , url = require('url')
  , path = require('path')
  , fs = require('fs')
  , mime = require('mime')
  , Formidable = require('formidable');

// Configuration options
var uploadsPath = __dirname + '/uploads/'
  , port = process.argv[2] || 8888
  , mimeTypeWhitelist = ["image/png"]; 

// server setup
http.createServer(function(req, res) {

   //
   // prevent double requests
   // https://gist.github.com/763822
   //
   if (req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'} );
      res.end();
      return;
   }

   //
   // ROUTER
   // setup simple RESTful routing
   //
   var method = req.method.toLowerCase();

   if (method == 'get') {
      serveFile(req, res);
   } else if (method == 'post') {
      saveFile(req, res);
   }

   // --------------------

   //
   // GET request
   // serve the requested file if it exists
   //
   function serveFile(filename) {
      var uri = url.parse(req.url).pathname
        , filename = path.join(process.cwd(), uri);
  
      // file is directory
      if (fs.statSync(filename).isDirectory()) filename += 'index.html';

      fs.exists(filename, function(exists) {

         // check if file exists
         if(!exists) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not Found\n' + filename + ' does not exist.');
            return;
         }

         // serve file
         fs.readFile(filename, 'binary', function(err, file) {
            if(err) {
               res.writeHead(500, {'Content-Type': 'text/plain'});
               res.end(err);
               return;
            }

            // lookup correct mime type
            var mimeType = mime.lookup(filename);

            res.writeHead(200, {'Content-Type': mimeType});
            res.end(file, 'binary');
         });
         
      });
   } 

   // --------------------

   //
   // POST request
   // save the given files to disk
   //
   function saveFile() {
      res.writeHead(200, {'Content-Type': 'application/json'});

      // JSON return object
      var json = {};

      // JSON defaults
      json.errors = false;
      json.numberOfFiles = 0;
      json.files = [];

      // parse file upload
      var form = new Formidable.IncomingForm()
        , progress = null
        , bytesAlreadyReceived = 0
        , files = []
        , fields = {};

      form
         // progress
         .on('progress', function(bytesReceived, bytesExpected) {
            var percent = ((bytesReceived/bytesExpected)*100).toFixed(2);
            process.stdout.write('\r\033[2K' + 'Uploading: ' + percent + '%');
         })

         // incoming file
         .on('file', function(field, file) {

            // Check file for allowed/whitelisted files
            var mimeType = mime.lookup(file.filename);
            if (typeof(mimeTypeWhitelist) !== 'undefined' && mimeTypeWhitelist.length > 0) {
               // actually use the whitelist
               if(mimeTypeWhitelist.indexOf(mimeType) == -1) {
                  // error, the file's mime is not white listed
                  console.log("\nIgnoring uploaded file '" + file.name + "' of type '" + mimeType + "', the file's mime type is not white listed.");
                  return;
               }
            }

            // add file to files list
            var fileInfo = {};
            fileInfo.path = uploadsPath + file.name;
            fileInfo.uploadsPath = uploadsPath;
            fileInfo.filename = file.filename;
            fileInfo.size = file.size;
            fileInfo.lastModifiedDate = file.lastModifiedDate;
            fileInfo.mimeType = mimeType;

            files.push(fileInfo);

            //rename the incoming file
            fs.renameSync(file.path, fileInfo.path);
         })

         // fields, other query params
         .on('field', function(name, value) {
            fields.name = value;
         }) 

         // error
         .on('error', function(err) {
            json.error = err;
            res.end(JSON.stringify(json));
         })

         // end of request
         .on('end', function() {
            //json.params = params;
            json.fields = fields;
            json.files = files;
            json.numberOfFiles = files.length;
            res.end(JSON.stringify(json));

            process.stdout.write('\r\033[2K' + 'Uploading: [DONE]\n');
         });
      form.parse(req);
   }

}).listen(parseInt(port, 10), 'localhost');

console.log('File server running at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown\n');
