module("mxui/menu test",{ 
	setup: function(){
        S.open("//mxui/menu/menu.html");
		S("#menu1").exists();
		S("#menu2").exists();		
	}
})

/* 1) check #menu1 li:eq(0)>ul display:none
 * 2) check #menu1 li:eq(1)>ul display:none
 * 3) click #menu1 li:eq(0)
 * 4) check li.hasClass("active selected")
 * 5) check #menu1 li:eq(0)>ul display:block
 * 6) check #menu1 li:eq(1)>ul display:none
 * 7) check #menu1 li:eq(1)>ul>li:eq(0)>ul display:none
 * 8) click #menu1 li:eq(1)>ul>li:eq(0) 
 * 9) check #menu1 li:eq(1)>ul>li:eq(0)>ul display:block
 * 10) click #menu1 li:eq(1) 
 * 11) check #menu1 li:eq(0)>ul display:none 
 * 11) check #menu1 li:eq(1)>ul display:block 
 */ 
test("Menu Tests", function(){
	S("#menu1>li:eq(0)").visible( function() {
		ok(true, "Menu item#1 is visible.");
	});
	S("#menu1>li:eq(0)>ul").invisible( function() {
		ok(true, "Menu item#1 subitems are  invisible.");
	});
	
	S("#menu1>li:eq(1)").visible( function() {
		ok(true, "Menu item#2 is visible.");
	} );
	S("#menu1>li:eq(1)>ul").invisible( function() {
		ok(true, "Menu item#2 subitems are invisible.");
	} );
	
	S("#menu1>li:eq(0)").click();
	S("#menu1>li:eq(0)").waitHasClass("active selected", true);
	S("#menu1>li:eq(0)>ul").visible( function() {
		ok(true, "Menu item#1 subitems are visible.");
	} );
	S("#menu1>li:eq(1)>ul").invisible( function() {
		ok(true, "Menu item#2 subitems are invisible.");
	} );
	S("#menu1>li:eq(1)>ul>li:eq(0)>ul").invisible( function() {
		ok(true, "Menu item#2 subitems are invisible.");
	} );
	
	S("#menu1>li:eq(0)>ul>li:eq(0)").click();	
	S("#menu1>li:eq(0)>ul>li:eq(0)>ul").visible( function() {
		ok(true, "Menu item#1 subitem#1 subitems are visible.");
	} );
	
	S("#menu1>li:eq(1)").click();
	S("#menu1>li:eq(0)>ul").invisible( function() {
		ok(true, "Menu item#1 subitems invisible.");
	} );
	S("#menu1>li:eq(1)>ul").visible( function() {
		ok(true, "Menu item#2 subitems visible.");
	} );
})