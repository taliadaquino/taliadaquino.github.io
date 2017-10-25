// Main clock navigation
var mainClockNav = (function() {

  // Private Vars
  var navClickDownFlag = 0,
  navVideoActiveFlag = 0,
  currentNavPos = 0,
  intervalRotateNav,
  currentOffsetBase = {},
  menuIsMovingFlag = 0,
  currentTimeQueue = [],
  
  navHeightMin = '70px';
  navHeightMax = '170px';


  /* note, use the hardwired values in sprite.class.php since the visible/detected value might be smaller */
  videoFrameWidth = 101,
  videoFrameCount = 9,
  hardwire =  { filmstripX_0: 79,
		filmstripX_1: 0
		};

  // PRIVATE METHODS
  showNav = function(e) {
    menuIsMovingFlag = 1;
    menuIsOnFlag = 1;

    $('#clockNavMaxC').animate({top:'0px'},500,function() {
      $('#clockNavMinC').fadeOut(100,function() {
	menuIsMovingFlag = 0;
      });
    });

    $('#clockNavC').animate({height: navHeightMax},500,function() {  });

  },



  hideNav = function(e) {
    menuIsMovingFlag = 1;
    menuIsOnFlag = 0;
    $('#clockNavMinC').fadeIn(50,function() {
      $('#clockNavMaxC').animate({top:'-175px'},500,function() {
	menuIsMovingFlag = 0;
      });

      $('#clockNavC').animate({height:navHeightMin},500,function() {  });

      
    });
  },


  startVideoNavIcon = function(e) {

    // Do not start if we are running already
    // (note: we cannot test the interval variable to see if it is running, thus this flag instead)
    if (navVideoActiveFlag == 1) { return; }

    advanceVideoNavIcon([201,702,603,500,404,350,305,206,205,201,150]);
    navVideoActiveFlag = 1;
  },

  stopVideoNavIcon = function(e) {
    if (navVideoActiveFlag == 0) { return; }

    advanceVideoNavIcon([200,407,608,1010,0]);
    navVideoActiveFlag = 0;
  },


  advanceVideoNavIcon = function(timeDelayArr) {

    // New Queue passed in
    if (typeof timeDelayArr != 'undefined' && timeDelayArr.length > 0) {
      currentTimeQueue = timeDelayArr;
    }

    // Reposition the frame images
    updateVideoNavSprite();

    currentNavPos++;
    if (currentNavPos >= videoFrameCount) { currentNavPos = 0; }

    // Set the delay to the next iteration    
    if (currentTimeQueue[0] > 0 ) {
      intervalRotateNav = setTimeout(advanceVideoNavIcon,currentTimeQueue[0]);
      
      // Skip if this is the last queue item and it is non zero
      //  we will be stuck using the same timeout value until the queue is modified
      if (currentTimeQueue.length == 1 && currentTimeQueue[0] > 0) { return; }

      // Shift the first item off the front of the queue to the next value
      currentTimeQueue.shift();
    }  else {
      clearInterval(intervalRotateNav);
    }
  },


  // Update the sprite position based on the current global variables
  updateVideoNavSprite = function() {
    $('#videoCenter').css('background-position','-' +((currentNavPos * videoFrameWidth) +currentOffsetBase['video'] )+ 'px 0px'); 
    $('#videoLeft').css('background-position','-' +(((Math.floor(videoFrameWidth * .5)+(currentNavPos * videoFrameWidth))) +currentOffsetBase['video']) + 'px 0px');
    $('#videoRight').css('background-position','-' +(((currentNavPos * videoFrameWidth)) +currentOffsetBase['video'])+ 'px 0px');
    $('#film').css('backgroundPosition','-' +((currentNavPos * 36))+ 'px -'+currentOffsetBase['filmstrip']+'px');
  },


  swapNav = function(nav,i) {
    var fields = ['video','oldschool','montage','analog'];
    if (i >= fields.length) { return; }
    
    var t = fields[i];
    var tmp = $('#btnNav_' + t + ' .inlayImg');
    
    // Set the background image
    tmp.css('background-image',"url('" + cfg_photoSrc + '/' + nav['basePath'] + "')");
    
    // Set the offsets for later reference
    var p = tmp.closest('.navIconC');
    p.data('guid',nav['map'][t]['guid']);
    p.data('pos_0', nav['map'][t]['img_0']['x']);
    p.data('pos_1', nav['map'][t]['img_1']['x']);
    
    // Default to the X offset base of the off state
    currentOffsetBase[t] = parseInt(nav['map'][t]['img_0']['x']);
    
    // Apply the offsets to the off state
    tmp.css('background-position','-' + p.data('pos_0') + 'px 0px');

    // Set the filmstrip to the "off" state and update its position
    if (t == 'video') {
      currentOffsetBase['filmstrip'] = hardwire['filmstripX_0'];
      $('#film').css('background-color','#4d4d4d');
      updateVideoNavSprite();
    }
    
    if (typeof clockType != 'undefined' && t == clockType) {
      $('#btnNav_' + t + ' .navIconSpriteItem').addClass('navCurrent');
    }
    i++;
    setTimeout(
      (function(nav,i) {
	return function() {
	  swapNav(nav,i);
	};
      }(nav,i)),400);
  };


  // PUBLIC METHODS
  return {

    // Callback for applying a new navigation set
    applyNewItems: function(qElement) {

	    // Skip if this epoch is already shown
	    if ($('#clockNavC').data('cEpoch') == qElement['startEpoch']) {
		    return;
	    }
	    
	    // Set the new navigation images
	    var nav = qElement['navData'];
	    swapNav(nav,0);
	    
	    // Mark this epoch as being shown
	    $('#clockNavC').data('cEpoch',qElement['startEpoch']);
    },
    
    // Initialize clock navigation
    init: function() {

      if (menuIsOnFlag == 0) {
      	$('#clockNavC').css({height:navHeightMin});
      }

      // Setup the clock selection navigation
      $('.navIconC').on('mouseover',function() {
	
	$(this).addClass('navOver');
	
	// The video icon has a mouseover sprite change
	if ($(this).attr('id') == 'btnNav_video') {
	  $('#film').css('background-color','#7c1b06');
	  
	  currentOffsetBase['filmstrip'] = hardwire['filmstripX_1'];
	  
	  // Apply the offsets to the off state
	  currentOffsetBase['video'] = parseInt($(this).data('pos_1'));
	  
	  startVideoNavIcon();
	  
	} else {
	  // Apply the offsets to the on state
	  $(this).find('.inlayImg').css('background-position','-' + $(this).data('pos_1') +'px 0px');
	}
      });
      

      $('.navIconC').on('click touchstart',function() {
	$(this).addClass('navClick');
	$('#loadContainer').css('opacity', .5);

	// Indicate a click so we can stop the mouseout state
	// while the page is reloading
	navClickDownFlag = 1;

	var mode = $(this).attr('id').split('_')[1];
	window.location = '/setit.php?mode=' + mode +'&passGUID=' + $(this).data('guid');
      });

      $('.navIconC').on('mouseleave',function() {

	// If a click is active do not do the image swap, etc
	if (navClickDownFlag == 1) { return; }

	$(this).removeClass('navOver');


	if ($(this).attr('id') == 'btnNav_video') {

	  // move the film to the grey
	  $('#film').css('background-color','#4d4d4d');
	  currentOffsetBase['filmstrip'] = hardwire['filmstripX_0'];

	  // Apply the offsets to the off state
	  currentOffsetBase['video'] = parseInt($(this).data('pos_0'));

	  // Stop the film advance
	  stopVideoNavIcon();

	} else {

	  // Apply the offsets to the off state
	  $(this).find('.inlayImg').css('background-position','-' + $(this).data('pos_0') + 'px 0px');
	}
      });
    },

    testForNavDisplay: function (e) { 
      if (menuIsMovingFlag != 0) { return; }

      var off = $('#clockNavC').offset();
      var tmp = $('#clockNavMaxC').width();
      
      var detectPadding = 50;
      // Menu is off
      // In bounds and menu is off, turn it on
      if ( 
	menuIsOnFlag == 0 &&
	(
	(e.pageX > off.left && e.pageY > off.top) // top left bound
	&& ((e.pageX < $('#clockNavMinC').width() + off.left + detectPadding)
	    && (e.pageY < ($('#clockNavMinC').height() + off.top + detectPadding)))) // bottom right bound
      ) {
	  showNav();
	}

      if ( 
	menuIsOnFlag == 1 &&
	(
	  (e.pageX > off.left && e.pageY > off.top) // top left bound
	  && ((e.pageX > $('#clockNavMaxC').width() + off.left + detectPadding )
	      || (e.pageY > ($('#clockNavMaxC').height() + off.top + detectPadding)))) // bottom right bound
    ) {
	// Out of bounds and menu is still on, turn it off
	hideNav();
      }
    }
  }
})();


