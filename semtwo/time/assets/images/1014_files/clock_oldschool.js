var initialSpritePad = 0;
var currentSelectedIndex;
var cfg_spritePageItems = 34;
var spriteFadeList = [];
var originalSpriteCHeight;
var currentImageCount;
var clickActiveFlag = 0;

$(document).ready(function() {

  originalSpriteCHeight = $('#spriteArea_container').height();

  // Reposition the sprites footer text and set event for window change
  repositionElements();
  $(window).on('resize',repositionElements);
});

// Move the page elements around as necessary if the window changes size
function repositionElements() {

  // Size the sprite padding area to the clock area
  // adjust for the border thickness
  var clockFrameWidth = $('#clockFrameC').outerWidth();

  if (clockFrameWidth == null) { return; } // initial request and page content has not loaded yet

  var clockFrameHeight = $('#clockFrameC').outerHeight();

  // Restore the original height of the sprite container
  $('#spriteArea_container').height(originalSpriteCHeight);

  $('.spritePad').css({width: clockFrameWidth, height: (clockFrameHeight - 28) });

  // Set the sprite containers new width and height
  var newHeight = $('#spriteArea_container')[0].scrollHeight;
  var newSpriteWidth = ($('#clockPageC').width() - clockFrameWidth) + $('.spritePad').width();
  $('#spriteArea_container').css('width',newSpriteWidth).css('height',newHeight);


  $('#clockPageC').height(newHeight);
  var newOuterHeight = $('#clockPageC').height() +150;
  if (newOuterHeight < 800) { newOuterHeight = 800; }

  $('.layout_outerPad').height(newOuterHeight);
}



// Called by the page template
function startClock() {

  // Setup the control bar
  $('#clockImageC').on('mouseover',function(e) {
    clockUtil.showControlBar();
  });
  
  $('#clockImageC').on('mouseleave',function(e) {
    clockUtil.hideControlBar();
  });

  $('.btnPopout').attr('id','windowBtn_mdou');

  // Setup the control bar for touch
  clockUtil.setupTouchControlBar();

  // Setup the clock navigation
  mainClockNav.init();
  
  // If in free mode, init the clock so it will not refresh
  //  since the queue isn't running, we must manually dequeue the first time
  if (!isPaid) {
    initialSpritePad = 1;
    jsClock.init(0);

  } else {

    // Run the queue like normal
    jsClock.init(1);	
  }
  
  // Setup the popout buttons
  clockUtil.setupPopout('.btnPopout');


  // Setup the swipe
  $('#clockImageC').touchwipe({
    wipeDown: clickLeft,
    wipeUp: clickRight,
    wipeLeft: clickLeft,
    wipeRight: clickRight,
    preventDefaultEvents: true,
  });

  
  // Main clock image clicks advances the selector
  $('#clockImageC').on('click',function(e) {
    e.stopPropagation();
    clickRight();
  });


  // Sprite pager
  $('.btnNextPage').on('click',function() {
    lastSpritePage = currentSpritePage;
    ++currentSpritePage;
    if (currentSpritePage >= currentSpritePageCount) { currentSpritePage = 0; }

    $('.spritePage_' + lastSpritePage).hide();
    $('.spritePage_' + currentSpritePage).show();

    repositionElements();

  }).on('mouseover',function() {
    $(this).css('opacity',1);
  }).on('mouseout',function() {
    $(this).css('opacity',.5);
  });

  // Setup full screen
  fsUtil.setupFullscreen();


}

function clickLeft() {
  if (clickActiveFlag == 1) { return; }
  clickActiveFlag = 1;
  if (currentSelectedIndex - 1 >= 0) {
    $('.ind_' + (currentSelectedIndex -1)).click();
  } else {
    $('.ind_' + (currentImageCount -1)).click();
  }
}


function clickRight() {
  if (clickActiveFlag == 1) { return; }
  clickActiveFlag = 1;
  if (currentSelectedIndex + 1 < currentImageCount) {
    $('.ind_' + (currentSelectedIndex + 1)).click();
  } else {
    $('.ind_0').click();
  }
}



