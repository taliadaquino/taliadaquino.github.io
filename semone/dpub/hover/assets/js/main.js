$(document).ready(function() {

  $('.number').mouseenter(function() {
    $('.footnote').addClass('showme');



 });
  $('.number').mouseleave(function() {
    $('.footnote').removeClass('showme');


 });

  $('.cloud').mouseenter(function() {
    $('.metahaven').addClass('orange');

  });

   $('.cloud').mouseleave(function() {
     $('.metahaven').removeClass('orange');




  });

});
