/*!
 * ClockPicker v0.0.7 (http://weareoutman.github.io/clockpicker/)
 * Copyright 2014 Wang Shenwei.
 * Licensed under MIT (https://github.com/weareoutman/clockpicker/blob/gh-pages/LICENSE)
 *
 * Further modified
 * Copyright 2015 Ching Yaw Hao.
 *
 * Further modified
 * Copyright 2017 DaedalusDev (Florian Saleur)
 * Licensed under MIT (https://github.com/DaedalusDev/materialize-clockpicker/LICENSE)
 */

;(function () {
    var $ = window.jQuery,
        $win = $(window),
        $doc = $(document);

    // Can I use inline svg ?
    var svgNS = 'http://www.w3.org/2000/svg',
        svgSupported = 'SVGAngle' in window && (function () {
                var supported,
                    el = document.createElement('div');
                el.innerHTML = '<svg/>';
                supported = (el.firstChild && el.firstChild.namespaceURI) === svgNS;
                el.innerHTML = '';
                return supported;
            })();

    // Can I use transition ?
    var transitionSupported = (function () {
        var style = document.createElement('div').style;
        return 'transition' in style ||
            'WebkitTransition' in style ||
            'MozTransition' in style ||
            'msTransition' in style ||
            'OTransition' in style;
    })();

    // Listen touch events in touch screen device, instead of mouse events in desktop.
    var touchSupported = 'ontouchstart' in window,
        mousedownEvent = 'mousedown' + ( touchSupported ? ' touchstart' : ''),
        mousemoveEvent = 'mousemove.clockpicker' + ( touchSupported ? ' touchmove.clockpicker' : ''),
        mouseupEvent = 'mouseup.clockpicker' + ( touchSupported ? ' touchend.clockpicker' : '');

    // Vibrate the device if supported
    var vibrate = navigator.vibrate ? 'vibrate' : navigator.hasOwnProperty('webkitVibrate') ? 'webkitVibrate' : null;

    function createSvgElement(name) {
        return document.createElementNS(svgNS, name);
    }

    function leadingZero(num) {
        return (num < 10 ? '0' : '') + num;
    }

    // Mousedown or touchstart
    function mousedown(e, space) {
        var self = this,
            options = this.options,
            plate = this.plate,
            offset = plate.offset(),
            isTouch = /^touch/.test(e.type),
            x0 = offset.left + dialRadius,
            y0 = offset.top + dialRadius,
            dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
            dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
            z = Math.sqrt(dx * dx + dy * dy),
            moved = false;

        // When clicking on minutes view space, check the mouse position
        if (space && (z < outerRadius - tickRadius || z > outerRadius + tickRadius))
            return;
        e.preventDefault();

        // Set cursor style of body after 200ms
        var movingTimer = setTimeout(function () {
            self.popover.addClass('clockpicker-moving');
        }, 200);

        // Place the canvas to top
        if (svgSupported)
            plate.append(self.canvas);

        var setHand = true;

        // Clock
        setHand = self.setHand(dx, dy, !space, true);

        // Mousemove on document
        $doc.off(mousemoveEvent).on(mousemoveEvent, function (e) {
            e.preventDefault();
            var isTouch = /^touch/.test(e.type),
                x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
                y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
            if (!moved && x === dx && y === dy)
            // Clicking in chrome on windows will trigger a mousemove event
                return;
            moved = true;
            setHand = self.setHand(x, y, false, true);
        });

        // Mouseup on document
        $doc.off(mouseupEvent).on(mouseupEvent, function (e) {
            $doc.off(mouseupEvent);
            e.preventDefault();
            var isTouch = /^touch/.test(e.type),
                x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
                y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
            if ((space || moved) && x === dx && y === dy) {
                setHand = self.setHand(x, y);
            }
            if (self.currentView === 'hours') {
                if (setHand) {
                    if (options.interval !== 60) { // skip
                        self.toggleView('minutes', duration / 2);
                    } else {
                        self.done();
                    }
                } else {
                    raiseCallback(self, 'invalidHour');
                }
            } else {
                if (options.autoclose && setHand) {
                    self.minutesView.addClass('clockpicker-dial-out');
                    setTimeout(function () {
                        self.done();
                    }, duration / 2);
                } else {
                    if (!setHand) {
                        raiseCallback(self, 'invalidMinute');
                    }
                }
            }
            plate.prepend(self.canvas);

            // Reset cursor style of body
            clearTimeout(movingTimer);
            self.popover.removeClass('clockpicker-moving');

            // Unbind mousemove event
            $doc.off(mousemoveEvent);
        });
    }
    // Get a unique id
    var idCounter = 0;

    function uniqueId(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    }

    function raiseCallback(context, eventName) {
        var callbackFunction = context.options[eventName];
        if (callbackFunction && typeof callbackFunction === "function" && !context.attachedCallBack[eventName]) {
            callbackFunction.call(context.input,
                $.Event(eventName, {
                    currentTarget: context.input[0],
                    delegateTarget: context.input[0],
                    namespace: "clockpicker",
                    target: context.input[0]
                }),
                context);
        }
        context.input.trigger(eventName + '.clockpicker', context);
    }

    // Clock size
    var dialRadius = 135,
        outerRadius = 110,
        // innerRadius = 80 on 12 hour clock
        innerRadius = 80,
        tickRadius = 20,
        diameter = (dialRadius * 2),
        duration = transitionSupported ? 350 : 1;

    // Popover template
    var tpl = [
        '<div class="clockpicker picker">',
            '<div class="picker__holder">',
                '<div class="picker__frame">',
                    '<div class="picker__wrap">',
                        '<div class="picker__box">',
                            '<div class="picker__date-display">',
                                '<div class="clockpicker-display">',
                                    '<div class="clockpicker-display-column">',
                                        '<span class="clockpicker-span-hours text-primary"></span>',
                                        ':',
                                        '<span class="clockpicker-span-minutes"></span>',
                                    '</div>',
                                    '<div class="clockpicker-display-column clockpicker-display-am-pm">',
                                    '<div class="clockpicker-span-am-pm"></div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="picker__calendar-container">',
                                '<div class="clockpicker-plate">',
                                '<div class="clockpicker-canvas"></div>',
                                '<div class="clockpicker-dial clockpicker-hours"></div>',
                                '<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>',
                            '</div>',
                                '<div class="clockpicker-am-pm-block">',
                                '</div>',
                            '</div>',
                            '<div class="picker__footer">',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    // Time prototype
    window.Time = function Time(time) {
        this.time = Time.parse(time || 'now');
    };
    Time.parse = function (time) {

        if (time instanceof Date) {
            return [time.getHours(), time.getMinutes()];
        }
        if (Array.isArray(time)) {
            return time;
        }
        if ($.isNumeric(time)) {
            var now = new Date();
            var h = now.getHours() + (+time);
            if (h > 23) {
                h = h % 24;
            }
            if (h < -23) {
                h = (h % 24);
            }
            if (h < 0) {
                h = 24 + h;
            }
            return [h, now.getMinutes()];
        }
        if (typeof time === 'string') {
            if (time === 'now') {
                return Time.now();
            }
            var a = /(\d{1,2}):(\d{1,2})(\s*)(AM|PM)?/gi.exec(time);
            if (a) {
                if (a[4]) {
                    if (a[4] === 'PM') {
                        a[1] = +a[1] + 12;
                    }
                }
                return [+a[1], +a[2]];
            }
            return [0, 0];
        }
        return 'Parse error';
    };
    Time.now = function() {
        var now = new Date();
        return [now.getHours(), now.getMinutes()];
    };
    Time.prototype.getHours = function () {
        return this.time[0];
    };
    Time.prototype.setHours = function (h) {
        this.time[0] = h;
        return this;
    };
    Time.prototype.isPm = function() {
        return this.time[0] > 11;
    };
    Time.prototype.getTwelveHours = function() {
        var value = this.time[0];
        if (this.twelvehour) {
            if (value > 12)
                value -= 12;
            if (value === 0)
                value = 12;
        }
        return value;
    };

    Time.prototype.getMinutes = function() {
        return this.time[1];
    };
    Time.prototype.setMinutes = function (m) {
        this.time[1] = m;
        return this;
    };
    Time.prototype.toString = function() {
        var time = this.time;
        if (this.twelvehour) {
            if (time[0] < 13) {
                return leadingZero(time[0]) +':'+ leadingZero(time[1]) +' AM';
            } else {
                return leadingZero((time[0] - 12)) +':'+ leadingZero(time[1]) +' PM';
            }
        } else {
            return leadingZero(time[0]) +':'+ leadingZero(time[1]);
        }
    };

    // ClockPicker
    function ClockPicker(element, options) {
        var popover = $(tpl),
            plate = popover.find('.clockpicker-plate'),
            hoursView = popover.find('.clockpicker-hours'),
            minutesView = popover.find('.clockpicker-minutes'),
            amPmBlock = popover.find('.clockpicker-am-pm-block'),
            isInput = element.prop('tagName') === 'INPUT',
            input = isInput ? element : element.find('input'),
            label = $("label[for=" + input.attr("id") + "]"),
            self = this;
        this.id = uniqueId('cp');
        this.element = element;
        this.options = options;
        this.isAppended = false;
        this.isShown = false;
        this.currentView = 'hours';
        this.isInput = isInput;
        this.input = input;
        this.label = label;
        this.popover = popover;
        this.plate = plate;
        this.hoursView = hoursView;
        this.minutesView = minutesView;
        this.$aHours = [];
        this.$aMinutes = [];
        this.amPmBlock = amPmBlock;
        this.spanHours = popover.find('.clockpicker-span-hours');
        this.spanMinutes = popover.find('.clockpicker-span-minutes');
        this.spanAmPm = popover.find('.clockpicker-span-am-pm');
        this.footer = popover.find('.picker__footer');
        this.amOrPm = "PM";
        this.attachedCallBack = [];

        this._parseTimeRestrictions();

        //force input to type ( disable type=time )
        input.attr('type', 'text');

        this.spanHours.click($.proxy(this.toggleView, this, 'hours'));
        this.spanMinutes.click($.proxy(this.toggleView, this, 'minutes'));

        var time = this.time = new Time(input.val());
        if (this.isValidTime(time.getHours(), time.getMinutes()) !== true) {
            this.input.val('');
        }

        // Show or toggle
        input.on('focus.clockpicker click.clockpicker', $.proxy(this.show, this));

        this.render('amPm');

        this.doneBtn = $('<button type="button" class="btn-flat clockpicker-button" tabindex="' + (options.twelvehour ? '3' : '1') + '">' + options.donetext + '</button>').click($.proxy(this.done, this)).appendTo(this.footer);

        if (options.darktheme) {
            popover.addClass('darktheme');
        }

        this.render('hours');

        this.render('minutes');

        // Clicking on minutes view space
        plate.on(mousedownEvent, function (e) {
            if ($(e.target).closest('.clockpicker-tick').length === 0)
                mousedown.call(self, e, true);
        });

        if (svgSupported) {
            // Draw clock hands and others
            var canvas = popover.find('.clockpicker-canvas').empty(),
                svg = createSvgElement('svg');
            svg.setAttribute('class', 'clockpicker-svg');
            svg.setAttribute('width', diameter);
            svg.setAttribute('height', diameter);
            var g = createSvgElement('g');
            g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
            var bearing = createSvgElement('circle');
            bearing.setAttribute('class', 'clockpicker-canvas-bearing');
            bearing.setAttribute('cx', 0);
            bearing.setAttribute('cy', 0);
            bearing.setAttribute('r', 2);
            var hand = createSvgElement('line');
            hand.setAttribute('x1', 0);
            hand.setAttribute('y1', 0);
            var bg = createSvgElement('circle');
            bg.setAttribute('class', 'clockpicker-canvas-bg');
            bg.setAttribute('r', tickRadius);
            var fg = createSvgElement('circle');
            fg.setAttribute('class', 'clockpicker-canvas-fg');
            fg.setAttribute('r', 5);
            g.appendChild(hand);
            g.appendChild(bg);
            g.appendChild(fg);
            g.appendChild(bearing);
            svg.appendChild(g);
            canvas.append(svg);

            this.hand = hand;
            this.bg = bg;
            this.fg = fg;
            this.bearing = bearing;
            this.g = g;
            this.canvas = canvas;
        }

        raiseCallback(this, 'init');
    }

    // Default options
    ClockPicker.DEFAULTS = {
        'default': '',         // default time, 'now' or '13:14' e.g.
        fromnow: 0,            // set default time to * milliseconds from now (using with default = 'now')
        donetext: 'Done',      // done button text
        autoclose: false,      // auto close when minute is selected
        ampmclickable: false,  // set am/pm button on itself
        darktheme: false,			 // set to dark theme
        twelvehour: true,      // change to 12 hour AM/PM clock from 24 hour
        vibrate: true,          // vibrate the device when dragging clock hand
        dismissible: true,		// dismissable
        interval: false,		// set a time interval in minute / if 60, skip minute picker
        min: false,				// set the min time. ex: [13, 30] for 13:30
        max: false,				// set the max time. ex: [18, 30] for 18:30
        disable: false			// disable time value. ex: [[8,30],[12],[14,0],[null,15]] for 8:30, 12:**, 14:30 and **:15
    };

    ClockPicker.prototype.render = function(view) {
        var options = this.options,
            self = this,
            hoursView = this.hoursView,
            minutesView = this.minutesView;
        // Build ticks
        var tickTpl = $('<div class="clockpicker-tick"></div>'),
            i, t, tick, radian, radius;

        if (view === 'hours') {
            hoursView.empty();
            this.$aHours = [];
            // Hours view
            for (i = 0; i < 24; i += 1) {
                tick = tickTpl.clone();
                t = i;

                this.$aHours.push(tick);

                if (this.isValidTime(i) !== true) {
                    tick.addClass('disabled');
                }

                radian = i / 6 * Math.PI;
                var inner = i > 0 && i < 13;
                if (options.twelvehour) {
                    radius = outerRadius;
                    if (i >= 12) {
                        t = i - 12;
                        tick.addClass('pm');
                    } else {
                        tick.addClass('am');
                    }
                    if (t === 0) {
                        t = 12;
                    }
                } else {
                    radius = inner ? innerRadius : outerRadius;
                    if (inner)
                        tick.css('font-size', '120%');
                }
                tick.css({
                    left: dialRadius + Math.sin(radian) * radius - tickRadius,
                    top: dialRadius - Math.cos(radian) * radius - tickRadius
                });
                tick.html(t === 0 ? '00' : t);
                hoursView.append(tick);
                tick.on(mousedownEvent, $.proxy(mousedown, this));
            }
        }
        if (view === 'minutes') {
            minutesView.empty();
            this.$aMinutes = [];
            // Minutes view
            for (i = 0; i < 60; i += 5) {
                tick = tickTpl.clone();

                this.$aMinutes.push(tick);

                if (this.isValidTime(null, i) !== true) {
                    tick.addClass('disabled interval');
                }
                // if (!options.)
                radian = i / 30 * Math.PI;
                tick.css({
                    left: dialRadius + Math.sin(radian) * outerRadius - tickRadius,
                    top: dialRadius - Math.cos(radian) * outerRadius - tickRadius
                });
                tick.css('font-size', '140%');
                tick.html(leadingZero(i));
                minutesView.append(tick);
                tick.on(mousedownEvent, $.proxy(mousedown, this));
            }
        }
        if (view === 'amPm') {
            this.amPmBlock.empty();
            this.spanAmPm.empty();
            // Setup for for 12 hour clock if option is selected
            if (options.twelvehour) {
                this.hoursView.addClass('twelvehour');
                if (!options.ampmclickable) {
                    $('<button type="button" class="btn-floating btn-flat clockpicker-button am-button" tabindex="1">' + "AM" + '</button>').on("click", function () {
                        self.setAMorPM("am");
                        self.amPmBlock.children('.pm-button').removeClass('active');
                        self.amPmBlock.children('.am-button').addClass('active');
                        self.spanAmPm.empty().append('AM');
                    }).appendTo(this.amPmBlock);
                    $('<button type="button" class="btn-floating btn-flat clockpicker-button pm-button" tabindex="2">' + "PM" + '</button>').on("click", function () {
                        self.setAMorPM("pm");
                        self.amPmBlock.children('.am-button').removeClass('active');
                        self.amPmBlock.children('.pm-button').addClass('active');
                        self.spanAmPm.empty().append('PM');
                    }).appendTo(this.amPmBlock);
                } else {
                    $('<div id="click-am">AM</div>').on("click", function () {
                        self.spanAmPm.children('#click-am').addClass("text-primary");
                        self.spanAmPm.children('#click-pm').removeClass("text-primary");
                        self.amOrPm = "AM";
                    }).appendTo(this.spanAmPm);
                    $('<div id="click-pm">PM</div>').on("click", function () {
                        self.spanAmPm.children('#click-pm').addClass("text-primary");
                        self.spanAmPm.children('#click-am').removeClass("text-primary");
                        self.amOrPm = 'PM';
                    }).appendTo(this.spanAmPm);
                }
            } else {
                this.hoursView.removeClass('twelvehour');
            }
        }
    };

    ClockPicker.prototype._refreshAvailable = function(view) {
        var self = this;
        if (view === 'hours') {
            this.$aHours.forEach(function ($hour, index) {
                if (self.isValidTime(index) !== true) {
                    $hour.addClass('disabled');
                } else {
                    $hour.removeClass('disabled');
                }
            });
        }
        if (view === 'minutes') {
            this.$aMinutes.forEach(function ($minute, index) {
                if ($minute.hasClass('disabled interval')) {
                    return;
                }
                if (self.isValidTime(self.time.getHours(), (index * 5)) !== true) {
                    $minute.addClass('disabled');
                } else {
                    $minute.removeClass('disabled');
                }
            });
        }
    };
    // Show or hide popover
    ClockPicker.prototype.toggle = function () {
        this[this.isShown ? 'hide' : 'show']();
    };

    ClockPicker.prototype._parseTimeRestrictions = function() {
        if (this.options.min && !Array.isArray(this.options.min)) {
            this.options.min = Time.parse(this.options.min);
        }
        if (this.options.max&& !Array.isArray(this.options.max)) {
            this.options.max = Time.parse(this.options.max);
        }
        if (this.options.disable && Array.isArray(this.options.max)) {
            this.options.disable = this.options.disable.map(Time.parse);
        }
    };

    ClockPicker.prototype._optionRefresh = function(optName) {
        var optVal = this.options[optName];
        if (optName === 'donetext') {
            this.doneBtn.text(optVal);
        }
        if (optName === 'ampmclickable') {
            this.render('amPm');
            this.setAMorPM(this.time.isPm() ? 'pm' : 'am');
        }
        if (optName === 'darktheme') {
            if (optVal) {
                this.popover.addClass('darktheme');
            } else {
                this.popover.removeClass('darktheme');
            }
        }
        if (optName === 'twelvehour') {
            this.render('amPm');
            this.render('hours');
            this.setAMorPM(this.time.isPm() ? 'pm' : 'am');
        }
        var aRestrinction = ['min','max','disable','interval'];
        if (aRestrinction.indexOf(optName) !== -1) {
            this._parseTimeRestrictions();
            this._refreshAvailable('hours');
            if (this.currentView === 'minutes') {
                this._refreshAvailable('minutes');
            }
        }
        return this;
    };

    ClockPicker.prototype.set = function (optName, value) {
        var self = this;
        if ($.isPlainObject(optName)) {
            $.each(optName, function(k, v) {
                self.set(k, v);
            });
        } else {
            this.options[optName] = value;
            this._optionRefresh(optName);
        }
    };

    ClockPicker.prototype.options = function (oOptions) {
        var self = this;
        $.extend(this.options, oOptions);
        $.each(oOptions, function(optName) {
            self._optionRefresh(optName);
        });
    };

    // Set popover position
    ClockPicker.prototype.locate = function () {
        this.popover.show();
    };

    ClockPicker.prototype.isValidTime = function (h, m) {
        var self = this;
        function handleError(error) {
            self.error = error;
            return error;
        }
        // h only
        if (h !== null && m === undefined) {
            if (this.options.min && this.options.min[0] > h) {
                return handleError('Mimimum');
            }
            if (this.options.max && this.options.max[0] < h) {
                return handleError('Maximum');
            }
            if (this.options.disable && this.options.disable.some(function (v) {
                    return v[0] === h && v[1] === undefined;
                })) {
                return handleError('Disabled time');
            }
        }
        // m only
        if (m !== undefined) {
            if (this.options.interval && m % this.options.interval !== 0) {
                return handleError('Out of interval');
            }
            if (this.options.interval && m % this.options.interval !== 0) {
                return handleError('Out of interval');
            }
            if (this.options.disable && this.options.disable.some(function (v) {
                    return v[0] === null && v[1] === m;
                })) {
                return handleError('Disabled time');
            }
        }
        // h & m
        if (h !== null && m !== undefined) {
            if (this.options.min && (this.options.min[0] > h || this.options.min[0] === h&& this.options.min[1] > m)) {
                return handleError('Minimum');
            }
            if (this.options.max && (this.options.max[0] < h  || this.options.min[0] === h && this.options.max[1] < m)) {
                return handleError('Maximum');
            }
            if (this.options.disable && this.options.disable.some(function (v) {
                    return (v[0] === h && v[1] === m ||
                    v[0] === h && v[1] === undefined ||
                    v[0] === null && v[1] === m);
                })) {
                return handleError('Disabled time');
            }
        }

        return true;
    };

    ClockPicker.prototype.setAMorPM = function (option) {
        var active = option;
        if (option.toUpperCase() !== this.amOrPm) {
            var hours = 0;
            if (active === 'pm') {
                hours = this.time.getHours() + 12;
            } else {
                hours = this.time.getHours() - 12;
            }
            this.time.setHours(hours);
        }
        var inactive = (option === "pm" ? "am" : "pm");
        this.hoursView.addClass(active).removeClass(inactive);
        if (this.options.twelvehour) {
            if (this.currentView === 'minutes') {
                this._refreshAvailable(this.currentView);
            }
            this.amOrPm = active.toUpperCase();
            if (!this.options.ampmclickable) {
                this.amPmBlock.children('.' + inactive + '-button').removeClass('active');
                this.amPmBlock.children('.' + active + '-button').addClass('active');
                this.spanAmPm.empty().append(this.amOrPm);
            } else {
                this.spanAmPm.children('#click-' + active + '').addClass("text-primary");
                this.spanAmPm.children('#click-' + inactive + '').removeClass("text-primary");
            }
        }
    };

    // Show popover
    ClockPicker.prototype.show = function () {
        // Not show again
        if (this.isShown) {
            return;
        }
        raiseCallback(this, 'beforeShow');
        $(':input').each(function () {
            $(this).attr('tabindex', -1);
        });
        var self = this;
        // Initialize
        this.input.blur();
        this.popover.addClass('picker--opened');
        this.input.addClass('picker__input picker__input--active');
        $(document.body).css('overflow', 'hidden');
        if (!this.isAppended) {
            // Append popover to options.container
            if (this.options.hasOwnProperty('container'))
                this.popover.appendTo(this.options.container);
            else
                this.popover.insertAfter(this.input);
            this.setAMorPM("pm");
            // Reset position when resize
            $win.on('resize.clockpicker' + this.id, function () {
                if (self.isShown) {
                    self.locate();
                }
            });
            this.isAppended = true;
        }
        // Get the time
        var time = this.time = new Time(this.input.val() || this.options['default'] || 'now');

        if (this.isValidTime(null, time.getMinutes()) !== true) {
            time.setMinutes(0);
        }
        if (this.isValidTime(time.getHours(), time.getMinutes()) !== true) {
            this.input.val('');
            time.time = Time.now();
        }
        if (this.options.twelvehour) {
            time.twelvehour = true;
            if (time.isPm())
                this.setAMorPM("pm");
            else
                this.setAMorPM("am");
        }

        this.spanHours.html(leadingZero(time.getTwelveHours()));
        this.spanMinutes.html(leadingZero(time.getMinutes()));

        // Toggle to hours view
        this.toggleView('hours');
        // Set position
        this.locate();
        this.isShown = true;
        // Hide when clicking or tabbing on any element except the clock and input
        $doc.on('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id, function (e) {
            var target = $(e.target);
            if (target.closest(self.popover.find('.picker__wrap')).length === 0 && target.closest(self.input).length === 0 && self.options.dismissible) {
                self.hide();
            }
        });
        // Hide when ESC is pressed
        $doc.on('keyup.clockpicker.' + this.id, function (e) {
            if (e.keyCode === 27)
                self.hide();
        });
        raiseCallback(this, 'afterShow');
    };
    // Hide popover
    ClockPicker.prototype.hide = function () {
        raiseCallback(this, 'beforeHide');
        this.input.removeClass('picker__input picker__input--active');
        this.popover.removeClass('picker--opened');
        $(document.body).css('overflow', 'visible');
        this.isShown = false;
        $(':input').each(function (index) {
            $(this).attr('tabindex', index + 1);
        });
        // Unbinding events on document
        $doc.off('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id);
        $doc.off('keyup.clockpicker.' + this.id);
        this.popover.hide();
        raiseCallback(this, 'afterHide');
    };
    // Toggle to hours or minutes view
    ClockPicker.prototype.toggleView = function (view, delay) {
        var self = this;
        var raiseAfterHourSelect = false;
        if (view === 'minutes' && $(this.hoursView).css("visibility") === "visible") {
            raiseCallback(this, 'beforeHourSelect');
            self._refreshAvailable(view);
            raiseAfterHourSelect = true;
        }
        var isHours = view === 'hours',
            nextView = isHours ? this.hoursView : this.minutesView,
            hideView = isHours ? this.minutesView : this.hoursView;
        this.currentView = view;

        this.spanHours.toggleClass('text-primary', isHours);
        this.spanMinutes.toggleClass('text-primary', !isHours);

        // Let's make transitions
        hideView.addClass('clockpicker-dial-out');
        nextView.css('visibility', 'visible').removeClass('clockpicker-dial-out');

        // Reset clock hand
        this.resetClock(delay);
        // After transitions ended
        clearTimeout(this.toggleViewTimer);
        this.toggleViewTimer = setTimeout(function () {
            hideView.css('visibility', 'hidden');
        }, duration);

        if (raiseAfterHourSelect)
            raiseCallback(this, 'afterHourSelect');
    };

    // Reset clock hand
    ClockPicker.prototype.resetClock = function (delay) {
        var view = this.currentView,
            isHours = view === 'hours',
            value = (isHours ? this.time.getHours() : this.time.getMinutes()),
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
            x = Math.sin(radian) * radius,
            y = -Math.cos(radian) * radius,
            self = this;

        if (svgSupported && delay) {
            self.canvas.addClass('clockpicker-canvas-out');
            setTimeout(function () {
                self.canvas.removeClass('clockpicker-canvas-out');
                if (!self.setHand(x, y)) {
                    self.resetHand();
                }
            }, delay);
        } else {
            if (!this.setHand(x, y)) {
                this.resetHand();
            }
        }
    };

    ClockPicker.prototype.resetHand = function () {
        this.hand.setAttribute('x2', 0);
        this.hand.setAttribute('y2', 0);
        this.bg.setAttribute('cx', 0);
        this.bg.setAttribute('cy', 0);
        this.fg.setAttribute('cx', 0);
        this.fg.setAttribute('cy', 0);
    };

    // Set clock hand to (x, y)
    ClockPicker.prototype.setHand = function (x, y, roundBy5, dragging) {
        var radian = Math.atan2(x, -y),
            isHours = this.currentView === 'hours',
            unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
            z = Math.sqrt(x * x + y * y),
            options = this.options,
            inner = isHours && z < (outerRadius + innerRadius) / 2,
            radius = inner ? innerRadius : outerRadius,
            vText = '',
            value;

        if (options.twelvehour)
            radius = outerRadius;

        // Radian should in range [0, 2PI]
        if (radian < 0)
            radian = Math.PI * 2 + radian;

        // Get the round value
        value = Math.round(radian / unit);

        // Get the round radian
        radian = value * unit;

        // Correct the hours or minutes
        // if (options.twelvehour) {
        //     if (isHours) {
        //         if (value === 0)
        //             value = 12;
        //     } else {
        //         if (roundBy5)
        //             value *= 5;
        //         if (value === 60)
        //             value = 0;
        //     }
        // } else {
        if (isHours) {
            if (options.twelvehour) {
                if (this.amOrPm === "PM") {
                    value += 12;
                }
                if (value === 12 && this.amOrPm === "AM") {
                    value = 0;
                }
                if (value === 24)
                    value = 12;
            } else {
                if (value === 12)
                    value = 0;
                value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
            }

            if (this.isValidTime(value) !== true) {
                return false;
            }
            this.time.setHours(value);
            vText = this.time.getTwelveHours();
        } else {
            if (roundBy5)
                value *= 5;
            if (value === 60)
                value = 0;

            if (this.isValidTime(this.time.getHours(), value) !== true) {
                return false;
            }
            this.time.setMinutes(value);
            vText = value;
        }
        // }
        if (isHours)
            this.fg.setAttribute('class', 'clockpicker-canvas-fg');
        else {
            if (value % 5 === 0)
                this.fg.setAttribute('class', 'clockpicker-canvas-fg');
            else
                this.fg.setAttribute('class', 'clockpicker-canvas-fg active');
        }

        // Once hours or minutes changed, vibrate the device
        if (this[this.currentView] !== value)
            if (vibrate && this.options.vibrate)
            // Do not vibrate too frequently
                if (!this.vibrateTimer) {
                    navigator[vibrate](10);
                    this.vibrateTimer = setTimeout($.proxy(function () {
                        this.vibrateTimer = null;
                    }, this), 100);
                }

        this[this.currentView] = value;
        this[isHours ? 'spanHours' : 'spanMinutes'].html(leadingZero(vText));

        // If svg is not supported, just add an active class to the tick
        if (!svgSupported) {
            this[isHours ? 'hoursView' : 'minutesView'].find('.clockpicker-tick').each(function () {
                var tick = $(this);
                tick.toggleClass('active', value === +tick.html());
            });
            return true;
        }

        // Place clock hand at the top when dragging
        if (dragging || (!isHours && value % 5)) {
            this.g.insertBefore(this.hand, this.bearing);
            this.g.insertBefore(this.bg, this.fg);
            this.bg.setAttribute('class', 'clockpicker-canvas-bg clockpicker-canvas-bg-trans');
        } else {
            // Or place it at the bottom
            this.g.insertBefore(this.hand, this.bg);
            this.g.insertBefore(this.fg, this.bg);
            this.bg.setAttribute('class', 'clockpicker-canvas-bg');
        }

        // Set clock hand and others' position
        var cx1 = Math.sin(radian) * (radius - tickRadius),
            cy1 = -Math.cos(radian) * (radius - tickRadius),
            cx2 = Math.sin(radian) * radius,
            cy2 = -Math.cos(radian) * radius;
        this.hand.setAttribute('x2', cx1);
        this.hand.setAttribute('y2', cy1);
        this.bg.setAttribute('cx', cx2);
        this.bg.setAttribute('cy', cy2);
        this.fg.setAttribute('cx', cx2);
        this.fg.setAttribute('cy', cy2);
        return true;
    };

    // Hours and minutes are selected
    ClockPicker.prototype.done = function () {
        var time = this.time;
        raiseCallback(this, 'beforeDone');
        if (this.isValidTime(time.getHours(), time.getMinutes()) !== true) {
            raiseCallback(this,'invalidTime');
            return;
        }
        this.hide();
        this.label.addClass('active');

        var last = this.input.val(),
            value = time.toString();

        this.input.val(value);
        if (value !== last) {
            this.input.triggerHandler('change');
            if (!this.isInput)
                this.element.trigger('change');
        }

        if (this.options.autoclose)
            this.input.trigger('blur');

        raiseCallback(this, 'afterDone');
    };

    // Remove clockpicker from input
    ClockPicker.prototype.remove = function () {
        this.element.removeData('clockpicker');
        this.input.off('focus.clockpicker click.clockpicker');
        if (this.isShown)
            this.hide();
        if (this.isAppended) {
            $win.off('resize.clockpicker' + this.id);
            this.popover.remove();
        }
    };

    // Extends $.fn.clockpicker
    $.fn.pickatime = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        var componentData = this.data( 'clockpicker' );

        if ( componentData && (option === 'picker' || option === undefined)) {
            return componentData
        }

        var options;
        return this.each(function () {
            var $this = $(this),
                data = $this.data('clockpicker');
            if (!data) {
                options = $.extend({}, ClockPicker.DEFAULTS, $this.data(), typeof option === 'object' && option);
                $this.data('clockpicker', new ClockPicker($this, options));
            } else {
                if ($.isPlainObject(option)) { // case recall with new parameters
                    data.set(option);
                }
                // Manual operatsions. show, hide, remove, e.g.
                if (typeof data[option] === 'function')
                    data[option].apply(data, args);
            }
        });
    };
    $.fn.pickatime.defaults = ClockPicker.DEFAULTS;
}());
