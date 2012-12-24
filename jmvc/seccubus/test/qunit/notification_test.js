steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/notification.js", function(){
	module("Model: Seccubus.Models.Notification")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Notification.findAll({}, function(notifications){
			ok(notifications)
	        ok(notifications.length)
	        ok(notifications[0].name)
	        ok(notifications[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Notification({name: "dry cleaning", description: "take to street corner"}).save(function(notification){
			ok(notification);
	        ok(notification.id);
	        equals(notification.name,"dry cleaning")
	        notification.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Notification({name: "cook dinner", description: "chicken"}).
	            save(function(notification){
	            	equals(notification.description,"chicken");
	        		notification.update({description: "steak"},function(notification){
	        			equals(notification.description,"steak");
	        			notification.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Notification({name: "mow grass", description: "use riding mower"}).
	            destroy(function(notification){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})