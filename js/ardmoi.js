// TODO: MOUSE INTERACTION

//init variables
var $loader = $('.loader'),
    $btnNewSong = $('.new-song');

// TODO find right frequences and tresholds for all songs
var songs = [
            {
                filename: 'sample-aphex-l.mp3',
                fbass: { x1:0, x2:60, t: 0.8},
                fmid: { x1:70, x2:120, t: 0.7}
            },
            {
                filename: 'sample-priest.mp3',
                fbass: { x1:0, x2:90, t: 0.7},
                fmid: { x1: 70, x2:140, t: 0.8}
            },
            {
                filename: 'sample-jamie.mp3',
                fbass: { x1:0, x2:60, t: 0.7},
                fmid: { x1:90, x2:110, t: 0.7}
            },
            {
                filename: 'sample-impala.mp3',
                fbass: { x1:40, x2:70, t: 0.7},
                fmid: { x1:70, x2:110, t: 0.9}
            }
            ];

var sprites = ['berlin.jpg','flying.jpg','ganesh.jpg','japan.jpg','moondark.jpg', 'moonlight.jpg', 'nihon.jpg', 'space.jpg', 'terminator.jpg'];

var fft = new p5.FFT();

var volume = 1,   
    fadeout = 1; // fadeout on scroll

var currentSong = 0,  // if random, remove default value
    sound, thisSong,
    fbass, fmid, bassDetect, midDetect,
    currentImage,
    mainVisual, displacementFilter, displacementTexture, imageInterval, 
    stage, renderer;

var windowWidth = window.innerWidth,
    windowHeight = window.innerHeight;
/*
    Assetloader to preload all sprites
*/
var assLoader = PIXI.loader;

for (var i = 0; i < sprites.length; i++) {
    assLoader.add(sprites[i],'images/'+ sprites[i]);
    // HOWTO ADD DEPTH MAPS?
    // assLoader.add('depth-'+ sprites[i],'dmaps/'+ sprites[i]);
}

/*
    preload Sound
*/
function preload(song) {
    console.log('preloading song: ' + currentSong);
    console.log(song.filename);
    sound = new p5.SoundFile('songs/' + song.filename,
        onMusicLoaded,
        h.onError
    );

    // The volume is reset (to 1) when a new song is loaded. so we force it 
    sound.setVolume(volume);
}

// sound is loaded, let's hide the loader and WUBWUB
function onMusicLoaded() {
    $loader.addClass('hidden');    
    sound.play();
}

/*
    play random song
    fires on 'onended'
*/
function newSong() {
    var randomSong = h.getRandomInt(0, songs.length-1);

    // let's prevent same song
    // if (randomSong === currentSong) {
    //     newSong();
    // } else {
    //     currentSong = randomSong;
    //     preload(songs[currentSong]);
    // }
    
    preload(songs[currentSong]);
    if (currentSong < songs.length-1) {
        currentSong++;
    } else {
        currentSong = 0;
    }
    // // let's set the parameters for bass and mid detection
    thisSong = songs[currentSong];
    fbass = thisSong.fbass;
    fmid = thisSong.fmid;

    bassDetect = new p5.PeakDetect(fbass.x1, fbass.x2, fbass.t);
    midDetect = new p5.PeakDetect(fmid.x1, fmid.x2, fmid.t);
}

// onended function will fire after stopping song
$btnNewSong.on('click', function() {
    sound.stop();
});

/*
    detect bass and mids
    Frequency x1, frquency x2, detect treshold
*/

function getSpectrum() {
    // first analyze
    var spectrum = fft.analyze();
    // then detect
    bassDetect.update(fft);
    midDetect.update(fft);

    if ( bassDetect.isDetected ) {
        // stroboBlack();
        newImage();
    }

    if ( midDetect.isDetected ) {
        // stroboWhite();
        newImage();
    }
}

/*
    STROBO'S
*/
var overlay = $('.canvas-overlay'),
    tl = new TimelineLite();
