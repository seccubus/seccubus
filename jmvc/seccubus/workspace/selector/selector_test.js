steal('funcunit',function(){

module("Seccubus.Workspace.Table", { 
	setup: function(){
		S.open("//seccubus/workspace/selector/selector.html");
	}
});

test("delete workspaces", function(){
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
