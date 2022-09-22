import { ResizeSystem, SynthSystem } from './scripts/systems.js';
import { MidiContextComponent } from './scripts/components.js';
import { createWorld as createAttractorsWorld } from './attractors.js'
import { createWorld as createExcitersWorld } from './exciters.js'
import { createWorld as createBarcodeWorld } from './barcode.js'
import { createWorld as createSpiralWorld } from './spiral.js'

let worlds, world;
let lastTime, currTime, delta;

window.Fonts = {}
window.preload = function () {
    window.Fonts.dudler = loadFont('assets/Dudler-Regular.woff');
    window.Fonts.emeritus = loadFont('assets/Emeritus-Display.woff');
}

window.setup = function () {
    createCanvas(windowWidth, windowHeight)

    WebMidi
        .enable()
        .then(onMidiEnabled)
        .catch(err => alert(err));

    axes();

    let excitersWorld = createExcitersWorld()
    excitersWorld.stop()

    let attractorsWorld = createAttractorsWorld()
    attractorsWorld.stop()

    let barcodeWorld = createBarcodeWorld()
    barcodeWorld.stop()

    let spiralWorld = createSpiralWorld()
    spiralWorld.stop()

    worlds = {
        attractors: attractorsWorld,
        exciters: excitersWorld,
        barcode: barcodeWorld,
        spiral: spiralWorld,
    }

    world = worlds.spiral
    world.play()

    lastTime = performance.now();
}

window.draw = function () {
    currTime = performance.now();
    delta = currTime - lastTime;
    lastTime = currTime;
    world.execute(delta);
    //axes();
}

function axes() {
    translate(windowWidth/2,windowHeight/2);
    stroke('rgba(255, 255, 255, 1)');
    let halfWidth = windowWidth/2;
    let halfHeight = windowHeight/2;

    // x axis 
    for (var j=0; j<=windowWidth; j=j+10){
        if (j == 0 ) {
            stroke('rgba(255, 255, 255, .15)');
        } else if (j % 100 == 0) {
            stroke('rgba(255, 255, 255, .1)');
        } else {
            stroke('rgba(255, 255, 255, .05)');
        }
      line(-halfWidth, j, windowWidth, j);
      line(-halfWidth, -j, windowWidth, -j);
    }

    // x axis
    for (var i=0; i<=windowHeight ; i=i+10){
        if (i == 0 ) {
            stroke('rgba(255, 255, 255, .15)');
        } else if (i % 100 == 0) {
            stroke('rgba(255, 255, 255, .1)');
        } else {
            stroke('rgba(255, 255, 255, .05)');
        }

        line(i, -halfHeight, i, windowHeight);
        line(-i, -halfHeight, -i, windowHeight);
    }    
}

// MIDI ========================================================================

function onMidiEnabled() {
    console.log("WebMidi enabled!")

    // Inputs
    console.log("Input MIDI ports:")
    WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));

    // Outputs
    console.log("Output MIDI ports:")
    let midiOutSelect = document.getElementById('midiout-select');
    for (let output of WebMidi.outputs) {
        let opt = document.createElement('option');
        opt.value = output.name;
        opt.innerHTML = output.name;
        midiOutSelect.appendChild(opt);
    }
}

// Browser Events ==============================================================
// TODO: Events should be handled by dedicated systems that process an
// event queue either maintained by the system or is in a global context. These
// event queues can be populated by the appropriate event handlers here.
// This would make sure all application logic (eg. create an entity) lies in
// the respective systems. 
// eg. mouseClicked event handler can set a "mouseClicked" variable in a global
// context component, which then gets handled by a system 

window.mouseClicked = function () {
    if (world) {
        world.mouseClicked()
    }

    // let synthSystem = world.getSystem(SynthSystem)
    // if (!synthSystem.audioContextStarted) {
    //     userStartAudio();
    //     synthSystem.audioContextStarted = true
    //     for (let osc of synthSystem.oscillators) {
    //         osc.start()
    //     }
    //     console.log(synthSystem.oscillators)
    // }
}

window.mouseDragged = function () {
    if (world) {
        world.mouseDragged()
    }
}

window.mousePressed = function () {
    if (world) {
        world.mousePressed()
    }
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight)
    if (world) {
        world.getSystem(ResizeSystem).execute()
    }
}

// UI Events ===================================================================

document.getElementById('worlds').onchange = function () {
    world.stop()
    if (this.value == 'attractors')
        world = worlds.attractors
    if (this.value == 'exciters')
        world = worlds.exciters
    if (this.value == 'barcode')
        world = worlds.barcode
    if (this.value == 'spiral')
        world = worlds.spiral
    world.play()
};

document.getElementById('midiout-select').onchange = function () {
    // if (this.value = '') {
    //     worlds.
    // }
    worlds.attractors.worldContext.getMutableComponent(MidiContextComponent).output = this.value
    worlds.exciters.worldContext.getMutableComponent(MidiContextComponent).output = this.value
    worlds.barcode.worldContext.getMutableComponent(MidiContextComponent).output = this.value
    worlds.spiral.worldContext.getMutableComponent(MidiContextComponent).output = this.value
};