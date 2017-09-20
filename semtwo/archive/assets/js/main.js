$(document).ready(function() {


// Add jQuery here

$('.nav_ad').click(function(event) {
  $('.item').removeClass('show');
  $('.item').addClass('hide');

  $('.item.ad').removeClass('hide');
  $('.item.ad').addClass('show');

  $('.nav_clear').addClass('show');
});

$('.nav_pipe').click(function(event) {
  $('.item').removeClass('show');
  $('.item').addClass('hide');

  $('.item.pipe').removeClass('hide');
  $('.item.pipe').addClass('show');

  $('.nav_clear').addClass('show');
});


$('.nav_brick').click(function(event) {
  $('.item').removeClass('show');
  $('.item').addClass('hide');

  $('.item.brick').removeClass('hide');
  $('.item.brick').addClass('show');

  $('.nav_clear').addClass('show');
});


$('.nav_window').click(function(event) {
  $('.item').removeClass('show');
  $('.item').addClass('hide');

  $('.item.window').removeClass('hide');
  $('.item.window').addClass('show');

    $('.nav_clear').addClass('show');
});

$('.nav_thumbnail').click(function(event) {
  $('.item').addClass('thumbnail');
});


$('.nav_clear').click(function(event){
  $('.nav_clear').addClass('hide');
  $('.nav_clear').removeClass('show');

  $('.item').removeClass('hide');
});

$('.nav_thumbnail').click(function(event){
  $('.item').addClass('thumbnail');
});

$('.nav_large').click(function(event){
  $('.item').removeClass('thumbnail');
});


$(window).scroll(function() {
    var scroll = $(window).scrollTop();

    if (scroll >= 1000) {
        $("body").addClass("one");
    } else {
        $("body").removeClass("one");
    }

    if (scroll >= 2000) {
        $("body").addClass("two");
    } else {
        $("body").removeClass("two");
    }

    if (scroll >= 3000) {
        $("body").addClass("three");
    } else {
        $("body").removeClass("three");
    }

    if (scroll >= 4000) {
        $("body").addClass("four");
    } else {
        $("body").removeClass("four");
    }

    if (scroll >= 5000) {
        $("body").addClass("five");
    } else {
        $("body").removeClass("five");
    }

    if (scroll >= 6000) {
        $("body").addClass("six");
    } else {
        $("body").removeClass("six");
    }
    if (scroll >= 7000) {
        $("body").addClass("seven");
    } else {
        $("body").removeClass("seven");
    }

    if (scroll >= 8000) {
        $("body").addClass("eight");
    } else {
        $("body").removeClass("eight");
    }

    if (scroll >= 9000) {
        $("body").addClass("nine");
    } else {
        $("body").removeClass("nine");
    }

   if (scroll >= 10000) {
        $("body").addClass("ten");
    } else {
        $("body").removeClass("ten");
    }

   if (scroll >= 11000) {
        $("body").addClass("eleven");
    } else {
        $("body").removeClass("eleven");
    }
   if (scroll >= 12000) {
        $("body").addClass("twelve");
    } else {
        $("body").removeClass("twelve");
    }
     if (scroll >= 13000) {
        $("body").addClass("thirteen");
    } else {
        $("body").removeClass("thirteen");
    }
   if (scroll >= 14000) {
        $("body").addClass("fourteen");
    } else {
        $("body").removeClass("fourteen");
    }

   if (scroll >= 15000) {
        $("body").addClass("fifteen");
    } else {
        $("body").removeClass("fifteen");
    }

    if (scroll >= 16000) {
         $("body").addClass("sixteen");
     } else {
         $("body").removeClass("sixteen");
     }

     if (scroll >= 17000) {
          $("body").addClass("seventeen");
      } else {
          $("body").removeClass("seventeen");
      }

      if (scroll >= 18000) {
           $("body").addClass("eighteen");
       } else {
           $("body").removeClass("eighteen");
       }

       if (scroll >= 19000) {
            $("body").addClass("ninteen");
        } else {
            $("body").removeClass("ninteen");
        }
        if (scroll >= 20000) {
             $("body").addClass("twenty");
         } else {
             $("body").removeClass("twenty");
         }



});
  });
