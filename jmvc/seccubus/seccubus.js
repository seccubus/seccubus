steal(
	
	'./seccubus.css',		// application CSS file
	'./models/models.js',		// steals all your models
	'./fixtures/fixtures.js',	// sets up fixtures for your models
	'seccubus/tabs',		// get Seccubus tabs
	function(){			// configure your application
		
		
		//alert('Yes we exist');
       $('#navTab').seccubus_tabs();
       // Disable the Scans and Findings tab on start
       $('#navTab').seccubus_tabs("disable", 1);
       $('#navTab').seccubus_tabs("disable", 2);
       // Hide Issues and Reports tab for now
       $('#navTab').seccubus_tabs("hide", 3);
       $('#navTab').seccubus_tabs("hide", 4);
})
