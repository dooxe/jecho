"use strict";
//
// Copyright 2017 Maxime Daisy @ http://dooxe-creative.net/
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//
//
//
var HTMLAudio;
if (typeof Audio !== 'undefined') {
    HTMLAudio = Audio;
}
/**
*	@module jecho
*/
/**
*	The main library module.
*	@class jecho
*/
var jecho;
(function (jecho) {
    //
    //
    //
    var audioContext = new AudioContext();
    /**
    *	The vailable drivers for the audio management.
    *	@property drivers
    *	@param {String} drivers.UNBUFFERED
    *	@param {String} drivers.BUFFERED
    *	@type Object
    */
    jecho.drivers = {
        get UNBUFFERED() { return "unbuffered"; },
        get BUFFERED() { return "buffered"; }
    };
    /**
    *	Contains all the event types that can be fired in `jecho`.
    *	@property events
    *	@param {String} events.LOAD
    *	@param {String} events.LOAD_PROGRESS
    *	@param {String} events.PAN_CHANGED
    *	@param {String} events.PITCH_CHANGED
    *	@param {String} events.VOLUME_CHANGED
    *	@param {String} events.POSITION_CHANGED
    *	@param {String} events.DURATION_AVAILABLE
    *	@type Object
    */
    jecho.events = {
        get LOAD() { return 'load'; },
        get LOAD_PROGRESS() { return 'loadprogress'; },
        get PAN_CHANGED() { return 'panchanged'; },
        get PITCH_CHANGED() { return 'pitchchanged'; },
        get VOLUME_CHANGED() { return 'volumechanged'; },
        get POSITION_CHANGED() { return 'positionchanged'; },
        get DURATION_AVAILABLE() { return 'durationavailable'; }
    };
    /**
    *	Load an audio file
    *	@static
    *	@method load
    *	@param src {String} The audio source filename / URL
    */
    function load(src) {
        return new Audio().load(src);
    }
    jecho.load = load;
    /**
    *	Convert the given number of seconds into a readable
    *	time format.
    *	@static
    *	@method formatTime
    *	@param {Integer} seconds
    *	@param {String} format The format to use
    *	<ul>
    *		<li>`h` will be replaced by the number of hours
    *		<li>`m` will be replaced by the number of minutes
    *		<li>`s` will be replaced by the number of seconds
    *	</ul>
    *	Default is `'m:s'`.
    *	@example
    *		var time = 4*60*60 + 25*60 + 11;
    *		var timeStr = jecho.formatTime(time,'h:m:s');
    *		console.log(timeStr);
    *		// "04:25:11"
    *	@return {String} A string representation of the time
    */
    function formatTime(seconds, format) {
        if (format === void 0) { format = 'm:s'; }
        var numberOfSeconds = Math.floor(seconds);
        var numberOfMinutes = Math.floor(numberOfSeconds / 60);
        var numberOfHours = Math.floor(numberOfMinutes / 60);
        var hrs = numberOfHours.toString();
        if (numberOfHours < 10)
            hrs = '0' + hrs;
        numberOfMinutes -= numberOfHours * 60;
        var min = numberOfMinutes.toString();
        if (numberOfMinutes < 10)
            min = '0' + min;
        numberOfSeconds -= numberOfMinutes * 60 + numberOfHours * 60 * 60;
        var sec = numberOfSeconds.toString();
        if (numberOfSeconds < 10)
            sec = '0' + sec;
        return format
            .replace('h', hrs)
            .replace('m', min)
            .replace('s', sec);
    }
    jecho.formatTime = formatTime;
    //
    //
    //
    //
    //
    var Signals = (function () {
        //
        function Signals(source) {
            this._source = source;
            this._listeners = {};
        }
        //
        //
        //
        Signals.prototype.on = function (type, callback) {
            if (!this._listeners[type]) {
                this._listeners[type] = [];
            }
            this._listeners[type].push(callback);
        };
        //
        //
        //
        Signals.prototype.dispatch = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var listeners = this._listeners[type];
            if (listeners) {
                for (var _a = 0, listeners_1 = listeners; _a < listeners_1.length; _a++) {
                    var l = listeners_1[_a];
                    l.apply(this._source, args);
                }
            }
        };
        return Signals;
    }());
    /**
    *	Base class of all the audio filters.
    *	@class jecho.AudioFilter
    */
    var AudioFilter = (function () {
        function AudioFilter() {
        }
        /**
        *	<b>[ absract ]</b> Filter an audio buffer.
        *	@method filter
        *	@param {Integer}	channel	The channel number
        *	@param {Array}		input	The input data buffer
        *	@param {Array}		output	The output data buffer
        *	@param {Integer}	length	The length of the buffers
        */
        AudioFilter.prototype.filter = function (channel, input, output, length) { };
        /**
        *	Create a new filter with Z transform expressions
        *	@static
        *	@method createZ
        *	@param {Function} zFilterFunction The `zFilterFunction` prototype is the following:
        *	<br/>
        *	`function(x,y,i){}` with
        *	<ul>
        *		<li>`x` the input buffer</li>
        *		<li>`y` the output buffer</li>
        *		<li>`i` the current output index</li>
        *	</ul>
        *	@return {jecho.AudioFilter} The newly created filter
        *	@example
        *		// This filter decreases the output volume
        *		// by a factor of two.
        *		audio.addFilter(jecho.createZFilter(function(x,y,i)
        *		{
        *			var outSample = x[i];
        *			outSample *= 0.5;
        *			return outSample;
        *		}));
        */
        AudioFilter.createZ = function (zFilterFunction) {
            if (zFilterFunction === void 0) { zFilterFunction = function (x, y, i) { }; }
            var indices = [0, 0];
            var xi = [[], []];
            var yi = [[], []];
            return {
                filter: function (channel, input, output, length) {
                    for (var i = 0; i < length; ++i) {
                        var index = indices[channel];
                        var x = xi[channel][index] = input[i];
                        var y = yi[channel][index] = zFilterFunction(xi[channel], yi[channel], index);
                        output[i] = y;
                        indices[channel]++;
                    }
                }
            };
        };
        /**
        *	Create a new filter from a filter function.
        *	@static
        *	@method createFilter
        *	@param {Function} filterFunction Function that will filter the
        *	audio data buffer. Its prototype is the following:
        *	`function(channel,input,output,length){}`.
        *	@return {jecho.AudioFilter}
        */
        AudioFilter.create = function (filterFunction) {
            var allSamples = [[], []];
            var indices = [0, 0];
            return {
                filter: function (channel, input, output, length) {
                }
            };
        };
        /**
        *	Create a low pass filter.
        *	@static
        *	@method createLowPass
        *	@param {float} alpha The cutoff frequency between 0 and 2
        *	@return {jecho.AudioFilter} A low-pass filter
        */
        AudioFilter.prototype.createLowPass = function (alpha) {
            return jecho.AudioFilter.createZ(function (x, y, i) {
                var out = x[i];
                if (i > 0) {
                    out = y[i - 1] + alpha * (x[i] - y[i - 1]);
                }
                return out;
            });
        };
        return AudioFilter;
    }());
    jecho.AudioFilter = AudioFilter;
    //
    //
    //
    //
    //
    var AudioDriver = (function () {
        //
        function AudioDriver() {
            this._signals = new Signals(this);
        }
        Object.defineProperty(AudioDriver.prototype, "signals", {
            //
            get: function () {
                return this._signals;
            },
            enumerable: true,
            configurable: true
        });
        //
        AudioDriver.prototype.on = function (type, callback) {
            this.signals.on(type, callback);
        };
        return AudioDriver;
    }());
    //
    //
    //
    //
    var WebAudioDriver = (function (_super) {
        __extends(WebAudioDriver, _super);
        //
        //
        //
        function WebAudioDriver() {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._filters = [];
            _this._gain = audioContext.createGain();
            _this._analyser = audioContext.createAnalyser();
            _this._spectrumSize = _this._analyser.frequencyBinCount;
            _this._waveformSize = _this._analyser.frequencyBinCount;
            _this._spectrum = new Uint8Array(_this._spectrumSize);
            _this._waveform = new Uint8Array(_this._waveformSize);
            _this._pannerNode = audioContext.createStereoPanner();
            _this._scriptNode = audioContext.createScriptProcessor(4 * 4096, 1, 1);
            _this._pannerNode.connect(_this._scriptNode);
            _this._scriptNode.connect(_this._analyser);
            _this._scriptNode.connect(_this._gain);
            _this._gain.connect(audioContext.destination);
            var i = 0;
            _this._scriptProcessorListener = function (audioProcessingEvent) {
                // The input buffer is the song we loaded earlier
                var inputBuffer = audioProcessingEvent.inputBuffer;
                // The output buffer contains the samples that will be modified and played
                var outputBuffer = audioProcessingEvent.outputBuffer;
                // Loop through the output channels (in this case there is only one)
                for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                    var inputData = inputBuffer.getChannelData(channel);
                    var outputData = outputBuffer.getChannelData(channel);
                    // Loop through the 4096 samples
                    for (var sample = 0; sample < inputBuffer.length; sample++) {
                        outputData[sample] = inputData[sample];
                    }
                    for (var j = 0; j < self._filters.length; ++j) {
                        var filter = self._filters[j];
                        filter.filter(channel, inputData, outputData, inputBuffer.length);
                    }
                }
            };
            return _this;
        }
        Object.defineProperty(WebAudioDriver.prototype, "outputNode", {
            //
            get: function () {
                return this._scriptNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebAudioDriver.prototype, "fftSize", {
            //
            get: function () {
                return this._analyser.fftSize;
            },
            //
            set: function (size) {
                if (size < 32 || size > 32768) {
                    throw new Error();
                }
                var isPowOfTwo = (size != 0) && ((size & (size - 1)) == 0);
                if (!isPowOfTwo) {
                    throw new Error('jecho: Audio.fftSize must be a power of 2');
                }
                this._analyser.fftSize = size;
                this._spectrum = new Uint8Array(this._analyser.frequencyBinCount);
                this._waveform = new Uint8Array(this._analyser.frequencyBinCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebAudioDriver.prototype, "volume", {
            //
            get: function () {
                return this._gain.gain.value;
            },
            //
            set: function (volume) {
                this._gain.gain.value = volume;
                this.signals.dispatch(jecho.events.VOLUME_CHANGED, volume);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebAudioDriver.prototype, "pan", {
            //
            get: function () {
                return this._pannerNode.pan.value;
            },
            //
            set: function (pan) {
                this._pannerNode.pan.value = pan;
                this.signals.dispatch(jecho.events.PAN_CHANGED, pan);
            },
            enumerable: true,
            configurable: true
        });
        //
        WebAudioDriver.prototype.onPlay = function () {
            this._scriptNode.addEventListener('audioprocess', this._scriptProcessorListener, false);
        };
        //
        WebAudioDriver.prototype.onPause = function () {
            this._scriptNode.removeEventListener('audioprocess', this._scriptProcessorListener);
        };
        Object.defineProperty(WebAudioDriver.prototype, "spectrum", {
            //
            get: function () {
                this._analyser.getByteFrequencyData(this._spectrum);
                return this._spectrum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebAudioDriver.prototype, "waveform", {
            //
            get: function () {
                this._analyser.getByteTimeDomainData(this._waveform);
                return this._waveform;
            },
            enumerable: true,
            configurable: true
        });
        //
        WebAudioDriver.prototype.addFilter = function (filter) {
            if (this._filters.indexOf(filter) == -1) {
                this._filters.push(filter);
            }
        };
        //
        WebAudioDriver.prototype.removeFilter = function (filter) {
            var index = this._filters.indexOf(filter);
            if (index != -1) {
                this._filters.splice(index, 1);
            }
        };
        return WebAudioDriver;
    }(AudioDriver));
    //
    //
    //
    //
    //
    var BufferedAudioDriver = (function (_super) {
        __extends(BufferedAudioDriver, _super);
        //
        //
        //
        function BufferedAudioDriver() {
            var _this = _super.call(this) || this;
            _this._currentTime = 0;
            _this._audio = new HTMLAudio();
            _this._audioSource = audioContext.createMediaElementSource(_this._audio);
            _this._audioSource.connect(_this.outputNode);
            _this._audio.addEventListener('timeupdate', function (e) {
            }, false);
            return _this;
        }
        Object.defineProperty(BufferedAudioDriver.prototype, "loop", {
            //
            get: function () {
                return this._audio.loop;
            },
            //
            set: function (loop) {
                this._audio.loop = loop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BufferedAudioDriver.prototype, "position", {
            //
            get: function () {
                return (this._audio.currentTime / this._audio.duration);
            },
            //
            set: function (p) {
                this._audio.currentTime = p * this._audio.duration;
                this.signals.dispatch(jecho.events.POSITION_CHANGED, p);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BufferedAudioDriver.prototype, "pitch", {
            //
            get: function () {
                return this._audio.playbackRate;
            },
            //
            set: function (pitch) {
                this._audio.playbackRate = pitch;
                this.signals.dispatch(jecho.events.PITCH_CHANGED, pitch);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BufferedAudioDriver.prototype, "duration", {
            //
            get: function () {
                return this._audio.duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BufferedAudioDriver.prototype, "isPlaying", {
            //
            get: function () {
                return (!this._audio.paused);
            },
            enumerable: true,
            configurable: true
        });
        //
        BufferedAudioDriver.prototype.play = function () {
            this._audio.currentTime = this._currentTime;
            this._audio.play();
            this.onPlay();
        };
        //
        BufferedAudioDriver.prototype.pause = function () {
            this._currentTime = this._audio.currentTime;
            this._audio.pause();
            this.onPause();
        };
        //
        BufferedAudioDriver.prototype.stop = function () {
            this._currentTime = 0;
            this._audio.pause();
            this.onPause();
        };
        //
        BufferedAudioDriver.prototype.load = function (audio, src) {
            var self = this;
            return new Promise(function (resolve, reject) {
                self._audio.addEventListener('canplay', function () {
                    self.signals.dispatch(jecho.events.DURATION_AVAILABLE, self.duration);
                    resolve(audio);
                }, false);
                self._audio.addEventListener('error', function (e) {
                    reject(e);
                }, false);
                self._audio.src = src;
                self._audio.load();
            });
        };
        return BufferedAudioDriver;
    }(WebAudioDriver));
    //
    //
    //
    //
    //
    var UnbufferedAudioDriver = (function (_super) {
        __extends(UnbufferedAudioDriver, _super);
        //
        //
        //
        function UnbufferedAudioDriver() {
            var _this = _super.call(this) || this;
            _this._buffer = null;
            _this._source = null;
            _this._pitch = 1;
            _this._interval = null;
            _this._isPlaying = false;
            _this._position = 0;
            _this._timestamp = 0.0;
            _this._loop = false;
            return _this;
        }
        //
        UnbufferedAudioDriver.prototype.time = function () {
            return Date.now();
        };
        //
        UnbufferedAudioDriver.prototype.getCurrentPosition = function () {
            var delta = (this.time() - this._timestamp);
            var duration = this._buffer.duration * 1000; // s => ms
            delta /= this._pitch;
            return (delta / duration);
        };
        Object.defineProperty(UnbufferedAudioDriver.prototype, "loop", {
            //
            get: function () {
                if (this._source) {
                    return this._source.loop;
                }
                return this._loop;
            },
            //
            set: function (loop) {
                if (this._source) {
                    this._source.loop = loop;
                }
                this._loop = loop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UnbufferedAudioDriver.prototype, "position", {
            //
            get: function () {
                return this.getCurrentPosition();
            },
            //
            set: function (p) {
                this.pause();
                this._position = p;
                this.play();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UnbufferedAudioDriver.prototype, "pitch", {
            //
            get: function () {
                return this._pitch;
            },
            //
            set: function (pitch) {
                var playing = this.isPlaying;
                if (playing) {
                    this.pause();
                }
                this._pitch = pitch;
                if (this._source) {
                    this._source.playbackRate.value = pitch;
                }
                if (playing) {
                    this.play();
                }
                this.signals.dispatch(jecho.events.PITCH_CHANGED, pitch);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UnbufferedAudioDriver.prototype, "duration", {
            //
            get: function () {
                if (this._buffer) {
                    return this._buffer.duration;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UnbufferedAudioDriver.prototype, "isPlaying", {
            //
            get: function () {
                return this._isPlaying;
            },
            enumerable: true,
            configurable: true
        });
        //
        UnbufferedAudioDriver.prototype.play = function () {
            var self = this;
            // Create the audio source
            var source = this._source
                = audioContext.createBufferSource();
            source.connect(this.outputNode);
            if (!self._buffer) {
                throw new Error("No buffer loaded !");
            }
            source.loop = this._loop;
            source.onended = function () {
                self.stop();
            };
            source.buffer = self._buffer;
            source.playbackRate.value = this._pitch;
            //
            this._timestamp = (this.time() - this._position * this._pitch * this._buffer.duration * 1000);
            // Real play ...
            var position = this._position * this._buffer.duration;
            source.start(0, position);
            if (self._interval) {
                window.clearInterval(self._interval);
            }
            self._interval = window.setInterval(function () {
                var p = self.getCurrentPosition();
                self.signals.dispatch(jecho.events.POSITION_CHANGED, p);
                this._position = p;
            }, 10);
            this._isPlaying = true;
            this.onPlay();
        };
        //
        UnbufferedAudioDriver.prototype.pause = function () {
            if (this._interval) {
                window.clearInterval(this._interval);
            }
            this._isPlaying = false;
            this._source.stop();
            this.onPause();
        };
        //
        UnbufferedAudioDriver.prototype.stop = function () {
            if (this._interval) {
                window.clearInterval(this._interval);
            }
            this._position = 0;
            this._isPlaying = false;
            this._source.stop();
            this.onPause();
        };
        //
        UnbufferedAudioDriver.prototype.load = function (audio, src) {
            var self = this;
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                request.open('GET', src, true);
                request.responseType = 'arraybuffer';
                request.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        var progress = e.loaded / e.total;
                        self.signals.dispatch(jecho.events.LOAD_PROGRESS, progress);
                    }
                }, false);
                request.addEventListener('load', function () {
                    audioContext.decodeAudioData(request.response, function (b) {
                        self._buffer = b;
                        self.signals.dispatch('load');
                        self.signals.dispatch('canplay');
                        self.signals.dispatch(jecho.events.DURATION_AVAILABLE, self.duration);
                        resolve(audio);
                    }, function (e) {
                        self.signals.dispatch('loaderror', e);
                    });
                }, false);
                request.send();
            });
        };
        return UnbufferedAudioDriver;
    }(WebAudioDriver));
    //
    //
    //
    //
    //
    var Audio = (function () {
        /**
        *	The base class of all audio types
        *	@class jecho.Audio
        *	@constructor jecho.Audio
        *	@param {String} driver The driver to use for manipulating audio
        *	<ul>
        *		<li>jecho.drivers.BUFFERED <b>[ default ]</b></li>
        *		<li>jecho.drivers.UNBUFFERED</li>
        *	</ul>
        */
        function Audio(driver) {
            if (driver === void 0) { driver = jecho.drivers.BUFFERED; }
            this._position = 0;
            this._pitch = 1;
            this._volume = 1;
            this._signals = new Signals(this);
            if (driver === jecho.drivers.BUFFERED) {
                this._driver = new BufferedAudioDriver();
            }
            else {
                //throw new Error("'"+driver+"' driver is not implemented yet");
                this._driver = new UnbufferedAudioDriver();
            }
        }
        /**
        *	@method on
        *	@chainable
        *	@param type		{String}	Event type
        *	@param callback {Function}	The callback function
        *	@return {Audio}
        */
        Audio.prototype.on = function (type, callback) {
            this._driver.on(type, callback);
            return this;
        };
        Object.defineProperty(Audio.prototype, "loop", {
            get: function () {
                return this._driver.loop;
            },
            /**
            *	Get / set the looping status
            *	@property loop
            *	@type boolean
            */
            set: function (loop) {
                this._driver.loop = loop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "position", {
            /**
            *	Get / set the audio playing position from `0` to `1`.
            *	@property position
            *	@type float
            */
            get: function () {
                return this._driver.position;
            },
            set: function (p) {
                this._driver.position = p;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "pitch", {
            /**
            *	Get / set the sound pitch within `[0,~]`
            *	@property pitch
            *	@type float
            */
            get: function () {
                return this._driver.pitch;
            },
            set: function (pitch) {
                if (pitch < 0) {
                    throw new Error('jecho: Audio.pitch must be >= 0');
                }
                this._driver.pitch = pitch;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "pan", {
            /**
            *	Get / set the sound panning between `-1` and `+1` where:
            *	<table>
            *		<tr><td style="width:32px">`-1`</td><td>is fully on the left</td></tr>
            *		<tr><td>`0`</td><td>is on the center (default)</td></tr>
            *		<tr><td>`+1`</td><td>is fully on the right</td></tr>
            *	</table>
            *	@property pan
            *	@type float
            */
            get: function () {
                return this._driver.pan;
            },
            set: function (pan) {
                if (pan < -1 || pan > 1) {
                    throw new Error("jecho: Audio.pan must be between -1 (left) and 1 (right)");
                }
                this._driver.pan = pan;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "volume", {
            /**
            *	Get / set the sound volume between 0 and 1.
            *	@property volume
            *	@type float
            */
            get: function () {
                return this._driver.volume;
            },
            set: function (volume) {
                if (volume < 0 || volume > 1) {
                    throw new Error("jecho: Audio.volume must be in [0,1]");
                }
                this._driver.volume = volume;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "fftSize", {
            get: function () {
                return this._driver.fftSize;
            },
            /**
            *	Get / set the size of the fft to use for both the `spectrum` and `waveform`.
            *	@property fftSize
            *	@type Integer
            */
            set: function (size) {
                this._driver.fftSize = size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "duration", {
            /**
            *	The audio duration in seconds.
            *	@property duration
            *	@type float
            *	@readOnly
            */
            get: function () {
                return this._driver.duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "isPlaying", {
            /**
            *	Is the audio currently playing ?
            *	@property isPlaying
            *	@type Boolean
            *	@readOnly
            */
            get: function () {
                return this._driver.isPlaying;
            },
            enumerable: true,
            configurable: true
        });
        /**
        *	Load a sound from source filename
        *	@method load
        *	@param src {String}
        *	@return {Promise}
        *	@example
        *		var audio = new jecho.Audio();
        *		audio.load('my/super/music').then(
        *			// on success
        *			function(audio){
        *				audio.pitch = 1.2;
        *				audio.play();
        *			},
        *			// on error
        *			function (error){
        *
        *			}
        *		);
        */
        Audio.prototype.load = function (src) {
            if (src === void 0) { src = null; }
            return this._driver.load(this, src);
        };
        /**
        *	Load an audio file.
        *	@static
        *	@method load
        *	@return {Promise}
        */
        Audio.load = function (src) {
            return new jecho.Audio().load(src);
        };
        /**
        *	Play the audio
        *	@method play
        */
        Audio.prototype.play = function () {
            if (this.isPlaying) {
                return;
            }
            this._driver.play();
        };
        /**
        *	Stop the sound and save the position
        *	@method pause
        */
        Audio.prototype.pause = function () {
            if (this.isPlaying) {
                this._driver.pause();
            }
        };
        /**
        *	Stop the sound and reset the position
        *	@method stop
        */
        Audio.prototype.stop = function () {
            this._driver.stop();
        };
        Object.defineProperty(Audio.prototype, "spectrum", {
            /**
            *	Get the current sound spectrum
            *	@property spectrum
            *	@type Array
            */
            get: function () {
                return this._driver.spectrum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Audio.prototype, "waveform", {
            /**
            *	Get the signal waveform
            *	@property waveform
            *	@type Array
            */
            get: function () {
                return this._driver.waveform;
            },
            enumerable: true,
            configurable: true
        });
        /**
        *	Add a filter to make some effects on the sound
        *	@method addFilter
        *	@param {jecho.AudioFilter} filter The filter to add to the list
        *	@chainable
        */
        Audio.prototype.addFilter = function (filter) {
            this._driver.addFilter(filter);
            return this;
        };
        /**
        *	Remove an audio filter
        *	@method removeFilter
        *	@param {jecho.AudioFilter} filter The filter to be removed
        *	@chainable
        */
        Audio.prototype.removeFilter = function (filter) {
            this._driver.removeFilter(filter);
            return this;
        };
        return Audio;
    }());
    jecho.Audio = Audio;
})(jecho || (jecho = {}));
//
//
//
if (typeof module !== 'undefined') {
    if (module.exports) {
        module.exports = jecho;
    }
}
