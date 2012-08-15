module("srchr/history",{
	setup : function(){
		S.open('//srchr/history/history.html')
	}
});




test("Add and remove history", 2, function(){
	
	S("#description").type("Trash\r", function(){
		
		equals( S(".todo:contains('Trash')").size(), 1 , "there is one todo" );
		
	});
	
	S(".todo:contains('Trash')").find(".remove").click()
	
	S(".todo:contains('Trash')").size(0, function(){
		ok(true,"no more todos")
	});
});


test("add and refresh", 3, function(){
	
	S("#description").type("Trash\r", function(){
		
		equals( S(".todo:contains('Trash')").size(), 1 , "there is one todo" );
		
	});
	S.open('//srchr/history/history.html', function(){
		equals( S(".todo:contains('Trash')").size(), 1 , "there is one todo after refresh" );
	});
	S(".todo:contains('Trash')").find(".remove").click();
	
	S(".todo:contains('Trash')").size(0, function(){
		ok(true, "no more todos")
	});
})



