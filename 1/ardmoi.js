// TODO: MOUSE INTERACTION
// TODO: DISPLACEMENT RESET
// TODO: SONGPLAYER
/*
 helpers
*/
var h = {
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getNegOrPos : function() {
        // returns -1 or 1 in sequence
        var n,
            b = false;

        if (!b) {
            n = -1;
            b = true;
        } else {
            n = 1;
            b = false;
        }
        return n;
        // randomly return -1 and 1
        // var n;
        // if (Math.random() > 0.5){
        //     n = -1;
        // } else {
        //     n = 1;
        // }
        // return n;
    },
    onError: function(error) {
        console.log('error');
        console.log(error);
    }
};

//init variables
var $loader = $('.loader'),
    $btnNewSong = $('.new-song');
var songs = ['sample-priest.mp3','sample-aphex.mp3','sample-jamie.mp3','sample-impala.mp3'];
var images = ['balls.jpg','berlin.jpg','flying.jpg','ganesh.jpg','japan.jpg','moondark.jpg', 'moonlight.jpg', 'motherboard.jpg', 'nihon.jpg', 'space.jpg', 'terminator.jpg'];
var fft = new p5.FFT();
var peakDetect = new p5.PeakDetect();
var hwspectrum = 0;
var displacementModifier = 2.5;



var currentSong = 0;
var currentImage = 0;


// preload Sound
function preload(song) {
    sound = new p5.SoundFile('songs/' + song,
        onMusicLoaded,
        h.onError
    );
}

$(window).scroll(function() {
    var scrollTop = $(window).scrollTop(),
        windowHeight = $(window).height(),
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

//when sound is loaded
function onMusicLoaded() {
    $loader.addClass('hidden');

    sound.play();
    initPixiContainer();
}

/*
    get spectrum of sound and translate to useful coordinates
*/
function getSpectrum() {
    var spectrum = fft.analyze();
    // peakDetect accepts an fft post-analysis
    peakDetect.update(fft);

    var i = h.getRandomInt(0, spectrum.length/10);
    var hwspectrum = spectrum[0] * displacementModifier * h.getNegOrPos();

    return hwspectrum / 100;
}

function translateSpectrum() {
    var extrapunch = 0;

    // exaggerate the peak
    if ( peakDetect.isDetected ) {
        extrapunch = 250;
    }

    var translate = getSpectrum() + extrapunch;
    // console.log(translate);
    return translate;
}


/*
    initialise the canvas
*/
function initPixiContainer() {
    console.log('initPixiContainer');
    stage = new PIXI.Container();
    windowWidth = window.innerWidth;
    renderer = new PIXI.autoDetectRenderer(
        windowWidth,
        .90 * window.innerHeight,
        {view:document.getElementById('canvas')}
    );

    //filters
    var randomMap = h.getRandomInt(1, 4);
    console.log('dmap: ' + randomMap);
    var displacementTexture = PIXI.Sprite.fromImage('dmaps/displacement_map'+ randomMap +'.jpg');
    displacementFilter = new PIXI.filters.DisplacementFilter(displacementTexture);
    // blurFilter = new PIXI.filters.BlurXFilter();

    // onended this doesn't work with loop

    sound.onended(function() {
        console.log('onended');
        newSong();
    });
    
    sprite = new PIXI.Sprite.fromImage('images/' + images[h.getRandomInt(0,images.length-1)]);
    stage.addChild(sprite);
    
    // add filters
    sprite.filters = [displacementFilter];

    //animate
    requestAnimationFrame(animate);
}

/*
    animate that shit jo
*/
function animate() {
    var spriteX = (windowWidth - sprite.width) / 2
    sprite.position.x = spriteX;
    displacementFilter.scale.x += translateSpectrum();
    displacementFilter.scale.y += translateSpectrum();
    renderer.render(stage);
    requestAnimationFrame(animate);
}

/*
 play random song
*/
function newSong() {
    var randomSong = h.getRandomInt(0, songs.length-1);
    console.log('song: ' +randomSong);
    preload(songs[randomSong]);
}

$btnNewSong.on('click', function() {
    console.log('newsong');
    sound.stop();
    // onended function will fire after stopping song
});

// start song
newSong();


