steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/scanner.js", function(){
	module("Model: Seccubus.Scanner")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Scanner.findAll({}, function(scanners){
			ok(scanners)
	        ok(scanners.length)
	        ok(scanners[0].name)
	        ok(scanners[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Scanner({name: "dry cleaning", description: "take to street corner"}).save(function(scanner){
			ok(scanner);
	        ok(scanner.id);
	        equals(scanner.name,"dry cleaning")
	        scanner.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Scanner({name: "cook dinner", description: "chicken"}).
	            save(function(scanner){
	            	equals(scanner.description,"chicken");
	        		scanner.update({description: "steak"},function(scanner){
	        			equals(scanner.description,"steak");
	        			scanner.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Scanner({name: "mow grass", description: "use riding mower"}).
	            destroy(function(scanner){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})