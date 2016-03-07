/*
    window scroll functions
*/
$(window).scroll(function() {
    var scrollTop = $(window).scrollTop(),
        windowHeight = $(window).height();
        volume = 1 - (scrollTop / windowHeight),
        fadeout = 0 + (scrollTop / windowHeight) * 2;
    if (volume < 0 ) volume = 0;
    if (fadeout < 0 ) fadeout = 0; 

    // decrease volume and opacity while scrolling down
    sound.setVolume(volume);
    $('.canvas-overlay').css('opacity', fadeout);

    // scroll on blur.
    // var blur = 32 - (scrollTop / windowHeight * 50);
    // console.log(blur);
    // blurFilter.blur(20); --> WTF WHY NO WORK
});