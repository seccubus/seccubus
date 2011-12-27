steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/scan.js", function(){
	module("Model: Seccubus.Models.Scan")
	
	test("findAll", function(){
		expect(9);
		stop();
		Seccubus.Models.Scan.findAll({}, function(scans){
			ok(scans);
	        	ok(scans.length);
	        	ok(scans[0].workspace > 0);
	        	ok(scans[0].name);
	        	ok(scans[0].scanner);
	        	ok(scans[0].parameters);
	        	ok(scans[0].targets);
	        	ok(scans[0].noFindings);
	        	ok(scans[0].lastScan);
			start();
		});
		
	})
	
	test("create", function(){
		expect(0)
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
		expect(0);
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
		expect(0);
		stop();
		new Seccubus.Models.Scan({name: "mow grass", description: "use riding mower"}).
	            destroy(function(scan){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})
