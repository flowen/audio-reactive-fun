// TODO: MOUSE INTERACTION
// TODO: DISPLACEMENT RESET
// TODO: FILTER LOW, MID AND HIGH AND ADD DIFFERENT FILTER INTERACTIONS
// OR IS IT THE ENERGY (AKA VOLUME) AT A CERTAIN FREQUENCY?

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
        // var n = ((Math.random() > 0.5) ? -1 : 1);
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
var images = ['berlin.jpg','flying.jpg','ganesh.jpg','japan.jpg','moondark.jpg', 'moonlight.jpg', 'nihon.jpg', 'space.jpg', 'terminator.jpg'];

var fft = new p5.FFT(),
    peakDetect = new p5.PeakDetect();

var hwspectrum = 0,
    displacementModifier = 2.5,
    volume = 1,
    fadeout = 1;

// need?
var currentSong = 0;
var currentImage = 0;

/*
    Assetloader to preload all sprites
*/

var assLoader = PIXI.loader;

for (i=0; i<images.length; i++) {
    assLoader.add(images[i],'images/'+ images[i]);
    assLoader.add('d'+ images[i],'dmaps/'+ images[i]);
}

// preload Sound
function preload(song) {
    sound = new p5.SoundFile('songs/' + song,
        onMusicLoaded,
        h.onError
    );

    // The volume is reset (to 1) when new song is loaded. so we force it
    // console.log('volume: ' + volume);
    sound.setVolume(volume);
}


//when sound is loaded
function onMusicLoaded() {
    $loader.addClass('hidden');
    
    // once assets are loaded, we load the stage
    assLoader.once('complete',initPixiContainer());

    sound.play();
}



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

/*
    Let's filter out different frequences and assign them to different effects(filters)
    Low pass filter
*/
// var filter, filterFreq, filterRes;

// filter = new p5.LowPass();
// console.log(filter);

/*
    get spectrum of sound and translate to useful coordinates
    TODO: SEE COMMENTS ABOVE 
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
    windowHeight = window.innerHeight * .9;
    renderer = new PIXI.autoDetectRenderer(
        windowWidth,
        windowHeight,
        {view:document.getElementById('canvas')}
    );

    // we now shuold have the preloaded assets
    console.log('assets loaded:');
    console.log(assLoader.resources);

    // init filters
    
    // var randomMap = h.getRandomInt(1, 4);
    // console.log('dmap: ' + randomMap);
    // var displacementTexture = PIXI.Sprite.fromImage('dmaps/displacement_map'+ randomMap +'.jpg');

    // image and image depth map have the same name, but different folders.
    // var image = images[h.getRandomInt(0,images.length-1)];
    var image = images[1];
    console.log(image);
    displacementTexture = new PIXI.Sprite.fromImage('dmaps/' + image);

    // center displacementMap
    var dmapX = (windowWidth - displacementTexture.width) / 2;
    stage.addChild(displacementTexture);
    //create filter    
    displacementFilter = new PIXI.filters.DisplacementFilter(displacementTexture);
    
    // WTF NO WORK SEE: r77 scroll on blur
    // blurFilter = new PIXI.filters.BlurXFilter();

    // Loops never end!
    sound.onended(function() {
        console.log('onended');
        newSong();
    });
    
    sprite = new PIXI.Sprite.fromImage('images/' + image);
    stage.addChild(sprite);
    
    // add filters
    sprite.filters = [displacementFilter];

    // start animate
    requestAnimationFrame(animate);
}

/*
    animate that shit jo
*/
function animate() {
    // center sprite
    var spriteX = (windowWidth - sprite.width) / 2;
    sprite.position.x = spriteX;

    // console.log(windowWidth, displacementTexture.width, dmapX);
    displacementTexture.position.x = dmapX;

    // move displacement map around
    // displacementFilter.scale.x += translateSpectrum();
    // displacementFilter.scale.y += translateSpectrum();
    displacementFilter.scale.x += 50;

    // render and animate
    renderer.render(stage);
    requestAnimationFrame(animate);
}

/*
 play random song
*/
function newSong() {
    // var randomSong = h.getRandomInt(0, songs.length-1);
    var randomSong = 1;
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


