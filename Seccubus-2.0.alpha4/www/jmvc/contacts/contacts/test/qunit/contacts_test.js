module("contacts");

test("findAll", function(){
	stop(2000);
	Contacts.Models.Contact.findAll({}, function(contacts){
		start()
		ok(contacts, "contacts array exists")
        ok(contacts.length, "there are contacts")
        ok(contacts[0].first, "first name")
        ok(contacts[0].last, "first name")
		equals(contacts[0].first+" "+contacts[0].last, contacts[0].name(), 
			"name method works")
	});
	
})