# Seccubus frontend
For development and installing dependencies you will need NodeJS and NPM installed on your system.

## Installing dependencies
JSPM is used as package manager next to NPM, install it using:

``` npm install jspm -g ```

Then you can run:
``` npm install ```
``` jspm install ```

Now you have all  needed dependencies installed.

## Development
Grunt is used as a task runner, there are two tasks defined:

``` grunt build ```
This will do an actual build, minify bundle, compile less etc.

``` grunt watchsync ```
This will start a task you can use during development. It will watch for changes, recompile and
reload your browser automatically.
