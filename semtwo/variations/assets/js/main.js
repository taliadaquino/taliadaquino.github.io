$(document).ready(function() {

  // Add jQuery here

  // On .nav click, toggleClass ON or OFF showme.




    $('.number').mouseenter(function() {
      $('.footnote').addClass('showme');
    });


  $('.number').mouseleave(function() {
    $('.footnote').removeClass('showme');
  });

  $(".namerollover").mouseenter(function() {
    $(".name").addClass("showme");
  });

  $(".namerollover").mouseleave(function() {
    $(".name").removeClass("showme");
      });
       });
