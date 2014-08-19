BRACKETS In Browser
===================

Brackets in Browser is a version of Brackets that runs in a browser. By default you can install this within `/var/brackets-ide` and point a virtual host to that location. Or you can install it to `opt`, `var`, or wherever you want and point a virtual host to that location. Also, consider that when you are pointing your virtual host to the brackets-in-browser folder you should point it to the `src` folder. Let's say you have brackets installed in `/var/brackets-ide`, you should point your virtual host to: `/var/brackets-ide/src` in order for brachets to run.

Also, after you've finished this, you need to start the `nodefs/server.js` Node server. You can do so by running `nodejs /path/to/brackets/nodefs/server.js`. If you won't start this server, brackets in browser won't work.

To load a folder where you can work with brackets (as a project) go to `src/state.json` and change the `"projectPath": "/var/www/"` to your desired working path. Then simply access your virtual host with your browser and you have brackets running.