/**
 * Node File System API Server
 * ---------------------------
 * Uses Socket.IO to make calls to different commands
 * on the host system that are required by Brackets
 */

var fs = require('fs'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

    /**
     * Constants
     */

    var _SERVER_PORT = 3000,
        Errors = {
            EmptyPath: "Empty path provided"
        };

    /**
     * Variables
     */

    var _connections = []; //Keep track of nodejs connections
    var _socket = null; //Keep a copy of the current socket
    var _basePath = "/var/www";



    /**
     * Socket server logic
     */
    io.on('connection', function(socket){

        /**
         * Push our socket connection within the _connections array
         */
        _connections.push(socket);
        _socket = socket;

        //Show message that our socket has been added to the connections pool
        console.log("A new connection has been established with: "+socket.id);

        /**
         * Wait for a command from the client
         * @param {String} command - command name to be executed
         * @param {Object} data - json object having the function data
         */
        socket.on('execCommand', function(command, data, callback){
            //Switch the command, execute it and send back the return
            switch(command){
                    //Call mkdir
                    case "mkdir":
                        mkdir(data.path, function(err, stats){
                            callback(err, stats);
                        });
                    break;

                    //call readfile
                    case "readfile":
                        readfile(data.path, data.otpions, function(err, data, stats){
                            callback(err, data, stats);
                        });
                    break;

                    //call stat
                    case "stat":
                        stat(data.path, function(err, stats){
                            callback(err, stats);
                        })
                    break;

                    //exists call
                    case "exists":
                        exists(data.path, function(err, exists){
                            callback(err, exists);
                        });
                    break;

                    //readdir call
                    case "readdir":
                        readdir(data.path, function(err, _files, _file_stats){
                            callback(err, _files, _file_stats);
                        });
                    break;

                    //rename call
                    case "rename":
                        rename(data.oldPath, data.newPath, function(response){
                            callback(response);
                        });
                    break;

                    //writefile call
                    case "writefile":
                        writefile(data.path, data.data, data.otpions, function(err, stats, created){
                            callback(err, stats, created);
                        });
                    break;

                    //unlink call
                    case "unlink":
                        unlink(data.path, function(response){
                            callback(response);
                        });
                    break;
            }
        });
    });





    /** ----------------------- FS COMMANDS  ----------------------- */

    /**
     * exists(path, callback)
     */
    function exists(path, callback){
        //Check if the file exists
        fs.exists(path, function(exists){
            callback(null, exists);
        });
    };

    /**
     * stat(path,callback)
     * Return stats of a file
     */
    function stat(path, callback){
        //Get file stats
        fs.stat(path, function(err, _stats){
            if(err){
                callback(err);
            } else {
                var _this_file_stats = {
                    isFile: _stats.isFile(),
                    mtime: _stats.mtime,
                    size: _stats.size,
                    realPath: path,
                    hash: _stats.mtime.getTime()
                }
                callback(err, _this_file_stats);
            }
        });
    }

    /**
     * readdir(path, callback)
     */
    function readdir(path,callback){
        //Read the directory and return the files details
        fs.readdir(path, function(err,files){
            if(null === err){
                //Recurse the file and return file name + file stats
                var _files = [];
                var _file_stats = [];
                var _length = files.length;
                //Check to see if there are any contents
                if(!_length){
                    callback(null, [], []);
                    return;
                }
                //Iterate files
                files.forEach(function(file, pos){
                    /**
                     * Append the current path to the file. Since we're only using this on linux the DIRECTORY_SEPARATOR
                     * will always be "/"
                     */
                    file = path + file;
                    var _stats = fs.statSync(file);
                    //Push the stats within the return object
                    
                    var _this_file_stats = {
                        isFile: _stats.isFile(),
                        mtime: _stats.mtime,
                        size: _stats.size,
                        realPath: file,
                        hash: _stats.mtime.getTime()
                    }
                    _file_stats[pos] = _this_file_stats;
                });
                
                callback(err, files, _file_stats);
                return;
            } else {
                //Return the error of reading the directory
                callback(err);
                return;
            }
        });
    };

    /**
     * mkdir(path, mode, callback)
     */
    function mkdir(path, mode, callback){
        //Check typeof mode to see if the mode has been provided or not
        if (typeof mode === "function") {
            callback = mode;
            mode = parseInt("0755", 8);
        }
        //Create the directory
        fs.mkdir(path, mode, function(err){
           if(null === err){
               //Get file stats
                fs.stat(path, function(err, _stats){
                    if(err === null){
                        //Return file stats
                        var _this_file_stats = {
                            isFile: _stats.isFile(),
                            mtime: _stats.mtime,
                            size: _stats.size,
                            realPath: path,
                            hash: _stats.mtime.getTime()
                        }
                        callback(err, _this_file_stats);
                    } else {
                        //Return error
                        callback(err);
                    }
                });
           } else {
               callback(err);//Return the error
           }
        });
    };

    /**
     * readFile(path, options, callback)
     */
    function readfile(path, options, callback){
        //Read the file and get the data
        fs.readFile(path, 'utf8', function(err, data){
            if(null === err){
                //Return data
                fs.stat(path, function(serr, _stats){
                    if(serr === null){
                        //Return file stats
                        var _this_file_stats = {
                            isFile: _stats.isFile(),
                            mtime: _stats.mtime,
                            size: _stats.size,
                            realPath: path,
                            hash: _stats.mtime.getTime()
                        }
                        callback(err, data, _this_file_stats);
                    } else {
                        //Return error
                        callback(err, data, null);
                    }
                });
            } else {
                //Return error
                callback(err, null, null);
            }
        });
    }

    /**
     * rename(oldPath, newPath, callback)
     */
    function rename(oldPath, newPath, callback){
        fs.rename(oldPath, newPath, function(err){
            if(null === exc){
                //Console log
                callback(null);
            } else {
                //Return error if any
                callback(err);
            }
        });
    }

    /**
     * writeFile(path, data, [options], callback)
     */
    function writefile(path, data, options, callback){
        if("function" === typeof options){
            callback = options; //Get the callback function if the options parameter isn't set
        }
        fs.writeFile(path, data, options, function(err){
             if(null === err){
                 //Return file stats
                 fs.stat(path, function(serr, _stats){
                    if(serr === null){
                        //Return file stats
                        var _this_file_stats = {
                            isFile: _stats.isFile(),
                            mtime: _stats.mtime,
                            size: _stats.size,
                            realPath: path,
                            hash: _stats.mtime.getTime()
                        }
                        callback(serr, _this_file_stats, true);
                    } else {
                        //Return error
                        callback(serr, null, true);
                    }
                });
             } else {
                 //Return error
                 callback(err, null, false);
             }
        });
    }

    /**
     * unlink(path, callback)
     */
    function unlink(path, callback){
        fs.unlink(path, function(err){
            if(null === err){
                //Console log
                callback(null);
            } else {
                //Return error
                callback(err);
            }
        });
    }

    /** ----------------------- FS COMMANDS END -------------------- */




    /**
     * Start the server on our defined _EXPRESS_PORT
     *
     * @param _SERVER_PORT {Integer}
     * Server port
     */
    http.listen(_SERVER_PORT, function(){
        console.log("Your NodeFS Server is running on port "+ _SERVER_PORT);
    });
