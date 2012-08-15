//steal/js seccubus/tabs/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('seccubus/tabs/scripts/build.html',{to: 'seccubus/tabs'});
});
