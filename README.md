Local shadertoy
===============

I wanted to be able to write simple fullscreen fragment shaders locally with a decent editor, and have live reloading of the preview, so i put this together.

_Note:_ This is a *really simple* local version of the excellent shadertoy, it's currently lacking Texture, Audio and VR support.


Installation
------------

To install required dependencies, mostly grunt stuff, just run `npm install`


Running it
----------

Just run `grunt`

Point your favorite browser to [localhost:8080](http://localhost:8080)

Edit the files in the `workbench` folder and they will regenerate the files in the output folder `www` and if your browser has a livereload plugin installed, it will reload the preview page.


Supported globals
-----------------

`time` - Local time

`mouse` - Mouse position

`resolution` - Screen resolution

