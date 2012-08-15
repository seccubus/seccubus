/**
 * @parent index
 * Wraps backend workspace services.  Enables 
 * [Seccubus.Models.Workspace.static.findAll retrieving],
 * [Seccubus.Models.Workspace.static.update updating],
 * [Seccubus.Models.Workspace.static.destroy destroying], and
 * [Seccubus.Models.Workspace.static.create creating] workspaces.
 */
$.Model.extend('Seccubus.Models.Workspace',
/* @Static */
{
	/**
 	 * Retrieves workspaces data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped workspace objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/workspace',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//seccubus/fixtures/workspaces.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a workspace's data.
	 * @param {String} id A unique id representing your workspace.
	 * @param {Object} attrs Data to update your workspace with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/workspaces/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a workspace's data.
 	 * @param {String} id A unique id representing your workspace.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/workspaces/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a workspace.
	 * @param {Object} attrs A workspace's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/workspaces',
			type: 'post',
			dataType: 'json',
			success: success,
			error: error,
			data: attrs,
			fixture: "-restCreate" //uses $.fixture.restCreate for response.
		});
	}
},
/* @Prototype */
{});