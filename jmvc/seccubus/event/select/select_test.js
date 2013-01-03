steal('funcunit',function(){

module("Seccubus.Event.Table", { 
	setup: function(){
		S.open("//seccubus/event/select/select.html");
	}
});

test("delete events", function(){
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
