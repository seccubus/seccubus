steal(
	'./seccubus.css', 			// application CSS file
	'./models/models.js',			// steals all your models
	//'./fixtures/fixtures.js',		// sets up fixtures for your models
	'seccubus/tabs',
	'seccubus/up_to_date/list',
	'seccubus/config_item/list',
	function(){					// configure your application
		$('#navTab').seccubus_tabs();
		// Disable the Scans and Findings tab on start
		$('#navTab').seccubus_tabs("disable", 2);
		$('#navTab').seccubus_tabs("disable", 3);
		// Hide Issues and Reports tab for now
		$('#navTab').seccubus_tabs("hide", 4);
		$('#navTab').seccubus_tabs("hide", 5);

		// UpToDate status
		$('#up_to_dates').seccubus_up_to_date_list();

		// ConfigItem status
		$('#config_items').seccubus_config_item_list();
}
)