function stroboBlack() {
    tl.to(overlay, .07, {opacity: 1})
      .to(overlay, .01, {opacity: 0});
}

function stroboWhite() {
    tl.to(overlay, .07, {opacity: 1, backgroundColor: '#fff'})
      .to(overlay, .01, {opacity: 0, backgroundColor: '#000'});
}

var totalSpritesOnStage = [];
function newImage() {

    // Let's loop through all sprites
    // find the depthmap according to it
    var sprites = assLoader.resources,
        spriteKeys = Object.keys(sprites);
    // console.log('change image');
    // console.log('--------------------------');
    // image and image depth map have the same name, but different folders.

    var randomImage = h.getRandomInt(0, spriteKeys.length-1),
        thisImage = sprites[spriteKeys[randomImage]];

    if (randomImage === currentImage) {
        newImage();
        return;
    } else {
        currentImage = randomImage; // update currentImage
    }
    
    totalSpritesOnStage.push(thisImage);
    // console.log(totalSpritesOnStage.length); // wordt telkens hoger, werkt .shift()?
    // console.log(spriteKeys.length); //blijft hetzelfe
    
    if (totalSpritesOnStage.length > 4) {
        // let's destroy the sprite now
        stage.removeChild(totalSpritesOnStage[0]); 
        stage.removeChild(totalSpritesOnStage[1]); 

        // after destroying the sprites, we remove it from the array as well
        totalSpritesOnStage.shift();
        totalSpritesOnStage.shift();
    }

    /*
        Filters
    */

    //DMAP
    // TODO: DEPTHMAPS OOK IN ASSLOADER ????
    displacementTexture = new PIXI.Sprite.fromImage('dmaps/' + thisImage.name);
    displacementTexture.width = windowWidth;
    stage.addChild(displacementTexture);
    // WACHT FUCK TOCH WEL MET KEY IPV INDEX
    totalSpritesOnStage.push(displacementTexture);

    console.log(totalSpritesOnStage);
    // console.log(displacementTexture._texture.baseTexture.imageUrl);
    displacementFilter = new PIXI.filters.DisplacementFilter(displacementTexture);
    

    // main visual randomized
    mainVisual = new PIXI.Sprite.fromImage(thisImage.url);
    mainVisual.width = windowWidth;
    stage.addChild(mainVisual);

    // there are always 2 sprites added, a dmap and a visual.
    // remove the first 2
    // console.log('children: ' +stage.children.length);
    // console.log(stage.children);
    // add filters
    mainVisual.filters = [displacementFilter];
}

/*
    initialise the canvas
*/
function initPixiContainer() {
    console.log('initPixiContainer');
    stage = new PIXI.Container();
    renderer = new PIXI.autoDetectRenderer(
        windowWidth,
        windowHeight,
        {view:document.getElementById('canvas')}
    );

    // we now shuold have the preloaded assets
    console.log('All assets loaded in assLoader.resources');

    // so we load an image
    newImage();
    
    // start animate
    requestAnimationFrame(animate);
}

/*
    animate that shit jo
*/

function animate() {
    // center mainVisual
    var mainVisualX = (windowWidth - mainVisual.width) / 2;
    var mainVisualY = (windowHeight - mainVisual.height) / 2;
    mainVisual.position.x = mainVisualX;
    mainVisual.position.y = mainVisualY;

    // center displacementMap
    var dmapX = (windowWidth - displacementTexture.width) / 2;
    var dmapY = (windowHeight - displacementTexture.height) / 2;
    displacementTexture.position.x = dmapX;
    displacementTexture.position.y = dmapY;

    // move displacement map around
    displacementFilter.scale.x += 1.25;

    getSpectrum();
    // displacementFilter.scale.x -= 5;

    // Loops never end though!
    sound.onended(function() {
        // console.log('==============================================');
        // console.log('onended');
        newSong();
    });

    // render and animate
    renderer.render(stage);
    requestAnimationFrame(animate);
}

// start with a song
// pick random artworkl
newSong();

// once assets are loaded, we load the stage
assLoader.once('complete', initPixiContainer());



