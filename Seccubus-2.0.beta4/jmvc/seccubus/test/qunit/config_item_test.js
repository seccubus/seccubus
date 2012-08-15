steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/config_item.js", function(){
	module("Model: Seccubus.Models.ConfigItem")
	
	test("findAll", function(){
		expect(5);
		stop();
		Seccubus.Models.ConfigItem.findAll({}, function(config_items){
			ok(config_items);
	        	ok(config_items.length);
	        	ok(config_items[0].name);
	        	ok(config_items[0].result);
	        	ok(config_items[0].message);
			start();
		});
		
	})
})
