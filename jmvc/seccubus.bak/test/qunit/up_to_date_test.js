steal("funcunit/qunit", "seccubus/fixtures", "seccubus/models/up_to_date.js", function(){
//steal("funcunit/qunit", "seccubus/models/up_to_date.js", function(){
	module("Model: Seccubus.Models.UpToDate")
	
	test("findAll", function(){
		expect(5);
		stop();
		Seccubus.Models.UpToDate.findAll({}, function(up_to_dates){
			ok(up_to_dates)
	        	ok(up_to_dates.length)
	        	ok(up_to_dates[0].status)
	        	ok(up_to_dates[0].message)
	        	ok(up_to_dates[0].link || up_to_dates[0].link == "" )
			start();
		});
		
	})
})
