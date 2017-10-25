/*
Populate a cloned DIV
args: DIV ID to clone
guid (some sort of identifier to identify a common grouping
files  array of fields to manipulate

Screen values needed:
<div id="view_firstName_aabbccdd">Justin</div>

Cloneable DIV needs
<div id="myBlock">
<input id="edit_firstName">
</div>

JS calls
populateForm('myBlock','aabbccdd',[firstName]);

*/

function populateForm(elementIDtoClone, guid, fields) {

  // Clone the element
  domElement = $('#' + elementIDtoClone).clone();
  
  // Append the guid to (cloned) domElement
  domElement.attr('id',domElement.attr('id') + '_' + guid);

  // Prepare the field names in the cloned row
  // Strip off the MSTR prefix
  // Append the guid to any NAMEs or IDs fields
  $(':input, div',domElement).each(function(i){

    //  name="MSTR_myField" -> name="myfield_ab839awa"
    if ( $(this).attr('name') != undefined && $(this).attr('name').length > 0) {
      t = $(this).attr('name').replace('MSTR_','') + '_' + guid;
      $(this).attr('name',t);
    }
    
    //  id="MSTR_myField" -> id="myfield_ab839awa"
    if (  $(this).attr('id') != undefined && $(this).attr('id').length > 0) {
      t = $(this).attr('id').replace('MSTR_','') + '_' + guid;
      $(this).attr('id',t);
    }
  });
  

  // Populate the cloned row by copying the values from the "view" elements
  //  The "view" elements can be a value stored on the screen, hidden INPUT field, or hidden DIV
  //  example:  <input type="hidden" id="view_firstName_84ab31a" value="Justin" />
  //            will get copied into the edit field of <input type="text" id="edit_firstName_84ab31a" value="" />
  //
  for (i in fields) {

    vTmp = $('#view_' + fields[i] + '_' + guid);
    eTmp = $(':input[name=edit_' + fields[i] + '_' + guid + ']',domElement);

    // VIEW VALUE Get the view value based on the container it is stored in
    viewVal = vTmp.prop('tagName') == 'INPUT' ? vTmp.val() : vTmp.text();

    // SET EDIT VALUE - Set the value based on the destination container
    editFieldInputType = eTmp.attr('type');

    if (editFieldInputType == 'checkbox' && viewVal == 1) {

      // Checkbox type
      eTmp.prop('checked', true);
    } else if (editFieldInputType == 'radio') {

      // Radio type
      eTmp.each(function(i) {

	if ($(this).val() == viewVal) {
	  $(this).prop('checked', true);
        }
      });
    } else {

      // select-one, text, textarea, hidden
      eTmp.val(viewVal);
    }
  }

  // Turn on the cloned row
  domElement.show();
  return domElement;
}



/*
This is a higher level means of passing data from a form to the server and handling the response.
It is intended for web forms/objects that have a "view mode", then an "edit mode" layer.  Any form errors are set and callbacks called accordingly

it calls the low level sendKeyValuePairs() method.

There are three components to a form:
view_  : The "view layer", this is text on the screen or a value that reflects the current value of the object
edit_  : The "edit layer", this is a form field that can be changed
error_ : The "error layer", this is set accordingly based on the response


It takes any field with an edit_(field) prefix, sends the ones that changed from their view_(field), then based on the response
if will set the error_(field) div


*/


