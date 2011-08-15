module("mxui/data/grid/groupable test",{ 
	setup: function(){
        S.open("//mxui/groupablegrid.html");
		S(".resource_1").exists();
	}
})

test("Groupable Test", function(){
    
    S('th.users_count-column-header span').exists()
    S('th.users_count-column-header span').drag("#dragToGroupText")
	var gd = S('.groupDrag'),
		gc = S('.group-col:first');
	
	gd.exists()
	gc.exists(function(){
		ok(/Users\_count/.test(gd.text()), "Group dragged ok")
		ok(/Users\_count\:\d/.test(gc.text()), "Group header ok")
	})
	
	S('.groupDrag .remove').click();
	
	S('.groupDrag').missing(function(){
		ok(true, "Removed group")
	})
	S('.group-col:first').missing(function(){
		ok(true, "Removed group columns")
	})
})