// Ran before clock is started/ ran on page load
function ch_preStartup() {

  // Push the embedded preloaded queue onto the stack
  // note: if the user isn't logged in this step is necessary
  //  since the jsClock won't make an api call on its own
  if (jsClockAutoQueue != null) {
    jsClock.addItemsToQueue(jsClockAutoQueue.data);
  }
}


function  ch_dequeuedCleanup(elements) { }

function ch_getCustomSendVars() {
  return  {
    'destHandler':'dh_photoData_oldschool'
  };
}

function cb_ch_dataFailure() { }


// Html to be added with each queue item
function cb_addLightContent(qElement) {

  // Add the sprite html
  var str = '';
  var pageText = '';
  var c = 0;
  for (i in qElement.item.imgData) {
    
    // Make a shorthand reference
    var img = qElement.item.imgData[i];

    str += '<div id="img_' + img.photoGUID + '" style="width: '+ img.spriteLayoutCoords.sp_tn.w + 'px; height:'+ img.spriteLayoutCoords.sp_tn.h + 'px; background-repeat: no-repeat; padding: 0px; background-position:-'+img.spriteLayoutCoords.sp_tn.offW+'px -'+img.spriteLayoutCoords.sp_tn.offH+'px;" class="spriteImage ind_'+ i +'" title="' + img.moLocation + '"></div>';

    var itemCount = qElement.item.imgData.length;

    if ( ( (itemCount != cfg_spritePageItems + 1) && 
	   (i > 0 && (parseInt(i) +1)  % cfg_spritePageItems == 0)) || parseInt(i) +1 >= itemCount) {
      // don't apply if there are enough items minus the button
      // If in unpaid mode, expanding the padding initially to avoid the sprite elements constantly moving
      //  around on the page load, this is fine if it does it just the first time in paid pode
      str = '<div class="spritePad ' + (!isPaid ? 'spritePadInitial' :'') + '"></div>' + str + '<div class="btnNextPage ns fa fa-arrow-circle-right"></div>';
      pageText += '<div class="spritePage spritePage_'+c+'" style="'+(c > 0 ? 'display: none' : '')+'"> ' + str + '</div>'; 
      str = '';
      c++;
    }
  }

  // note: the display: none needed for ie11 to disable the other click layers
  $('#spriteC').append('<div id="spriteLayer_' + qElement['startEpoch'] + '" style="opacity: 0; display: none;">' + pageText + '</div>');
  $('#spriteLayer_' + qElement['startEpoch']).data('plf',0).data('spritePageCount',c);

}


// "Heavy" (media/etc) Content to be loaded into the html
function cb_loadHeavyContent(minuteItem) {
  if ($('#spriteLayer_' + minuteItem['startEpoch']).data('plf') == 1) { console.info("already loaded"); return; } // already loaded

  // Preload the navigation sprite
  $('<img/>')[0].src = cfg_photoSrc + '/' + minuteItem['navData']['basePath'];

  // Load the sprite image
  $('#spriteLayer_' + minuteItem['startEpoch']+ ' .spriteImage').css('background-image',"url(" + cfg_photoSrc + '/' + minuteItem.item.spriteData.sp_tn.basePath + ")");
  $('#spriteLayer_' + minuteItem['startEpoch']).data('plf',1);

  var selectedIndex = minuteItem.item.selectedIndex;
  var imgInfo = minuteItem.item.imgData[selectedIndex];
  console.info("load heavy");
  addMainImage(minuteItem.startEpoch,imgInfo);
}

