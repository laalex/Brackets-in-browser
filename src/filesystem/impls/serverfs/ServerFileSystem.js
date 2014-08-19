/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * =============================================================================
 * About ServerFileSystem.js
 * -------------------------
 * This ServerFileSystem impl will allow a user to take file actions on an apache
 * server for the /var/www folder.
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, appshell, $, window */

define(function (require, exports, module) {
    "use strict";

    var FileUtils           = require("file/FileUtils"),
        FileSystemStats     = require("filesystem/FileSystemStats"),
        FileSystemError     = require("filesystem/FileSystemError"),
        Socket              = window.socket;



    /**
     * Logging function
     */
    var _ENABLE_LOGGING = false; //DEFINE LOGGING
    /**
     * 1 - message
     * 2 - errors
     */
    var _LOG_LEVEL = 2;
    function Log(variable, _level){
        if(_level === undefined) _level = 1;
        if(variable !== null && _level === 2 && _ENABLE_LOGGING) {//Log errors only if they are not null
            console.log(variable);
        } else {
            if(_level <= _LOG_LEVEL && _ENABLE_LOGGING) console.log(variable);
        }
    }


    /** ===========================
     * FileSystem interface methods
     */

    /**
     * @param {boolean} allowMultipleSelection
     * @param {boolean} chooseDirectories
     * @param {string} title
     * @param {string} initialPath
     * @param {Array.<string>=} fileTypes
     * @param {function(?string, Array.<string>=)} callback
     *
     * Display an open-files dialog to the user and call back asynchronously with either an error string or an array of path strings, which indicate the file or files chosen by the user.
     */
    function showOpenDialog(allowMultipleSelection, chooseDirectories, title, initialPath, fileTypes, callback){
        //TODO
        Log("not implemented");
        alert('not implemented');
    }

    /**
     * @param {string} title
     * @param {string} initialPath
     * @param {string} proposedNewFilename
     * @param {function(?string, string=)} callback
     *
     * Display a save-file dialog to the user and call back asynchronously with either an error or the path to which the user has chosen to save the file.
     */
    function showSaveDialog(title, initialPath, proposedNewFilename, callback){
        //TODO
        alert('not implemented');
    }

    /**
     * @param {string} path
     * @param {function(?string, boolean)} callback
     *
     * Determine whether a file or directory exists at the given path by calling back asynchronously with either an error or a boolean, which is true if the file exists and false otherwise. The error will never be FileSystemError.NOT_FOUND; in that case, there will be no error and the boolean parameter will be false.
     */
    function exists(path, callback){
        //Emit exists command to the nodejs server and wait for callback
        Log("Exists called: ["+path+"]");
        Socket.emit('execCommand', 'exists', {path: path}, function(err, exists){
            callback(err, exists);
        });
    }

    /**
     * @param {string} path
     * @param {function(?string, Array.<FileSystemEntry>=, Array.<?string|FileSystemStats>=)} callback
     *
     * Read the contents of the directory at the given path, calling back asynchronously either with an error or an array of FileSystemEntry objects along with another consistent array, each index of which either contains a FileSystemStats object for the corresponding FileSystemEntry object in the second parameter or a FileSystemErrors string describing a stat error.
     */
    function readdir(path, callback){
        //Emit readdir command to the nodejs server and wait for callback
        Log("Readdir called: ["+path+"]");
        Socket.emit('execCommand', 'readdir', {path: path}, function(err, _files, _stats){
            callback(err, _files, _stats);
        });
    }

    /**
     * @param {string} path
     * @param {number=} mode
     * @param {function(?string, FileSystemStats=)=} callback
     *
     * Create a directory at the given path, and optionally call back asynchronously with either an error or a stats object for the newly created directory. The octal mode parameter is optional; if unspecified, the mode of the created directory is implementation dependent.
     */
    function mkdir(path, mode, callback){
        //Emit mkdir command to the nodejs server and wait for callback
        Log("MKDir called: ["+path+"], ["+mode+"]");
        Socket.emit('execCommand', 'mkdir', {path: path, mode: mode}, function(err, stat){
            Log(err, 2);
            callback(err, stat);
        });
    }

    /**
     * @param {string} oldPath
     * @param {string} newPath
     * @param {function(?string)=} callback
     *
     * Rename the file or directory at oldPath to newPath, and optionally call back asynchronously with a possibly null error.
     */
    function rename(oldPath, newPath, callback){
        //Emit rename command to the nodejs server and wait for callback
        Log("Rename called: ["+oldpath+"], ["+newPath+"]");
        Socket.emit('execCommand', 'rename', {oldPath: oldPath, newPath: newPath}, function(data){
            callback(data);
        });
    }

    /**
     * @param {string} path
     * @param {function(?string, FileSystemStats=)} callback
     *
     * Stat the file or directory at the given path, calling back asynchronously with either an error or the entry's associated FileSystemStats object.
     */
    function stat(path, callback){
        //Emit stat command to the nodejs server and wait for callback
        Log("Stat called: ["+path+"]");
        Socket.emit('execCommand', 'stat', {path: path}, function(err, stats){
            Log("Error from stats on path: "+path);
            Log(err, 2);
            if(err){
                //Return error
                callback(err, null);
            }
            callback(null, stats);
        });
    }

    /**
     * @param {string} path
     * @param {{encoding : string=}=} options
     * @param {function(?string, string=, FileSystemStats=)} callback
     *
     * Read the contents of the file at the given path, calling back asynchronously with either an error or the data and, optionally, the FileSystemStats object associated with the read file. The optional options parameter can be used to specify an encoding (default "utf8").
     */
    function readFile(path, options, callback){
        //Emit readfile command to the nodejs server and wait for callback
        Log("Readfile called: ["+path+"]");
        Socket.emit('execCommand', 'readfile', {path: path, options: options}, function(err, data, stats){
            Log(err, 2);
            Log("File data:" +data);
            callback(err, data, stats);
        });
    }

    /**
     * @param {string} path
     * @param {string} data
     * @param {{encoding : string=, mode : number=}=} options
     * @param {function(?string, FileSystemStats=)} callback
     *
     * Write the given data to the file at the given path, calling back asynchronously with either an error or, optionally, the          * FileSystemStats object associated with the written file. The optional options parameter can be used to specify an encoding (default "utf8") and an octal mode (default unspecified and implementation dependent). If no file exists at the given path, a new file will be created.
     */
    function writeFile(path, data, options, callback){
        if(path === '/var/brackets-ide/src/state.json'){
            Log("Cancelled overriding the state.json file");
            callback(null, null, null);
            return;
        }
        //Emit writefile command to the nodejs server and wait for callback
        Log("Writefile called: ["+path+"]");
        Socket.emit('execCommand', 'writefile', {path: path, data: data, options: options}, function(err, stats, created){
            Log(err, 2);
            callback(err, stats, created);
        });
    }

    /**
     * @param {string} path
     * @param {function(string)=} callback
     *
     * Unlink the file or directory at the given path, optionally calling back asynchronously with a possibly null error.
     */
    function unlink(path, callback){
        //Emit unlink command to the nodejs server and wait for callback
        Log("Unlink called: ["+path+"]");
        Socket.emit('execCommand', 'unlink', {path: path}, function(data){
            callback(data);
        });
    }

    /**
     * @param {function(?string, FileSystemStats=)} changeCallback
     * @param {function(?string)=} offlineCallback
     *
     * Initialize file watching for this filesystem. The implementation must use the supplied changeCallback to provide change notifications. The first parameter of changeCallback specifies the changed path (either a file or a directory); if this parameter is null, it indicates that the implementation cannot specify a particular changed path, and so the callers should consider all paths to have changed and to update their state accordingly. The second parameter to changeCallback is an optional FileSystemStats object that may be provided in case the changed path already exists and stats are readily available.
     *
     * If file watching becomes unavailable or is unsupported, the implementation must call offlineCallback if it was provided, optionally passing an error code. In addition, the implementation must ensure that all future calls to watchPath() fail with an error (until such time as file watching becomes available again).
     */
    function initWatchers(changeCallback, offlineCallback){
        //TODO
    }

    /**
     * @param {string} path
     * @param {function(?string)=} callback
     *
     * Start providing change notifications for the file or directory at the given path, optionally calling back asynchronously with a possibly null error when the operation is complete. Notifications are provided using the changeCallback function provided by the initWatchers method. If the path is a directory, the expected behavior depends on the implementation's recursiveWatch flag: if true, notifications are expected for the entire subtree rooted at this directory; if false, notifications are expected only for the directory's immediate children.
     */
    function watchPath(path, callback){
        //not implemented
        callback(FileSystemError.NOT_SUPPORTED);
    }

    /**
     * @param {string} path
     * @param {function(?string)=} callback
     *
     * Stop providing change notifications for the file or directory at the given path and all subfolders, optionally calling back asynchronously with a possibly null error when the operation is complete. Unlike watchPath(), this is always expected to behave recursively.
     */
    function unwatchPath(path, callback){
        //not implemented
        callback(FileSystemError.NOT_SUPPORTED);
    }

    /**
     * @param {function(?string)=} callback
     *
     * Stop providing change notifications for all previously watched files and directories, optionally calling back asynchronously with a possibly null error when the operation is complete.
     */
    function unwatchAll(callback){
        //not implemented
        callback("NOT IMPLEMENTED");
    }


    /** Function count the occurrences of substring in a string;
     * @private
     *
     * @param {String} string   Required. The string;
     * @param {String} subString    Required. The string to search for;
     * @param {Boolean} allowOverlapping    Optional. Default: false;
     */
    function occurrences(string, subString, allowOverlapping){

        string+=""; subString+="";
        if(subString.length<=0) return string.length+1;

        var n=0, pos=0;
        var step=(allowOverlapping)?(1):(subString.length);

        while(true){
            pos=string.indexOf(subString,pos);
            if(pos>=0){ n++; pos+=step; } else break;
        }
        return(n);
    }


     // Export public API
    exports.showOpenDialog  = showOpenDialog;
    exports.showSaveDialog  = showSaveDialog;
    exports.exists          = exists;
    exports.readdir         = readdir;
    exports.mkdir           = mkdir;
    exports.rename          = rename;
    exports.stat            = stat;
    exports.readFile        = readFile;
    exports.writeFile       = writeFile;
    exports.unlink          = unlink;
    //exports.moveToTrash     = moveToTrash;
    exports.initWatchers    = initWatchers;
    exports.watchPath       = watchPath;
    exports.unwatchPath     = unwatchPath;
    exports.unwatchAll      = unwatchAll;

    /**
     * Indicates whether or not recursive watching notifications are supported
     * by the watchPath call. Currently, only Darwin supports recursive watching.
     *
     * @type {boolean}
     */
    exports.recursiveWatch = false;

    /**
     * Indicates whether or not the filesystem should expect and normalize UNC
     * paths. If set, then //server/directory/ is a normalized path; otherwise the
     * filesystem will normalize it to /server/directory. Currently, UNC path
     * normalization only occurs on Windows.
     *
     * @type {boolean}
     */
    exports.normalizeUNCPaths = false;

});
