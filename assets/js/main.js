$(document).ready(function() {

  // Add jQuery here

  // On .nav click, toggleClass ON or OFF showme.

$('.box1').click(function() {
  $('.menu').toggleClass('showme');
});

$(".box1").mouseenter(function() {
  $(".box1").addClass("showme");
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
        });        });