// Activate a new minute
var currentSpritePageCount = 0;
var currentSpritePage = 0;
var currentQelement;
var currentDisplayEpoch = 0;
var currentDisplayGUID = 0;
function ch_queueActivate(qElement) {

  // Exit if this id is already visible
  if (currentDisplayEpoch == qElement['startEpoch']) {
    return;
  }

  // If unpaid then the activator can only be triggered once
  if (currentDisplayEpoch != 0 && !isPaid) {
    return;
  }

  currentQelement = qElement;


  mainClockNav.applyNewItems(qElement);


  /////// Display a new minute //////
  current = jsClock.getCurrentTimeVars();
  clockUtil.setTitleTime(current);


  // Build the new sprite item content
  // and replace the existing one
  var str = '';
  var selectedIndex = qElement.item.selectedIndex;

  // Fade out the existing sprite container
  $('#spriteLayer_' + currentDisplayEpoch).fadeOut(100);





  // Apply the new sprite contents
  // note, the show() is needed for IE11 to disable the clicks on other layers
  $('#spriteLayer_' + qElement['startEpoch']).show().fadeTo(100,1, function() {
    
    currentSpritePageCount = $(this).data('spritePageCount');

    // Preload the main image if moused over
    $('#spriteLayer_' + qElement['startEpoch'] +' .spriteImage').on('mouseover',function(e) {
      e.preventDefault();
      
      // Parse out the index so we can load the new image
      selectedIndex = $(this).attr('class').match(/ind_(\d+)?/)[1];
      
      var imgInfo = currentQelement.item.imgData[selectedIndex];
      addMainImage(currentQelement.startEpoch,imgInfo);
    });

    // Setup the click handlers for the guids
    // note: set the CSS pointer here, otherwise the hidden layers will cause the cursor
    //   to change to the pointer even though they are not active or have click handlers.
    $('#spriteLayer_' + qElement['startEpoch'] +' .spriteImage').css('cursor','pointer').on('click touchstart',function(e) {
      e.preventDefault();
      
      guid = $(this).attr('id').replace('img_','');

      // Just exit if this image is on the screen already
      if (guid == currentDisplayGUID) { return; }

      
      if (!isPaid) {
	// FREE MODE: Refresh the page to show the clicked image
	
	// Write the guid to the session cookie and redirect
	// this avoids it having to travel on the url and possibly get bookmarked
	clockUtil.setCookiePass('c-'+guid);
	url = window.location.href.split('?');
	window.location.replace(cfg_siteFiles);
      } else {
	
	// PAID MODE: DYNAMICALLY REFRESH IN THE CLICKED IMAGE

	// Move the selector highlight
	// Remove it from the whole sprite set because on the ipad if you
	// swipe very fast the old ones all might not get shut off
	$('#spriteC').find('.spriteImage').removeClass('spriteSelected');
	
	// Parse out the index so we can load the new image
	selectedIndex = $(this).attr('class').match(/ind_(\d+)?/)[1];

	var imgInfo = currentQelement.item.imgData[selectedIndex];
	addMainImage(currentQelement.startEpoch,imgInfo);

	// Load in the new main image
	loadMainImage(selectedIndex);
      }	    
    });



    for (i = 0; i < currentSpritePageCount; i++) {

      var tmpPageItems = $('#spriteLayer_' + qElement['startEpoch']).find('.spritePage_' + i).find('.spriteImage');
      if (i != currentSpritePage) {
	tmpPageItems.css('opacity',1);
      } else {

	// Fade in the sprite images
	spriteFadeList = [];
	tmpPageItems.each(function() {
	  spriteFadeList.push($(this));
	});
	showSpriteImages();
      }
    }

    currentImageCount = qElement.item.imgData.length;
    
    // Turn the next sprite pager button on or off
    if ((currentImageCount - 1) / cfg_spritePageItems > 1 ) {
      $('.btnNextPage').show();
    } else {
      $('.btnNextPage').hide();
    }
  });
  
  // Swap in the new main clock image
  console.info("Activate layer");
  loadMainImage(selectedIndex);

  // Remove all the old guids
  $('.clockEpoch_' + currentDisplayEpoch).remove();

  // Update the div we are displaying
  currentDisplayEpoch = qElement['startEpoch'];
}

function showSpriteImages() {

  // Cycle through the global sprite list and fade in each image
  var item = spriteFadeList.pop();
  if (typeof item != 'undefined') {
    item.fadeTo(5,1,function() { showSpriteImages(); });
  }
}



