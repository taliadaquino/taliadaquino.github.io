$(document).ready(function() {


// Add jQuery here

$('.one').mouseenter(function() {
  $('.one__text').addClass('showme');
});


$('.one').mouseleave(function() {
  $('.one__text').removeClass('showme');
});





$('.nav').mouseenter(function() {
  $('.menu').addClass('showme');
});


$('.nav').mouseleave(function() {
  $('.menu').removeClass('showme');
});





  });
