$(document).ready(function() {

  // Add jQuery here

  // On .nav click, toggleClass ON or OFF showme.

$('.nav').click(function() {
  $('.menu').toggleClass('showme');
});

$(".landscape").mouseenter(function() {
  $(".landscape").addClass("showme");
});



$(".formrollover").mouseenter(function() {
  $(".form").addClass("showme");

});

$(".storyrollover").mouseenter(function() {
  $(".story").addClass("showme");
});




  $(".historyrollover").mouseenter(function() {
    $(".history").addClass("showme");
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