function addMainImage(startEpoch,imgInfo) {

  // Load the main image into html if it is not here already
  if ($('#clockImage_' + imgInfo['photoGUID']).length > 0) { return; }
  
  // Set the image url inside the wrapper
  var mainImg = imgInfo.imgSizes.lg;
  var imgSrc = cfg_photoSrc + '/' + mainImg.basePath;

  $('#clockImageC').append('<div id="clockImage_' + imgInfo['photoGUID'] + '" style="opacity: 0; position: absolute; top: 0px; left: 0px; overflow: hidden; width: '+mainImg.w+'px;height:'+mainImg.h+'px" class="clockEpoch_' + startEpoch + '"><img class="mainImage" style="position: absolute: top: 0px; left: 0px; z-index: 102; " src="' + imgSrc + '" width="'+mainImg.w+'" height="'+mainImg.ch+'" /></div>');

  $('#clockImage_' + imgInfo['photoGUID'] + ' .mainImage').load(function() {
    $(this).parent().data('isLoad',1);
  });
}



function ch_tick() {
  jsClock.writeSecondsBar();
}

function changeImage(newGuid) {
  // Fade in the new image
  $('#clockImage_' + newGuid).fadeTo(100,1);
  
  // Hide the old image
  $('#clockImage_' + currentDisplayGUID).fadeTo(50,0);

  // Remove the initial sprite padding (see above where it is added)
  if (initialSpritePad == 1 && !isPaid) {    
    $('.spritePad').removeClass('spritePadInitial');
  }


  currentDisplayGUID = newGuid;
}

function loadMainImage(selectedIndex) {

  var imgInfo = currentQelement.item.imgData[selectedIndex]

  // Place the sprite highlight css onto the selected image
  $('#img_' + imgInfo.photoGUID).addClass('spriteSelected');

  // Display the correct page
  var newPageNumber = $('#img_' + imgInfo.photoGUID).parent().attr('class').match(/spritePage_(\d+)/)[1];
  if (newPageNumber != currentSpritePage) {
    $('.spritePage_' + currentSpritePage).hide();
    $('.spritePage_' + newPageNumber).show();
    currentSpritePage = newPageNumber;
  }

  // Keep the selected index around in case the user clicks the main image
  //  we will know what index it is at
  currentSelectedIndex = parseInt(selectedIndex);

  mainImg = imgInfo.imgSizes.lg;


  // Dim the old image
  $('#clockImage_' + currentDisplayGUID).fadeTo(50,.4);

  if (typeof $('#clockImage_' + imgInfo['photoGUID']).data('isLoad') == 'undefined') {
    $('#clockImage_' + imgInfo['photoGUID'] + ' .mainImage').load(function() {

      $(this).parent().data('isLoad',1);

      photoGUID = $(this).parent().attr('id').split('_')[1];
      changeImage(photoGUID);

      $('#clockImageC').animate({'width':mainImg.w + 'px',
				 'height':mainImg.h + 'px',
				 },100,function() {
	
	repositionElements();
	clickActiveFlag = 0;
	
      });

    });
  } else {

    changeImage(imgInfo['photoGUID']);
    $('#clockImageC').animate({'width':mainImg.w + 'px',
			       'height':mainImg.h + 'px',
			       },100,function() {
      
      repositionElements();
      clickActiveFlag = 0;
      
    });

  }


  // Set the location data
  var tmp = imgInfo.locationClean;
  clockUtil.setLocationFields(tmp);

  // Set the caption
  $('.captionText').html(imgInfo.captionText);

  clockUtil.setControlCredits(imgInfo.createDateStr + (imgInfo.username != '' ? ' by ' + imgInfo.username : ''));
}


function cb_fullScreenSetup() {

  $('#clockPageC').addClass('fullscreenSettings'); //.css('width',newWidth + 'px');
  $('#clockFrameC').addClass('fullscreenClockFrame');
  $('#spriteArea_container').addClass('fullscreenSpriteC');
  $('#fsWrapper').addClass('fullscreenWrapper');
  $('.spritePad').hide();
  repositionElements();
  
}

function cb_regularScreenSetup() {
  
  // Set the new height/width of necessary elements
  $('#clockPageC').removeClass('fullscreenSettings');
  $('#clockFrameC').removeClass('fullscreenClockFrame');
  $('#spriteArea_container').removeClass('fullscreenSpriteC');
  $('#fsWrapper').removeClass('fullscreenWrapper');

  $('.spritePad').show();
  repositionElements();
}
