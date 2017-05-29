$(document).ready(function() {

  // Add jQuery here

  // On .nav click, toggleClass ON or OFF showme.

$('.nav').click(function() {
  $('.menu').toggleClass('showme');
});

$(".landscape").mouseenter(function() {
  $(".landscape").addClass("showme");
});

$(".landscape").mouseleave(function() {
  $(".landscape").removeClass("showme");

});

$(".formrollover").mouseenter(function() {
  $(".form").addClass("showme");
});

$(".formrollover").mouseleave(function() {
  $(".form").removeClass("showme");


});

$(".storyrollover").mouseenter(function() {
  $(".story").addClass("showme");
});

$(".storyrollover").mouseleave(function() {
  $(".story").removeClass("showme");

  });


  $(".historyrollover").mouseenter(function() {
    $(".history").addClass("showme");
  });

  $(".historyrollover").mouseleave(function() {
    $(".history").removeClass("showme");

    });
    $(".namerollover").mouseenter(function() {
      $(".name").addClass("showme");
    });

    $(".namerollover").mouseleave(function() {
      $(".name").removeClass("showme");
        });

        $('.fff').mouseenter(function() {
          $('.fff__image').addClass('showme');
        });


        $('.fff').mouseleave(function() {
          $('.fff__image').removeClass('showme');
        });
        $('.mm').mouseenter(function() {
          $('.mm__image').addClass('showme');
        });


        $('.mm').mouseleave(function() {
          $('.mm__image').removeClass('showme');
        });


        	});
