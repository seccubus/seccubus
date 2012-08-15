steal('funcunit',function(){

module("Seccubus.UpToDate.List", { 
	setup: function(){
		S.open("//seccubus/up_to_date/list/list.html");
	}
});

test("delete up_to_dates", function(){
	S('#create').click()
	
	// wait until grilled cheese has been added
	S('h3:contains(Grilled Cheese X)').exists();
	
	S.confirm(true);
	S('h3:last a').click();
	
	
	S('h3:contains(Grilled Cheese)').missing(function(){
		ok(true,"Grilled Cheese Removed")
	});
	
});


});