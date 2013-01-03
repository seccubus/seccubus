steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/event.js", function(){
	module("Model: Seccubus.Models.Event")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Event.findAll({}, function(events){
			ok(events)
	        ok(events.length)
	        ok(events[0].name)
	        ok(events[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Event({name: "dry cleaning", description: "take to street corner"}).save(function(event){
			ok(event);
	        ok(event.id);
	        equals(event.name,"dry cleaning")
	        event.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Event({name: "cook dinner", description: "chicken"}).
	            save(function(event){
	            	equals(event.description,"chicken");
	        		event.update({description: "steak"},function(event){
	        			equals(event.description,"steak");
	        			event.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Event({name: "mow grass", description: "use riding mower"}).
	            destroy(function(event){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})