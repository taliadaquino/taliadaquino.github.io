$(document).ready(function() {

  // Add jQuery here

  // On .nav click, toggleClass ON or OFF showme.

$('.nav').click(function() {
  $('.menu').toggleClass('showme');
});


});
$(".landscape").mouseenter(function() {
  $(".landscape").addClass("showme");
});

$(".landscape").mouseleave(function() {
  $(".landscape").removeClass("showme");
});
});
