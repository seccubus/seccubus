steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/config_item.js", function(){
	module("Model: Seccubus.Models.ConfigItem")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.ConfigItem.findAll({}, function(config_items){
			ok(config_items)
	        ok(config_items.length)
	        ok(config_items[0].name)
	        ok(config_items[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.ConfigItem({name: "dry cleaning", description: "take to street corner"}).save(function(config_item){
			ok(config_item);
	        ok(config_item.id);
	        equals(config_item.name,"dry cleaning")
	        config_item.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.ConfigItem({name: "cook dinner", description: "chicken"}).
	            save(function(config_item){
	            	equals(config_item.description,"chicken");
	        		config_item.update({description: "steak"},function(config_item){
	        			equals(config_item.description,"steak");
	        			config_item.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.ConfigItem({name: "mow grass", description: "use riding mower"}).
	            destroy(function(config_item){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})