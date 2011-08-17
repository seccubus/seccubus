//steal/js seccubus/scripts/compress.js

load("steal/rhino/rhino.js");
steal('steal/build').then('steal/build/scripts','steal/build/styles',function(){
	steal.build('seccubus/scripts/build.html',{to: 'seccubus'});
});
