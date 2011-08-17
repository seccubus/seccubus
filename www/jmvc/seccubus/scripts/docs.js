//js seccubus/scripts/doc.js

load('steal/rhino/rhino.js');
steal("documentjs").then(function(){
	DocumentJS('seccubus/seccubus.html', {
		markdown : ['seccubus']
	});
});