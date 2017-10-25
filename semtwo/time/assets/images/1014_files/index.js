// Block frame hijack //
if (window!=top){
  top.location.href=location.href;
}

var isPaid = clockUtil.isPaid();

$(document).ready(function() {

  // Main clock page content is already on page, just start the clock
  if (typeof loadFlag == 'undefined') {
    startClock();
  } else {
    // Clock content is not on the page, load it in first

    // Get the date and time from the user
    //  We can't just send the epoch because that is in UTC and not the user's timezone
    //  Sending the offset hasn't been reliable in years past
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();

    // Fetch the content
    var requestObj = $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/index.php?l=' + dateStr,
    });

    // Content received
    requestObj.done(function(contentObj) {

      // Set the html
      $('#loadContainer').html(contentObj['html']);

      // Set the queue vars
      jsClockAutoQueue = contentObj['rd'];

      // Start clock
      startClock();	    
    });
  }

  $('.btn_socialNewsClose').on('click',function() {
    var mrnEpoch = $(this).attr('id').split('_')[1];
    $(this).closest('#clockMain_nav_news').fadeOut(200,function() {

      // Send the notification
      var requestObj = $.ajax({
	type: 'GET',
	dataType: 'json',
	url: '/setit.php?mrn=' + mrnEpoch
      });
      
      $(this).remove();
    });
  });
  
  // Main navigation close button
  $('#btn_mainNavClose').on('click',function() {

    // Send the notification
    var requestObj = $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/setit.php?hideNav=1'
    });
    
    // Remove the close button
    $(this).hide();

    // Hide the main navigation
    hideNav();

    // Activate the mouse detection so the menu can be renabled on mouseover
    $(window).on('mousemove',mainClockNav.testForNavDisplay);
  });


  // Button: User Settings
  $('.btnSettings').on('click',function(e) {
    e.stopPropagation();
    window.location.replace(cfg_siteFiles + '/user/updateprefs.php');
  });

  // Main Navigation has been hidden by the user previously
  if (menuIsOnFlag == 0) {

    // Hide the close button
    $('#btn_mainNavClose').hide();

    // Activate the mouse detection so the menu can be renabled upon mouseover
    $(window).on('mousemove',mainClockNav.testForNavDisplay);
  }

  // Touchpad cannot close the main nav menu
  if (Modernizr.touch) { 
    $('#btn_mainNavClose').hide();
  }
});


// Callback for when the user gets logged out while in paid mode
function cb_switchToLoggedOut() {

  // Switch out of fullscreen if needed
  if (typeof screenfull.isFullscreen != 'undefined'
      && screenfull.isFullscreen) {
    screenfull.exit();
  }
  window.location = '/';  
}