// Fullscreen util
var fsUtil = (function() {

  // Private Vars
  var fsBtn = 0;

  // Private Methods
  fs_mouseMove = function() {
    if (!screenfull.isFullscreen) {return; }
    if (fsBtn == 1) { return; }
    
    fsBtn = 1;
    $('#fsBtnFullClose').fadeIn(300);
    setTimeout(function () {
      $('#fsBtnFullClose').fadeOut(300,function() {
	fsBtn = 0;
      });
    },5000);
  }

  // PUBLIC METHODS
  return {
    setupFullscreen: function () {

      // Do not enable for touchscreen
      if (Modernizr.touch) { 
	return;
      }

      if (!isPaid) {
	
	// Redirect to upgrade page if fullscreen clicked
	$('#btnGoFullscreen').on('click',function(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  window.location.replace(cfg_siteFiles + '/upgrade.php');
	});
	
      } else {

	// Setup a listener to detect when the screen mode changes and take the appropriate action
	// it must be done this way otherwise if the user presses "escape" to exit, our cleanup routines
	// won't get called
	document.addEventListener(screenfull.raw.fullscreenchange, function () {
	  
	  // User entered fullscreen mode
	  if (screenfull.isFullscreen) {

	    // CSS Hack to remove the scrollbars in fullscreen safari
	    $('body').addClass('hide-scrollbars');

	    // Show the information overlay and buttons
	    $('#fs_logo').show();
	    
	    fs_mouseMove();

	    $('#clockPageC').on('mousemove',fs_mouseMove);


	    cb_fullScreenSetup();

	  } else {
	    
	    // User left fullscreen mode
	    $('#fsOverlay').hide();
	    
	    $('#clockPageC').unbind('mousemove');

	    // CSS Hack to remove the scrollbars in fullscreen safari
	    $('body').removeClass('hide-scrollbars');
	    
	    // Hide the information overlay and buttons
	    $('#fs_logo').hide();
	    $('#fsBtnFullClose').fadeOut(400);

	    cb_regularScreenSetup();

	  }
	});

	// Cancel fullscreen mode button
	$('#fsBtnFullClose').on('click',function(e) {
	  e.stopPropagation();

	  // Request the fullscreen
	  screenfull.exit();
	  
	});


	// Activate fullscreen mode if fullscreen clicked
	$('#btnGoFullscreen').on('click',function(e) {
	  e.stopPropagation();

	  // If we are in fullscreen already, then exit instead
	  if (screenfull.isFullscreen) {
	    screenfull.exit();
	  } else {
	    
	    // Request the fullscreen
	    screenfull.request($('#clockPageC')[0]);
	  }

	});
      }

    }
  }
})();



