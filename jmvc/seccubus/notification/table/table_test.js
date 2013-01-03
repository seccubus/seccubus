steal('funcunit').then(function(){

module("Seccubus.Notification.Table", { 
	setup: function(){
		S.open("//seccubus/notification/table/table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Notification.Table Demo","demo text");
});


});
