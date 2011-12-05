steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/scan.js", function(){
	module("Model: Seccubus.Models.Scan")
	
	test("findAll", function(){
		expect(4);
		stop();
		Seccubus.Models.Scan.findAll({}, function(scans){
			ok(scans)
	        ok(scans.length)
	        ok(scans[0].name)
	        ok(scans[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Seccubus.Models.Scan({name: "dry cleaning", description: "take to street corner"}).save(function(scan){
			ok(scan);
	        ok(scan.id);
	        equals(scan.name,"dry cleaning")
	        scan.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Seccubus.Models.Scan({name: "cook dinner", description: "chicken"}).
	            save(function(scan){
	            	equals(scan.description,"chicken");
	        		scan.update({description: "steak"},function(scan){
	        			equals(scan.description,"steak");
	        			scan.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Seccubus.Models.Scan({name: "mow grass", description: "use riding mower"}).
	            destroy(function(scan){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})