steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/up_to_date.js", function(){
	module("Model: Seccubus.Models.UpToDate")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.UpToDate.findAll({}, function(up_to_dates){
			ok(up_to_dates)
	        ok(up_to_dates.length)
	        ok(up_to_dates[0].name)
	        ok(up_to_dates[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.UpToDate({name: "dry cleaning", description: "take to street corner"}).save(function(up_to_date){
			ok(up_to_date);
	        ok(up_to_date.id);
	        equals(up_to_date.name,"dry cleaning")
	        up_to_date.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.UpToDate({name: "cook dinner", description: "chicken"}).
	            save(function(up_to_date){
	            	equals(up_to_date.description,"chicken");
	        		up_to_date.update({description: "steak"},function(up_to_date){
	        			equals(up_to_date.description,"steak");
	        			up_to_date.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.UpToDate({name: "mow grass", description: "use riding mower"}).
	            destroy(function(up_to_date){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})