var clockUtil = (function() {


  // Set a var for keeping track of the popup window
  //  so we can give it focus if needed
  var clockWindow;
  var menuBarIsOpen = 0;
  var menuBarMovingFlag = 0;


  // Public Methods
  return {
    applyDood: function (qElement) {

      // Set the new navigation images
      var dood = qElement['doodData'];
      $('#doodz').html('<pre>' + dood + '</pre>');
      
    },

    setTitleTime: function (current) {
      
      // Update the page title
      document.title =  document.title.split(':')[0] + ': ' + current['hour'] + ':' + current['minute'] + current['suffix'];
      
    },


    setLocationFields: function(locationData) {

      // City + State
      var sfx = '';
      if (locationData.city != '') {
	$('.locationCity').html(locationData.city).show();
	sfx = ', ';
	if (locationData.stateFull.length > 0) {
	  $('.locationState').html(locationData.stateFull).show();
	} else {
	  $('.locationState').hide();
	}
      } else {

	// State (in place of city)
	// If the state is present but city is missing
	// swap in the state for the city
	if (locationData.stateFull != '') {
	  $('.locationCity').html(locationData.stateFull).show();
	  $('.locationState').hide();
	  sfx = ', ';
	} else {
	  $('.locationCity').hide();
	  $('.locationState').hide();
	}
      }

      // Country always shown
      $('.locationCountry').html(sfx + locationData.country);
    },

    showControlBar: function (autoCloseFlag) {

      // Do not enable for touch devices
      if (Modernizr.touch) { 
	return;
      }

      if (menuBarIsOpen == 1 || menuBarMovingFlag != 0) { return; }
      menuBarMovingFlag = 1;		
      
      // Move the text area and control bar up
      $('#infoBarC').animate({'bottom': 0 + 'px'});
      
      $('#clockControls').data('autoCloseFlag',autoCloseFlag).animate({'bottom':'0px'},200,
								      function () {
	menuBarIsOpen = 1;
	menuBarMovingFlag = 0;
	

	if ($(this).data('autoCloseFlag') == 1) {
	  setTimeout(function() {
	    clockUtil.hideControlBar();
	  }, 5000);
	} else {
	  console.info("no auto");						
	}
      }
								      );
    },

    hideControlBar: function() {

      if (menuBarIsOpen == 0 || menuBarMovingFlag != 0) { return; }
      menuBarMovingFlag = 1;		


      $('#infoBarC').animate({'bottom':'-'+$('#infoBarC').outerHeight() + 'px'},200);
      $('#clockControls').animate({'bottom':'-'+$('#clockControls').height()+'px'},200,
				  function () {
	menuBarMovingFlag = 0;
	menuBarIsOpen = 0;

      });


    },

    setControlCredits: function (htmlText) {
      $('#infoBarC').css('height','auto');
      $('.infoBar').html(htmlText);
      if (Modernizr.touch) { 
	$('#touchCreditsC').fadeTo(300,1);
      } else {
	clockUtil.setInfoContainerHeight();
      }
      
    },

    setInfoContainerHeight: function () {

      // Set the new height, adjust it by the control bar height
      $('#infoBarC').css('height','+=' + $('#clockControls').height());
      $('#infoBarC').css('bottom','-'+$('#infoBarC').outerHeight() + 'px').show();
      $('#clockControls').css('bottom','-'+$('#clockControls').height()+'px').show();

    },

    setupTouchControlBar: function () {
      if (Modernizr.touch) { 
	var x = $('<div id="touchCreditsC"><div id="touch_recordedC"></div><div id="touch_audioC"></div>');
	x.insertBefore('#captionC');
	
	$('#touch_recordedC').append($('#recordedC'));
	$('#touch_audioC').append($('#audioTextC'));
      }
    },

    isPaid: function() {
      return typeof $('meta[http-equiv="refresh"]').attr('content') != 'undefined' ? 0 : 1;
    },


    readCookie: function (cookieName) {
      if (cookieName == '') {
	return '';
      }
      
      var tmpCookie = '' + document.cookie;
      var i = tmpCookie.indexOf(cookieName);
      if (i == -1 ) {
	return '' ;
      }
      
      var index = tmpCookie.indexOf(';',i);
      if (index == -1) {
	index = tmpCookie.length;
      }
      
      return unescape(tmpCookie.substring(i + cookieName.length + 1,index));
    },

    setupPopout: function(element) {
      $(element).click(function(event) {
	event.stopPropagation();
	
	var clockWindowMode = $(this).attr('id').split('_')[1];
	
	// Bring window into focus if it exists already
	if (typeof clockWindow != 'undefined' && !clockWindow.closed) {
	  clockWindow.focus()
	} else {
	  // Create a new window
	  clockWindow = window.open('/index.php?clockWindowMode=' + clockWindowMode
				    , 'clockWindow_' + clockWindowMode
				    , 'width=265,height=300,top=100,left=100,directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=no');
	}
      });
    },
    setCookiePass: function(cookieValue,expireFlag) {
      document.cookie = 'passGUID=' + escape(cookieValue)+ ';path=/ ;'+ (expireFlag == true ? ';expires=Thu, 01 Jan 1970 00:00:00 GMT' : '');
    }
  }
})();