function sendFields(cfg_postUrl,ukey,fields,destHandler,callbackFN,forceSend) {

  ukeyStr = '_' + ukey;

  // Determine what fields on the form changed
  deltaFields = new Object;

  sendFlag = 0;

  // Send an "errorcheck" test value
  //  to trigger a response (if it looks for "errorcheck")
  //  and to send back any errors or fields that need to be rewritten
  // used primarily when one editing block of a page depends on the
  // results of another
  if (typeof forceSend != 'undefined') {
    if (forceSend == 1) {
      deltaFields['ERRORCHECK'] = 1;
      sendFlag = 1;
    }
  }

  for (i in fields) {

    vTmp = $('#view_' + fields[i] + ukeyStr);
    eTmp = $(':input[name=edit_' + fields[i] + ukeyStr + ']');

    // VIEW VALUE Get the view value based on the container it is stored in
    viewVal = vTmp.prop('tagName') == 'INPUT' ? vTmp.val() : vTmp.text();

    // Test to see if the field changed (viewVal != editVal)
    // Test based on field type
    if (eTmp.attr('type') == 'radio') {

      // TYPE: Radio button
      // Get the selected value and compare
      eTmp.each(function() {
	if ($(this).prop('checked') == true) {
	  if ($(this).val() != viewVal) {
	    deltaFields[fields[i]] = $(this).val();
	    sendFlag = 1;
          }
        }
      });
    } else if (eTmp.attr('type') == 'checkbox'
	       && (eTmp.prop('checked') != viewVal)) {

      // TYPE: Checkbox
      deltaFields[fields[i]] = (eTmp.prop('checked') == true ? 1 : 0);
      sendFlag = 1;

    } else if (eTmp.val() != viewVal) {

      // TYPE: Text/textarea
      // Strip any html
      var str = eTmp.val();
      if (typeof str != 'undefined' && str.length > 0) {
	str = str.replace(/<(?:.|\n)*?>/gm, '');
      }
      deltaFields[fields[i]] = str;
      sendFlag = 1;
    }
  }


  // SEND DATA TO SERVER
  // Post the fields that changed
  // note: we have to test a flag since js has no easy way to count the members in an object)
  if (sendFlag == 0) {
    callbackFN(ukey); // Cancel if nothing changed
    return true;
  }
  
  sendVars = {};
  for (i in deltaFields) {
    sendVars[i + ukeyStr] = deltaFields[i];
  }

  sendKeyValuePairs(cfg_postUrl,sendVars,destHandler,
		    function (sendData,retData) {

    // Success handler
    if (retData.responseStatus == 1) {

      // Rewrite the original field value if we received a rewrite/new value for it
      //  (for case correction, abbreviation expansion, etc)
      for (i in fields) {

	// Attempt to set the field (done as a workaround since retData.. might not be defined)
	try {
	  if (typeof retData['rewriteFields'][ukey][fields[i]] != 'undefined') {
	    deltaFields[fields[i]] = retData['rewriteFields'][ukey][fields[i]];
	  }
	} catch (e){ }
      } 

      // Cycle though the fields we sent and update each field within view layer
      for (i in deltaFields) {

	// Set the view value based on any changes
	vTmp = $('#view_' + i + ukeyStr);
	vTmp.prop('tagName') == 'INPUT' ? vTmp.val(deltaFields[i]) : vTmp.text(deltaFields[i]);
      }

      // Set any status message fields (if any)
      // Cycle though the fields we sent and set the status messages
      try {
	for (i in retData['messageFields'][ukey]) {
	  try {
	    if (typeof retData['messageFields'][ukey][i] != 'undefined') {
	      $('#msg_'+ i + ukeyStr).html(retData['messageFields'][ukey][i]);
	    }
	  } catch (e) {}
	}
      } catch(e) {}
      


      // Call the extra callback function if it was set
      if (typeof callbackFN == 'function') {
	callbackFN(ukey);
      }
    } else {


      // Set any error message fields that were returned
      try {
	// First clear any existing error fields in case some were corrected
	$('#editWindow_'+ ukey +' [id^="error_"]').text('');

	for (i in retData['errorFields'][ukey]) {
	  try {
	    if (typeof retData['errorFields'][ukey][i] != 'undefined') {
	      $('#error_'+ i + ukeyStr).text(retData['errorFields'][ukey][i]);
	    }
	  } catch (e) {}
	}
      } catch(e) {}
    }
  });
  return true;
}

// For cancel actions
function restoreEditFields(ukey,fields) {

  ukeyStr = '_' + ukey;

  for (i in fields) {
    vTmp = $('#view_' + fields[i] + ukeyStr);
    eTmp = $(':input[name=edit_' + fields[i] + ukeyStr + ']');


    // VIEW VALUE Get the view value based on the container it is stored in
    viewVal = vTmp.prop('tagName') == 'INPUT' ? vTmp.val() : vTmp.text();

    // Test based on field type
    if (eTmp.attr('type') == 'radio') {

      // Radio button
      eTmp.each(function() {
	if ($(this).prop('checked') == true) {
	  if ($(this).val() == viewVal) {
	    $(this).prop('checked',true);
	    return false;
          }
        }
      });
    } else if (eTmp.attr('type') == 'checkbox') {
      tmp = viewVal == '1' ? true : false;
      eTmp.prop('checked', tmp);
    } else { 
      eTmp.val(viewVal);
    }
  }
}


/*

Low level send-receive layer
Simply posts to a url with variables and a specified destination handler string.
The callbackFN is called once the response is received.

This also handles any low-level communication errors such as an invalid server response
or the user not being properly logged in.

*/


function sendKeyValuePairs(cfg_postUrl,sendVars,destHandler,callbackFN) {

  sendVars['destHandler'] = destHandler;
  sendVars['ajSave'] = 1;

  $.ajax({
    type: 'POST',
    url: cfg_postUrl,
    data: sendVars,
    dataType: 'json',
    success: function(returnData) {

      if (returnData == null) {

	// No response received
	alert("Data communication error (no response)!");

	// Numeric respose code received: User is not logged in
      } else if (returnData.responseStatus == -2) {
	
	// Login error
	alert("Could not complete operation, please login!");

	// Numeric respose code received: Success/fail/etc response code received
      } else if ((parseFloat(returnData.responseStatus) == parseInt(returnData.responseStatus))
		 && !isNaN(returnData.responseStatus)) {

	// Call the extra callback function if it was set
	if (typeof callbackFN == 'function') {
	  callbackFN(sendVars,returnData);
	}
      }  else {

	// ERROR: Unspecified error
	alert("Unspecified error");

      }
    },
    error: function(e) {

      // Invalid response, handler/communication error
      //	    alert("Data communication error!");
    }
  });
  return false;
}


