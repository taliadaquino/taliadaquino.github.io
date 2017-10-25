/*
api needs to define:

// Ran before clock is started/ ran on page load
ch_preStartup();

// Cleanup
ch_dequeuedCleanup(elements);

// Happens on every second tick
ch_tick() 

// Merge in any custom variables that need
//  to go out with the ajax data request
// (generally the api handler name)
ch_getCustomSendVars()

cb_ch_dataFailure();

// Activate a new minute
ch_queueActivate(tmp);


*/



var jsClock = (function() {
  var cfg_minSecondsAhead = 20, // Minimum amount ahead until queue can be repopulated
  cfg_maxSecondsAhead = 300, // Maximum amount of seconds ahead to populate the queue
  cfg_fetchDelaySec = 20, // How long to wait inbetween data requests (in case of failure, etc)
  gbl_lastFetchAttemptEpoch = 0, // The last time we attempted to fetch api data
  secondsSinceLoad = 0, // Counter of how many seconds the clock has been active without a page refresh
  gbl_lastActivateEpoch = 0,
  requestCount = 0,  // Counter of requests to api
  stopClockFlag = 0, // Flag to stop the clock second interval timer
  gbl_requestActive = 0, // Indicator to indicate an api data request is active
  queue = [],  // The queue
  gbl_maxPreloadEpoch = 0, // The highest epoch of the preloaded items
  gbl_epochCorrection = 0,  // The seconds correction factor between the user's time and the system time
  initialTime = new Date().getTime(); // Initial time of page load on user's computer, used to calculate the global drift as to time the second intervals correctly



  clockTick = function() {

    // If in free mode, do not bother loading the queue
    //  since the data is going to get refreshed on the page reload
    if (gbl_lastFetchAttemptEpoch != -1) {

      // Load the queue if needed
      loadQueue();
    }

    // Dequeue and perform any actions if needed
    var elements = dequeue();
    
    // Do any cleanup on dequeued items
    if (elements.length > 0 ){
      if (typeof ch_dequeuedCleanup != 'undefined') {
	ch_dequeuedCleanup(elements);
      }
    }
    
    
    // Call any instructions that need to fire
    // upon a ticking of the clock
    if (typeof ch_tick != 'undefined') {
      ch_tick();
    }
    
    var now = new Date(),
    restartSecs,
    currentEpochMilli = now.getTime();
    
    //    console.info('aCurrentTime: '+(currentEpochMilli ) + '  initialTime'+ initialTime +'  current-initial:' + (currentEpochMilli - initialTime) + '  off: ' + ((currentEpochMilli - initialTime) - (secondsSinceLoad * 1000)) + '  secs since: ' + secondsSinceLoad );
    
    
    // if setInterval(functionname,1000) is used, it won't truly fire every second and cause the clock to be off
    //  we need to use setTimeout() instead and continuosly calculate whether we are running fast or slow
    //  from where we should be
    //
    // Keep track of how many cycles (seconds, but represented in milliseconds) we have done since we started
    //  This represents how many true seconds have occured
    //  
    //  currentEpochMilli will drift since it isn't accurate, subtract the true seconds from it
    //   to get how many +/- milliseconds the next cycle should occur
    //
    if (secondsSinceLoad == 0) {

      // The first time through just wait a full second
      restartSecs = 1000;
    } else {
      restartSecs = 1000 + (1000 - ((currentEpochMilli - initialTime) - (secondsSinceLoad * 1000)));
      
      // If our clock is more than 20 seconds behind just reload (such as computer waking up from sleep)
      //  Hence a great distance that cannot be made up, just reload
      if (restartSecs < -20000) {
	location.reload(true);	    return;
      }
      
      
      // Set error boundraries in case the clock is very far off
      if (restartSecs < 300) { restartSecs = 0; }
      if (restartSecs > 1500) { restartSecs = 1500; }
    }
    secondsSinceLoad++;  
    
    if (stopClockFlag == 0) {
      setTimeout(clockTick,restartSecs);
    }
  },

  // Load queue
  loadQueue = function() {
    
    var highestQueueEpoch = 0;
    var currentEpoch = getCurrentEpoch();
    


    t = new Date(currentEpoch * 1000);
    //	console.info(t.getHours() + ':' + t.getMinutes() +':' + t.getSeconds()+ '   '+ currentEpoch +'    q size:' +queue.length);

    // Exit out if we have a sufficient number of future minutes in the queue
    if (queue.length > 0) {
      highestQueueEpoch = queue[queue.length-1]['endEpoch'];

      //	console.info("Just set highest to: "+getDateStr(highestQueueEpoch));
      //	console.info(currentEpoch +' '+ cfg_maxSecondsAhead +' '+ highestQueueEpoch);
      //	console.info("Prior to check");
      if (currentEpoch + cfg_maxSecondsAhead < highestQueueEpoch) {
	//		console.info("queue has enough..exiting "+currentEpoch);
	return;
      }

      // Exit out if the queue hasn't been drawn down enough
      if (highestQueueEpoch - currentEpoch > cfg_minSecondsAhead) {
	//		console.dir(queue);
	//		console.info("queue not drawn down enough enough..exiting " + (highestQueueEpoch - currentEpoch));
	return;
      }

      //console.info("highest post set");
    }
    
    
    // Exit out if not enough time has passed since our last attempt
    ///  as to not hammer the server in case of failure/etc
    //	console.info("before! "+ (gbl_lastFetchAttemptEpoch ) + '   ' + cfg_fetchDelaySec + '   ' + currentEpoch);	
    if (gbl_lastFetchAttemptEpoch + cfg_fetchDelaySec > currentEpoch) {

      return;
    }
    gbl_lastFetchAttemptEpoch = currentEpoch;
    //	console.info("after! "+ (gbl_lastFetchAttemptEpoch ) + '   ' + cfg_fetchDelaySec + '   ' + currentEpoch);	

    // Exit if there is a request currently active
    //   otherwise the initial load will stack up and request twice
    if (jsClock.isActive()) {
      //	console.info('is active');
      return;
    }



    
    //    console.info("LOADQUEUE: current epoch str:" + getDateStr(currentEpoch) + '   gbl_epochCorrection:'+ gbl_epochCorrection + '  highest: '+getDateStr(highestQueueEpoch));
    
    //    console.info("LOADQUUE")
    
    neededEpoch = (highestQueueEpoch != 0) ? highestQueueEpoch : currentEpoch;
    
    now = new Date(neededEpoch * 1000);
    year = now.getYear();
    if (year < 1900) { year +=1900; }
    var dateStr = year + '-' + (now.getMonth()+1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();
    

    // Populate queue
    // Send our epoch whatever it is, server will send back at least one photos
    // which spans our requested epoch range
    // 
    sendVars = {
      'epoch':neededEpoch,
      'dt' : dateStr,
      'rcnt':++requestCount
    }
    
    // Send the optional flag to indicate this is a www.domain.com/api request instead of api.domain.com
    if (typeof lf != 'undefined' && lf == 1) {
      sendVars['lf'] = 1;
    }
    
    // Merge in any custom variables that need
    //  to go out with the ajax data request
    if (typeof ch_getCustomSendVars !== 'undefined') {
      tmp = ch_getCustomSendVars();
      for (i in tmp) {
	sendVars[i] = tmp[i];
      }
      
    }
    
    // Make the data request
    gbl_requestActive = 1;
    $.ajax({
      type: 'GET',
      url: cfg_apiSrc,
      data: sendVars,
      dataType: 'json',
      success: function(response) {
	// Response received (even if it is blank)
	
	if (typeof response === 'undefined' 
	    || response == null 
	    || response.responseStatus == 0 ) {
	  
	  // Data failure
	  cb_ch_dataFailure();
	  
	} if (response.responseStatus == -2) {
	  // Not logged in, redirect to top domain
	  //  where the will get the not logged in status
	  if (typeof cb_switchToLoggedOut != 'undefined') {
	    cb_switchToLoggedOut();
	  }
	} else {
	  addItemsToQueue(response.data);
	}
	gbl_requestActive = 0;
      },
      error: function() {
	
	// Communication error, invalid response
	cb_ch_dataFailure();
	gbl_requestActive = 0;
      }
    });
  },

  dequeue = function() {

    // Queue is empty, just exit
    if (queue.length == 0) {
      return false;
    }

    var currentEpoch = getCurrentEpoch();


    // Container for the items that get pulled off the queue
    //  so the handlers can do any cleanup
    dequeuedItems = [];

    t = '';
    for (i in queue) {
      r = new Date(queue[i]['startEpoch'] * 1000);
      t += '  '+queue[i]['divID']+'->'+r.getHours()+':'+r.getMinutes()+'-'+queue[i]['startEpoch']+' '+queue[i]['locTxt'];
    } 

    //    console.info('Queue '+queue.length+': '+t);

    // Cycle though the queue
    while (queue.length > 0) {
      
      // Examine the first element
      tmp = queue[0];


      //	    console.info("    now: "+currentEpoch +' with startEpoch: '+tmp['startEpoch']+' '+ 'endEpoch: '+tmp['endEpoch']+"   len:"+queue.length);

      //	    tmp = queue[1];
      //	    console.info("NEXT:    now: "+currentEpoch +' with startEpoch: '+tmp['startEpoch']+' '+ 'endEpoch: '+tmp['endEpoch']+"   len:"+queue.length);


      

      // if the first element is older than the current time window,
      //  it is expired and can be pulled off the queue
      if (currentEpoch >= tmp['endEpoch']) {

	// Element expired, remove from queue
	dequeuedItems.push(tmp);
	//			    console.info('queue shift');
	
	queue.shift()
	//		console.info("expired");	console.info(tmp);
	continue;
      }

      // See if time needs to be enabled or the frame needs to be advanced
	    if(currentEpoch >= tmp['startEpoch']
		    && currentEpoch < tmp['endEpoch']){
			    if (typeof ch_queueActivate != 'undefined') {
				    ch_queueActivate(tmp);
				    
				    if (gbl_lastActivateEpoch != tmp['startEpoch']) {
					    
					    // Lookahead to the next queue item and preload the contents
					    // Load it immediately if there is not much time before the minute changes
					    //  (if for some reason the queue adder didn't add it)
						    var preloadTime = 0;
					    
					    if (tmp['endEpoch'] - currentEpoch > 20) {
						    preloadTime = 5 + (Math.floor(Math.random()*7));
					    }
					    
					    nextItem = queue[1];
					    
					    if (typeof nextItem != 'undefined' && nextItem['startEpoch'] > gbl_maxPreloadEpoch) {
						    //			    console.info("Calling internal preload for " + nextItem['startEpoch'] + ' in seconds: ' + preloadTime );
						    preloadNextItem(preloadTime);
					    } else {
						    //			    console.info("Skipping internal preload for " + gbl_maxPreloadEpoch);
					    }
					    gbl_lastActivateEpoch = tmp['startEpoch'];
				    }
			    }
			    
			    // Still valid, exit
			    return dequeuedItems;
	    }

      // Current time is still less than the next element in the queue
      if (currentEpoch < tmp['startEpoch']) {
	return dequeuedItems;
      }

      // Should not make it here
      //	    console.log("Invalid queue item, no valid time ranges detected");
      return;

    }
    return dequeuedItems;
  },

  getDateStr = function (epoch) {
    now = new Date(epoch * 1000);
    year = now.getYear();
    if (year < 1900) { year +=1900; }
    return year + '-' + (now.getMonth()+1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();
  },

  preloadNextItem = function (delaySeconds) {
    
    // Set a timeout to check to make sure the next div has its heavy content loaded
    //  (it is possible the queue loader already go to it)
    setTimeout( function () { 
      nextItem = queue[1];
      if (typeof nextItem != 'undefined') {
	loadHeavyContent(nextItem);
      }
    }, delaySeconds * 1000
		); 
  },

  loadHeavyContent = function(item) {
    //	console.info("Load heavy");

    gbl_maxPreloadEpoch = item['startEpoch'];
    if (typeof cb_loadHeavyContent == 'function') {
      cb_loadHeavyContent(item);
    }
  },

  addToQueue = function (item) {

    // Do not allow any item to be pushed onto the queue unless it
    //  has a valid start and end epoch, otherwise we will get an infinite loop
    if (typeof item['startEpoch'] != 'undefined'
	&& typeof item['endEpoch'] != 'undefined') {
      item['startEpoch'] = parseInt(item['startEpoch']);
      item['endEpoch'] = parseInt(item['endEpoch']);
      queue.push(item);
    } else {
      console.log("Invalid queue item, no start/end epoch");
    }
    
    // Add any html to the page for this item
    if (typeof cb_addLightContent == 'function') {
      cb_addLightContent(item);
    }
    
    //	    console.info("Q: " + minuteItem['startEpoch'] + '   c:' + current.epoch + '  d: '+ (minuteItem['startEpoch'] - current.epoch));
    
    // Automaticalily heavy load anything that needs to be shown
    //  or will be shown in the next X seconds
    //  (currently the minimum amount of seconds the queue is allowed to be drawn down to)
    var secondsToQueueItem = item['startEpoch'] - getCurrentEpoch();
    if ((secondsToQueueItem) <= 59) {
      
      // Item needs to be shown or shown within the queuedrawn minimum (20 seconds)
      if (secondsToQueueItem <= jsClock.getPreloadMinimumSecs()) {
	//		    console.info("queue immediate " + secondsToQueueItem);
	loadHeavyContent(item);
      } else {
	
	// Item is more than 20 seconds until display, so hold off on its loading by 10 seconds (unless it got loaded already)
	if (item['startEpoch'] > gbl_maxPreloadEpoch) {
	  //			console.info("queue preloader " + secondsToQueueItem + ' for ' + item['startEpoch'] );
	  preloadNextItem(10);
	}
      }
    }
  },

  addItemsToQueue = function(items) {

    // Successful call push the items onto the queue
    var tmp;
    for (var c in items) {
      var minuteItem = items[c];
      var startEpoch = parseInt(minuteItem.startEpoch);
      
      // Push it onto the stack
      tmp = {
	'startEpoch':startEpoch,
	'endEpoch':startEpoch + 60,
	'item':minuteItem.images,
	'navData':minuteItem.navData,
	'doodData':minuteItem.doodData
      };

      addToQueue(tmp);
    }
  },



  getCurrentEpoch = function() {
    
    // Get the current timedate
    // return adjusted amount based on the epoch difference
    //  between the server and the client
    var now = new Date();
    return Math.floor(now.getTime()/1000) + gbl_epochCorrection;
  };

  // PUBLIC METHODS
  return {
    epochToTime: function(ts) {
      return new Date(ts*1000);
    },


    getCurrentEpoch: function() {
      return getCurrentEpoch();
    },

    getCurrentTimeVars: function() {
      var currentEpoch = getCurrentEpoch();
      var currentTime = {};
      now = new Date(currentEpoch * 1000);
      
      currentTime['epoch'] = currentEpoch;
      currentTime['suffix'] = 'am';
      currentTime['hour'] = currentTime['hourMil'] = now.getHours();
      currentTime['minute'] = now.getMinutes();
      currentTime['month'] = now.getMonth() + 1;
      currentTime['seconds']= now.getSeconds();
      currentTime['day'] = now.getDate();
      currentTime['year'] = now.getYear() + 1900;
      
      if (currentTime['minute'] < 10) {
	currentTime['minute'] = '0' + currentTime['minute'];
      }
      
      if (currentTime['hour'] == 0) {
	currentTime['hour'] = 12;
      } else if (currentTime['hour'] == 12) {
	currentTime['suffix'] = 'pm';
      } else if (currentTime['hour'] > 12) {
	currentTime['suffix'] = 'pm';
	currentTime['hour'] -= 12;
      }
      return currentTime;
    },

    writeSecondsBar: function() {

      // Note: each character must be wrapped in a width-specified div
      //  because of the different browser rendering engines.
      //  eg. firefox will draw the seconds bar wider than other browsers
      //      if each char is not in a width-specified container
      var current = jsClock.getCurrentTimeVars();
      var str = '';
      for (var x = 0; x < 59; x++ ){
	str += '<div class="secsChar">' + (current['seconds'] == x ? 'o' : '-') + '</div>';
      }
      if (current['seconds'] == 59) {
	str = '<div style="color: #888888;">' + str + '</div>';
      }
      
      $('#secondsBar').html(str);
    },



    init: function(enableLoader) {

      // Set the flag to shutoff the queue/dequeue of items
      // so a refresh cannot occur
      if (enableLoader == 0) {
	gbl_lastFetchAttemptEpoch = -1;
      }
      // Set the epoch correction factor
      // since the user's computer might not be set to the same as the clock server
      var now = new Date();

      gbl_epochCorrection = parseInt(systemEpoch) - Math.floor(now.getTime()/1000);

      // Call any startup routines that need to be ran
      //  prior to starting the clock
      if (typeof ch_preStartup != 'undefined') {
	ch_preStartup();
      }

      // Start the clock
      clockTick();
    },
    qPreview: function () {
      return queue[1];
    },
    
    isActive: function () {
      return gbl_requestActive;
    },
    
    getPreloadMinimumSecs: function () {
      return cfg_minSecondsAhead;
    },
    

    stopReloader: function() {
      gbl_lastFetchAttemptEpoch = -1;
    },

    forceDequeue: function() {
      dequeue();
    },

    addItemsToQueue: function (items) {
      addItemsToQueue(items);
    }
  }
})();
