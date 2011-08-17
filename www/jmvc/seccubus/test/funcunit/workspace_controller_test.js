/*global module: true, ok: true, equals: true, S: true, test: true */
module("workspace", {
	setup: function () {
		// open the page
		S.open("//seccubus/seccubus.html");

		//make sure there's at least one workspace on the page before running a test
		S('.workspace').exists();
	},
	//a helper function that creates a workspace
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.workspace:nth-child(2)').exists();
	}
});

test("workspaces present", function () {
	ok(S('.workspace').size() >= 1, "There is at least one workspace");
});

test("create workspaces", function () {

	this.create();

	S(function () {
		ok(S('.workspace:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit workspaces", function () {

	this.create();

	S('.workspace:nth-child(2) a.edit').click();
	S(".workspace input[name=name]").type(" Water");
	S(".workspace input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.workspace:nth-child(2) .edit').exists(function () {

		ok(S('.workspace:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.workspace:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".workspace:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.workspace:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});