/**
 * Module that handles the random event system
 */
var Events = {

    _EVENT_TIME_RANGE: [1.5, 3], // range, in minutes
    _PANEL_FADE: 200,

    init: function(options) {
        this.options = $.extend(
            this.options,
            options
        );

        // Build the Event Pool
        Events.EventPool = new Array().concat(
            Events.Shopping
        );

        Events.eventStack = [];

        Events.scheduleNextEvent();

        //subscribe to stateUpdates
        $.Dispatch('stateUpdate').subscribe(Events.handleStateUpdates);
    },

    options: {}, // Nothing for now

    activeEvent: null,
    activeScene: null,
    eventPanel: null,

    loadScene: function(name) {
        Engine.log('loading scene: ' + name);
        Events.activeScene = name;
        var scene = Events.activeEvent().scenes[name];

        // Scene reward
        if (scene.reward) {
            $SM.addM('stores', scene.reward);
        }

        // onLoad
        if (scene.onLoad) {
            scene.onLoad();
        }

        // Notify the scene change
        if (scene.notification) {
            Notifications.notify(null, scene.notification);
        }

        $('#description', Events.eventPanel()).empty();
        $('#buttons', Events.eventPanel()).empty();
        Events.startStory(scene);

    },





    startStory: function(scene) {
        // Write the text
        var desc = $('#description', Events.eventPanel());
        for (var i in scene.text) {
            $('<div>').text(scene.text[i]).appendTo(desc);
        }


        // Draw the buttons
        Events.drawButtons(scene);
    },

    drawButtons: function(scene) {
        var btns = $('#buttons', Events.eventPanel());
        for (var id in scene.buttons) {
            var info = scene.buttons[id];
            var b = new Button.Button({
                id: id,
                text: info.text,
                cost: info.cost,
                click: Events.buttonClick
            }).appendTo(btns);
            if (typeof info.available == 'function' && !info.available()) {
                Button.setDisabled(b, true);
            }
        }

        Events.updateButtons();
    },

    updateButtons: function() {
        var btns = Events.activeEvent().scenes[Events.activeScene].buttons;
        for (var bId in btns) {
            var b = btns[bId];
            var btnEl = $('#' + bId, Events.eventPanel());
            if (typeof b.available == 'function' && !b.available()) {
                Button.setDisabled(btnEl, true);
            } else if (b.cost) {
                var disabled = false;
                for (var store in b.cost) {
                    // var num = Engine.activeModule == $SM.get('stores["' + store + '"]', true);
                    // if (typeof num != 'number') num = 0;
                    if ($SM.get('stores["' + store + '"]') < b.cost[store]) {
                        // Too expensive
                        disabled = true;
                        break;
                    }
                }
                Button.setDisabled(btnEl, disabled);
            }
        }
    },

    buttonClick: function(btn) {
        var info = Events.activeEvent().scenes[Events.activeScene].buttons[btn.attr('id')];
        // Cost
        var costMod = {};
        if (info.cost) {
            for (var store in info.cost) {
                var num = Engine.activeModule == $SM.get('stores["' + store + '"]', true);
                if (typeof num != 'number') num = 0;
                if ($SM.get('stores["' + store + '"]') < info.cost[store]) {
                    // Too expensive
                    return;
                }
                costMod[store] = -info.cost[store];
            }
            if (Engine.activeModule != Shopping) {
                for (var k in costMod) {
                    Path.outfit[k] += costMod[k];
                }
                World.updateSupplies();
            } else {
                $SM.addM('stores', costMod);
            }
        }

        if (typeof info.onChoose == 'function') {
            info.onChoose();
        }

        // Reward
        if (info.reward) {
            $SM.addM('stores', info.reward);
        }

        Events.updateButtons();

        // Notification
        if (info.notification) {
            Notifications.notify(null, info.notification);
        }

        // Next Scene
        if (info.nextScene) {
            if (info.nextScene == 'end') {
                Events.endEvent();
            } else {
                var r = Math.random();
                var lowestMatch = null;
                for (var i in info.nextScene) {
                    if (r < i && (lowestMatch == null || i < lowestMatch)) {
                        lowestMatch = i;
                    }
                }
                if (lowestMatch != null) {
                    Events.loadScene(info.nextScene[lowestMatch]);
                    return;
                }
                Engine.log('ERROR: no suitable scene found');
                Events.endEvent();
            }
        }
    },

    // Makes an event happen!
    triggerEvent: function() {
        if (Events.activeEvent() == null) {
            var possibleEvents = [];
            for (var i in Events.EventPool) {
                var event = Events.EventPool[i];
                if (event.isAvailable()) {
                    possibleEvents.push(event);
                }
            }

            if (possibleEvents.length == 0) {
                Events.scheduleNextEvent(0.5);
                return;
            } else {
                var r = Math.floor(Math.random() * (possibleEvents.length));
                Events.startEvent(possibleEvents[r]);
            }
        }

        Events.scheduleNextEvent();
    },



    activeEvent: function() {
        if (Events.eventStack && Events.eventStack.length > 0) {
            return Events.eventStack[0];
        }
        return null;
    },

    eventPanel: function() {
        return Events.activeEvent().eventPanel;
    },

    startEvent: function(event, options) {
        if (event) {
            Engine.event('game event', 'event');
            Engine.keyLock = true;
            Events.eventStack.unshift(event);
            event.eventPanel = $('<div>').attr('id', 'event').addClass('eventPanel').css('opacity', '0');
            if (options != null && options.width != null) {
                Events.eventPanel().css('width', options.width);
            }
            $('<div>').addClass('eventTitle').text(Events.activeEvent().title).appendTo(Events.eventPanel());
            $('<div>').attr('id', 'description').appendTo(Events.eventPanel());
            $('<div>').attr('id', 'buttons').appendTo(Events.eventPanel());
            Events.loadScene('start');
            $('div#wrapper').append(Events.eventPanel());
            Events.eventPanel().animate({ opacity: 1 }, Events._PANEL_FADE, 'linear');
        }
    },

    scheduleNextEvent: function(scale) {
        var nextEvent = Math.floor(Math.random() * (Events._EVENT_TIME_RANGE[1] - Events._EVENT_TIME_RANGE[0])) + Events._EVENT_TIME_RANGE[0];
        if (scale > 0) { nextEvent *= scale; }
        Engine.log('next event scheduled in ' + nextEvent + ' minutes');
        Events._eventTimeout = setTimeout(Events.triggerEvent, nextEvent * 60 * 1000);
    },

    endEvent: function() {
        Events.eventPanel().animate({ opacity: 0 }, Events._PANEL_FADE, 'linear', function() {
            Events.eventPanel().remove();
            Events.activeEvent().eventPanel = null;
            Events.eventStack.shift();
            Engine.log(Events.eventStack.length + ' events remaining');
            Engine.keyLock = false;
            // Force refocus on the body. I hate you, IE.
            $('body').focus();
        });
    },

    handleStateUpdates: function(e) {
        if (e.category == 'stores' && Events.activeEvent() != null) {
            Events.updateButtons();
        }
    }
};