// First Move JMVC Doc Here:

load('jmvcdoc/scripts/build.js');
steal.File("jmvcdoc/production.js").copyTo("documentjs/jmvcdoc/production.js");
steal.File("jmvcdoc/style.css").copyTo("documentjs/jmvcdoc/style.css");
steal.File("jmvcdoc/summary.ejs").copyTo("documentjs/jmvcdoc/summary.ejs");

steal.File("jmvcdoc/images").copyTo("documentjs/jmvcdoc/images");

// now pluginify, and move everything to work
load('steal/rhino/steal.js');

steal('//steal/build/pluginify/pluginify', function(s){
	steal.build.pluginify("documentjs", {
		destination: "documentjs/dist/documentjs/documentjs.js",
		global: "steal"
	});
})
//
//// copy files
//steal.File("documentjs/scripts/run.js").copyTo("documentjs/dist/documentjs/scripts/run.js");
//steal.File("documentjs/doc.bat").copyTo("documentjs/dist/documentjs/doc.bat");
//steal.File("documentjs/jmvcdoc/summary.ejs").copyTo("documentjs/dist/documentjs/jmvcdoc/summary.ejs");
//steal.File("steal/build/build.js").copyTo("documentjs/dist/steal/build/build.js");
//steal.File("steal/rhino/env.js").copyTo("documentjs/dist/steal/rhino/env.js");
//steal.File("steal/rhino/file.js").copyTo("documentjs/dist/steal/rhino/file.js");
//steal.File("steal/rhino/js.jar").copyTo("documentjs/dist/steal/rhino/js.jar");
//steal.File("steal/rhino/loader.bat").copyTo("documentjs/dist/steal/rhino/loader.bat");
//steal.File("steal/rhino/loader").copyTo("documentjs/dist/steal/rhino/loader");
//steal.File("steal/rhino/utils.js").copyTo("documentjs/dist/steal/rhino/utils.js");
//steal.File("steal/rhino/steal.js").copyTo("documentjs/dist/steal/rhino/steal.js");
//steal.File("steal/steal.production.js").copyTo("documentjs/dist/steal/steal.production.js");
//
//// copy jmvcdoc stuff
//steal.File("jmvcdoc/production.js").copyTo("documentjs/dist/documentjs/jmvcdoc/production.js");
//steal.File("jmvcdoc/style.css").copyTo("documentjs/dist/documentjs/jmvcdoc/style.css");
//
//steal.File("jmvcdoc/images").copyTo("documentjs/dist/documentjs/jmvcdoc/images");