steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/run.js", function(){
	module("Model: Seccubus.Run")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Run.findAll({}, function(runs){
			ok(runs)
	        ok(runs.length)
	        ok(runs[0].name)
	        ok(runs[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Run({name: "dry cleaning", description: "take to street corner"}).save(function(run){
			ok(run);
	        ok(run.id);
	        equals(run.name,"dry cleaning")
	        run.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Run({name: "cook dinner", description: "chicken"}).
	            save(function(run){
	            	equals(run.description,"chicken");
	        		run.update({description: "steak"},function(run){
	        			equals(run.description,"steak");
	        			run.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Run({name: "mow grass", description: "use riding mower"}).
	            destroy(function(run){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})