data_view_interface
===================

A simple JavaScript tool to make requesting, displaying, caching, and changing Backend data easier for web apps.

Broken into 3 parts:

1. Data (holds backend data--eventually I want this to use browser storage when the capability exists)

2. View (holds a function to update the UI using a Data object)
 
3. Interface (completely optional, but may connect a user input event to a command to change or update a Data object)

Data
====

Used to create the data holding objects:

	 Constructor:
	 
	 *   new Data(set_func, args)
	 
	     where "set_func" is the backend communication function, and "args"

	     are any necessary arguments for the set_func function.
	     
	     Note: "set_func" could be any function to set the data.
	     
	 Interface:
	 
	 * 	 Data.data = gives direct access to the data object or array
	 
	 *   Data.get(callback) = returns callback with stored data or data retreived from backend

	 *   Data.update(callback) = force updates data stored in object or array. Offers callback

	 *   Data.change(set_fun, args) = a method to change the Data object set function and arguments

	 *   Data.current = a property used to check status of data 'yes', 'no', 'pending'

	 *   Data.addView(name, updateView) = a method to attach function to update a view when data loads

	 *   Data.hasView(name) = checks if view is attached by name

	 *   Data.removeView(name) = removes an attached view by name

	 *   Data.clearViews = removes all attached views


View
====

Used to create objects to update UI

	 Constructor:

	 *   new View(name, update, Data)

	     where "name" is the name of the View, update is a function that updates the view,

	     and Data is an optional Data object to attach (see data.js)

	 Interface:

	 *   View.attach(Data) = attaches a Data Object to the View

	 *   View.detach() = detaches the currently attached Data object, if any

	     Note: there is no protection against attaching more than one Data object :(

	 *   View.load(data, callback) = runs the update function with the optional data argument,

	     or the updated Data object attached. "callback" called after view udpate function (optional)

	 *   View.reload(callback) = just like load, but no option to input data manually.

	  	 "callback" called after view udpate function (optional)



Interface
=========

Used to easily link Data updates to form inputs

	 Constructor:

	 *   new Interface(input, format_func, Data, init)

	     where "input" is a reference to the input element interface, and 

	     "format_func" is optional and may be used to process the raw value

	     of the input element.

	 Interface:

	 *   Interface.attach(Data, format_func) = attaches a Data object to change in the

	     event of this.input value change. format_func may modify input value.

	 *   Interface.detach(Data) = detaches the Data object.


Usage/Examples
==============

var currentMerchantData = new DVI.data(mp.getmerch, [5]);

// where "5" is the merchant_id and mp.getmerch is the AJAX function to get merchant data found in moola.js

var merchantNameView = new DVI.view('merchantName', function(data) {

	$('#merchant-name').html(data.name);
	
}, currentMerchantData);

var merchantSelect = new DVI.interface( $('select#set-merchant'), currentMerchantData);

// Now, selecting a new merchant in the select field with an ID of 'set-merchant' will cause the Data object to reload with the new value for the merchant_id and update the view showing the merchant name.
