var Engine = {

    /* TODO *** MICHAEL IS A LAZY BASTARD AND DOES NOT WANT TO REFACTOR ***
     * Here is what he should be doing:
     * 	- All updating values (store numbers, incomes, etc...) should be objects that can register listeners to
     * 	  value-change events. These events should be fired whenever a value (or group of values, I suppose) is updated.
     * 	  That would be so elegant and awesome.
     */
    SITE_URL: encodeURIComponent(""),
    VERSION: 1.3,
    MAX_STORE: 99999999999999,
    SAVE_DISPLAY: 30 * 1000,

    //object event types
    topics: {},

    options: {
        state: null,
        debug: true,
        log: true
    },

    init: function(options) {
        this.options = $.extend(
            this.options,
            options
        );
        this._debug = this.options.debug;
        this._log = this.options.log;


        if (this.options.state != null) {
            window.State = this.options.state;
        } else {
            Engine.loadGame();
        }

        $('<div>').attr('id', 'locationSlider').appendTo('#main');

        $('<span>')
            .addClass('deleteSave')
            .text('restart.')
            .click(Engine.confirmDelete)
            .appendTo('body');

        $('<div>')
            .addClass('share')
            .text('share.')
            .click(Engine.share)
            .appendTo('body');


        //subscribe to stateUpdates
        $.Dispatch('stateUpdate').subscribe(Engine.handleStateUpdates);

        $SM.init();
        Notifications.init();
        Events.init();
        Shopping.init();

        if ($SM.get('stores.bateria')) {

        }


        Engine.travelTo(Shopping);

    },

    saveGame: function() {
        if (typeof Storage != 'undefined' && localStorage) {
            if (Engine._saveTimer != null) {
                clearTimeout(Engine._saveTimer);
            }
            if (typeof Engine._lastNotify == 'undefined' || Date.now() - Engine._lastNotify > Engine.SAVE_DISPLAY) {
                $('#saveNotify').css('opacity', 1).animate({ opacity: 0 }, 1000, 'linear');
                Engine._lastNotify = Date.now();
            }
            //localStorage.gameState = JSON.stringify(State);
        }
    },

    loadGame: function() {
        try {
            var savedState = JSON.parse(localStorage.gameState);
            if (savedState) {
                State = savedState;
                $SM.updateOldState();
                Engine.log("loaded save!");
            }
        } catch (e) {
            State = {};
            $SM.set('version', Engine.VERSION);
            Engine.event('progress', 'new game');
            $SM.add('stores.bateria', 7);
            $SM.add('stores.energia', 20);
            $SM.set('stores.hamburguer', 1);
            $SM.set('stores.escada', 0)

        }
    },

    event: function(cat, act) {
        if (typeof ga === 'function') {
            ga('send', 'event', cat, act);
        }
    },

    confirmDelete: function() {
        Events.startEvent({
            title: 'Restart?',
            scenes: {
                start: {
                    text: ['restart the game?'],
                    buttons: {
                        'yes': {
                            text: 'yes',
                            nextScene: 'end',
                            onChoose: Engine.deleteSave
                        },
                        'no': {
                            text: 'no',
                            nextScene: 'end'
                        }
                    }
                }
            }
        });
    },

    deleteSave: function() {
        if (typeof Storage != 'undefined' && localStorage) {
            localStorage.clear();
        }
        location.reload();
    },

    getGuid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    travelTo: function(module) {
        if (Engine.activeModule != module) {
            var currentIndex = Engine.activeModule ? $('.location').index(Engine.activeModule.panel) : 1;
            $('div.headerButton').removeClass('selected');
            module.tab.addClass('selected');

            //var slider = $('#locationSlider');
            var stores = $('#storesContainer');
            var panelIndex = $('.location').index(module.panel);
            var diff = Math.abs(panelIndex - currentIndex);
            //slider.animate({ left: -(panelIndex * 700) + 'px' }, 300 * diff);

            if ($SM.get('stores.bateria') != undefined) {
                // FIXME Why does this work if there's an animation queue...?
                stores.animate({ right: -(panelIndex * 700) + 'px' }, 300 * diff);
            }

            module.onArrival(diff);

            Engine.activeModule = module;

            Notifications.printQueue(module);
        }
    },

    moveStoresView: function(top_container, transition_diff) {
        var stores = $('#storesContainer');

        // If we don't have a storesContainer yet, leave.
        if (typeof(stores) === 'undefined') return;

        if (typeof(transition_diff) === 'undefined') transition_diff = 1;

        if (top_container === null) {
            stores.animate({ top: '0px' }, { queue: false, duration: 300 * transition_diff });
        } else if (!top_container.length) {
            stores.animate({ top: '0px' }, { queue: false, duration: 300 * transition_diff });
        } else {
            stores.animate({ top: top_container.height() + 26 + 'px' }, { queue: false, duration: 300 * transition_diff });
        }
    },
    log: function(msg) {
        if (this._log) {
            console.log(msg);
        }
    },

    getIncomeMsg: function(num, delay) {
        return (num > 0 ? "+" : "") + num + " per " + delay + "s";
    },

    handleStateUpdates: function(e) {

    }
}


$.Dispatch = function(id) {
    var callbacks,
        topic = id && Engine.topics[id];
    if (!topic) {
        callbacks = jQuery.Callbacks();
        topic = {
            publish: callbacks.fire,
            subscribe: callbacks.add,
            unsubscribe: callbacks.remove
        };
        if (id) {
            Engine.topics[id] = topic;
        }
    }
    return topic;
};

$(function() {
    Engine.init();
});