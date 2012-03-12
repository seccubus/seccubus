steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' )
.then(	'./views/init.ejs',
	'./views/finding.ejs',
	'./views/header.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Finding.Table
 * @parent Finding
 * Controller that displays a sortable table of findings including multiselect
 */
$.Controller('Seccubus.Finding.Table',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that holds the options in its attributes
	 */
	defaults : {
		/*
		 * @attribute options.workspace
		 * The currently selected workspace, -1 = no workspace
		 */
		workspace	: -1,
		/*
		 * @attribute options.scans
		 * Array of selected scans, null is no scans selected
		 */
		scans		: null,
		/*
		 * @attribute options.status
		 * The current status, prevents incorrect status selections
		 */
		status		: 1,
		/*
		 * @attribute options.host
		 * The current host filter
		 */
		host		: "*",
		/*
		 * @attribute options.hostName
		 * The current hostName filter
		 */
		hostName	: "*",
		/*
		 * @attribute options.port
		 * The current port filter
		 */
		port		: "*",
		/*
		 * @attribute options.plugin
		 * The current plugin filter
		 */
		plugin		: "*",
		/*
		 * @attribute options.severity
		 * The current severity filter
		 */
		severity		: "*",
		/*
		 * @attribute options.finding
		 * The current finding filter
		 */
		finding		: "",
		/*
		 * @attribute options.remark
		 * The current remark filter
		 */
		remark		: "",
		/*
		 * @attribute options.orderBy
		 * By what attribute the table is sorted by
		 */
		orderBy		: "host",
		/*
		 * @attribute options.descending
		 * Boolean that determines if the order is descending
		 */
		descending	: false,
		/*
		 * @attribute options.columns
		 * Array that holds pairs of column headers and attribute names
		 * If the attribute is empty and the label is select this 
		 * represents the multiselect column, if the attribute is empty
		 * but the label is 'Action' this is the action column
		 */
		columns		: [ 	"", "select",
					"host", "IP", 
					"hostName", "HostName", 
					"port", "Port", 
					"plugin", "Plugin", 
					"severity", "Severity", 
					"find", "Finding",
					"remark", "Remark",
					"", "Action"
				  ],
		/*
		 * @attribute options.checked that holds the state of the 
		 * master checkbox of the multiselect
		 */
		checked		: {
					/*
					 * @attribute options.checked.none
					 * Boolean that indicates no findings 
					 * are checked
					 */
					"none" : true,
					/*
					 * @attribute options.checked.all
					 * Boolean that indicates if all 
					 * findings are checked
					 */
					"all" : false
				  },
		/*
		 * @attribute options.onEdit
		 * Function that is called when an attribute's edit link is 
		 * clicked
		 */
		onEdit		:  function(find) {
			alert("Options.onEdit function is not set");
		}
	}
},
/** @Prototype */
{
	/*
	 * Calls updateView to (re-)render the control
	 */
	init : function(){
		this.updateView();
	},
	/*
	 * (Re-)renders the control
	 */
	updateView : function() {
		this.options.checked = { "all" : this.options.checked.all, "none" : ! this.options.checked.all };
		if ( this.options.workspace < 0  ) {
			this.element.html(
				this.view('error',{
					columns		: this.options.columns,
					orderBy		: this.options.orderBy,
					descending	: this.options.descending,
					message 	: "Please select a workspace first",
					checked		: this.options.checked
				})
			);
		} else if ( this.options.scans == null ) {
			this.element.html(
				this.view('error',{
					columns		: this.options.columns,
					orderBy		: this.options.orderBy,
					descending	: this.options.descending,
					message 	: "Please select one or more scans",
					checked		: this.options.checked
				})
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Finding.findAll({
						workspaceId	: this.options.workspace
					}), 
					{
						columns		: this.options.columns,
						fStatus		: this.options.status,
						fScans		: this.options.scans,
						fHost		: this.options.host,
						fHostName	: this.options.hostName,
						fPort		: this.options.port,
						fPlugin		: this.options.plugin,
						fSeverity	: this.options.severity,
						fFinding	: this.options.finding,
						fRemark		: this.options.remark,
						orderBy		: this.options.orderBy,
						descending	: this.options.descending,
						fn		: this.sortFunc(this.options.orderBy,this.options.descending),
						checked		: this.options.checked
					}
				)
			);
		}
	},
	// Handle click event on table headers to sort
	"th click" : function(el,ev) {
		if($(el).attr("sort")) {	// Only sort when sort column
			if(this.options.orderBy == $(el).attr("sort")) {
				if ( this.options.descending ) {
					this.options.descending = false;
				} else {
					this.options.descending = true;
				}
			} else {
				this.options.orderBy = $(el).attr("sort");
				this.options.descending = false;
			}
			this.updateView();
		}
	},
	// Handle master checkbox
	".selectAll click" : function(el,ev) {
		if ( typeof $(el).attr("checked") == "undefined" || $(el).attr("checked") == false ) {
			$('.selectAll').attr("checked", true);
			$('.selectAll').attr("src", "img/checkbox_filled.png");
			$('.selectFinding').attr("checked", true);
			$('.selectFinding').attr("src", "img/checkbox_filled.png");
			this.options.checked = { all : true, none: false }
		} else {
			$('.selectAll').attr("checked", false);
			$('.selectAll').attr("src", "img/checkbox_blank.png");
			$('.selectFinding').attr("checked", false);
			$('.selectFinding').attr("src", "img/checkbox_blank.png");
			this.options.checked = { all : false, none: true }
		}
	},
	// Handle checkbox clicks
	".selectFinding click" : function(el,ev) {
		if ( typeof $(el).attr("checked") == "undefined" || $(el).attr("checked") == false ) {
			$(el).attr("checked", true);
			$(el).attr("src", "img/checkbox_filled.png");
			this.options.checked[$(el).attr("finding")] = true;
		} else {
			$(el).attr("checked", false);
			$(el).attr("src", "img/checkbox_blank.png");
			this.options.checked[$(el).attr("finding")] = false;
		}
		var all = true;
		var none = true;
		$('.selectFinding').each(function() {
			if (typeof $(this).attr("checked") == "undefined" || $(this).attr("checked") == false ) {
				all = false;
			} else {
				none = false;
			}
		});
		this.options.checked = { all : all, none: none }
		if ( all ) {
			$(".selectAll").attr("checked", true);
			$(".selectAll").attr("src", "img/checkbox_filled.png");
		} else if ( none ) {
			$(".selectAll").attr("checked", false);
			$(".selectAll").attr("src", "img/checkbox_blank.png");
		} else {
			$(".selectAll").attr("checked", false);
			$(".selectAll").attr("src", "img/checkbox_half.png");
		}
	},
	// Handle edit clicks
	".editFinding click" : function(el,ev) {
		ev.preventDefault();
		var find = el.closest('.finding').model();
		this.options.onEdit(find);
	},
	// Handle state change click by updating the finding in question via the
	// model
	".changeState click" : function(el,ev) {
		var newState = $(el).attr("value");
		var finding = el.closest('.finding').model();
		finding.attr("status",newState);
		finding.attr("workspaceId",this.options.workspace);
		finding.attr("overwrite",1);
		finding.save();
	},
	// Handle more/less link clicks
	".more click" : function(el,ev) {
		ev.preventDefault();
		if ( el.text() == "More" ) {
			el.children("a").text("Less");
			el.parent().children(".reduced").hide();
			el.parent().children(".full").show();
		} else {
			el.children("a").text("More");
			el.parent().children(".reduced").show();
			el.parent().children(".full").hide();
		}
	},
	// Hanlde create events
	"{Seccubus.Models.Finding} created" : function(Finding, ev, finding) {
		alert("finding created:" + finding.id);
	},
	// Handle update events by redrawing the view
	"{Seccubus.Models.Finding} updated" : function(Finding, ev, finding) {
		if(find.status == this.options.status) {
			finding.elements(this.element).html(
				this.view('finding',finding)
			);
		} else {
			this.updateView();
		}
	},
	// Handle destroy events
	"{Seccubus.Models.Finding} destroyed" : function(Finding, ev, finding) {
		alert("table destroyed:" + finding.id);
	},
	/*
	 * Returns the specific sort function for an attribute
	 * This function can be passed to the sort function to sort arays of 
	 * objects and handle things like IP and hostname sorting
	 * @return {Function} Function that compares objects based on the 
	 * specified attribute and order
	 * @param {String} at
	 * Attribute to sort on
	 * @param {Boolean} rev
	 * Boolean that indicates if the results should be reversed
	 */
	sortFunc : function(at, rev) {
		var fn;
		if ( at == "host" ) {
			var lines = this.hostSort.toString().split('\n');
			lines[0] = "\n";
			lines[lines.length-2] = "";
			fn = lines.join('\n');
		} else {
			fn = "if (a.attr('" + at + "') < b.attr('" + at + "')) { return -1; } else if ( a.attr('" + at + "') == b.attr('" + at + "')) { return 0; } else { return 1; }";
		}
		if ( rev ) {
			fn = new Function("b","a",fn);
		} else {
			fn = new Function("a","b",fn);
		}
		return fn;
	},
	hostSort : function(a,b) {
		if ( typeof(a) == 'undefined' ) {
			return 1; // Undefined comes last
		} else if ( typeof(b) == 'undefined' ) {
			return -1; // Undefiend comes last
		} else {
			var isIP = new RegExp('^[12]?\\d?\\d\\.[12]?\\d?\\d\\.[12]?\\d?\\d\\.[12]?\\d?\\d$');
			if( a.host.match(isIP) ) {
				if( b.host.match(isIP) ) {
					/* IP compare */
					var ipa = a.host.split('.');
					ipa = (ipa[3] * 1) + (ipa[2] * 256) + (ipa[1] * 65536) + (ipa[0] * 16777216);
					var ipb = b.host.split('.');
					ipb = (ipb[3] * 1) + (ipb[2] * 256) + (ipb[1] * 65536) + (ipb[0] * 16777216);
					return ipa - ipb;
				} else {
					/* Hostnames sort before IPs */
					return -1;
				}
			} else {
				if( b.host.match(isIP) ) {
					/* IPs after hostnames */
					return 1;
				} else {
					/* Lexical sort */
					return( a.host >= b.host ) ;
				}
			}
		}
	},
	/*
	 * Update, overloaded to rerender the control after an update event
	 */
	update : function(options){
		this._super(options);
		this.updateView();
	}
}) // Controller

}); // Steal
