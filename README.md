# UpNode

RESTful file server to upload and serve static files. Powererd by Node.js.


## Installation

```
$ npm install
```
This will create a `node_modules` folder and install all required dependencies to run UpNode.

## Usage

Start the server via `node` command.
The port parameter is optional and defaults to port 8888.

```
$ node server.js [port]

File server running at
  => http://localhost:8888/
CTRL + C to shutdown

```

### `POST` Uploading files

A `POST` request uploads any given files and displays a summary of the file's properties in JSON format.

```
$ curl -F 'upload=@img.png' http://localhost:8888

{
  "errors": false,
  "numberOfFiles": 1,
  "files": [
    {
      "path": "/Users/alexanderschuch/Desktop/UpNode/uploads/img.png",
      "uploadsPath": "/Users/alexanderschuch/Desktop/UpNode/uploads/",
      "filename": "img.png",
      "size": 229258,
      "lastModifiedDate": "2012-09-28T15:22:05.731Z",
      "mimeType": "image/png"
    }
  ]
}

```

You may upload multiple files by providing additional files within the request.

```
$ curl -F 'upload[]=@img.png' -F 'upload[]=@anotherimg.png' http://localhost:8888
```


### `GET` Serving files

You can access any uploaded files by pointing your browser to the uploaded file's path.

E.g. if you uploaded `img.png`, your file will be located at `http://localhost:8888/uploads/img.png`.


## Contributing

* Create something awesome, make the code better, add some functionality,
  whatever (this is the hardest part).
* [Fork it](http://help.github.com/forking/)
* Create new branch to make your changes
* Commit all your changes to your branch
* Submit a [pull request](http://help.github.com/pull-requests/)

## Contact

Feel free to get in touch.

* Website: <http://schuch.me> 
* Twitter: [@schuchalexander](http://twitter.com/schuchalexander)