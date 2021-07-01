var Shopping = {
    _BATTERY_CHARGE_DELAY: 70,
    _FOOD_EAT_DELAY: 50,
    _CHARGE_COOLDOWN: 10,

    bateria: null,
    luz: null,
    buttons: {},

    Craftables: {
        'escada': {
            botao: null,
            maximum: 1,
            disponivelmsg: '',
            fazermsg: 'Você construiu uma escada',
            type: 'ferramenta',
            cost: function() {
                return {
                    'tecido': 30
                };
            },
        },

        'mochila': {
            botao: null,
            maximum: 1,
            disponivelmsg: '',
            fazermsg: '',
            type: 'ferramenta',
            cost: function() {
                return {
                    'tecido': 5
                };
            }
        }
    },

    name: "Shopping",
    init: function(options) {
        this.options = $.extend(
            this.options,
            options
        );
        //$SM.add('stores.bateria', 7);

        if (Engine._debug) {
            this._BATTERY_CHARGE_DELAY = 70;
            this._CHARGE_COOLDOWN = 0;
            this._FOOD_EAT_DELAY = 50;
        }

        Shopping.bateria = this.LanternEnum.Escuro;


        this.tab = Header.addLocation("O Shopping", "Shopping", Shopping);

        this.panel = $('<div>')
            .attr('id', "ShoppingPanel")
            .addClass('location')
            .appendTo('div#locationSlider');


        new Button.Button({
            id: 'ligarlanterna',
            text: 'Ligar Lanterna',
            click: Shopping.lightlantern,
            cooldown: Shopping._CHARGE_COOLDOWN,
            width: '80px',
            cost: { 'bateria': 4 }
        }).appendTo('div#ShoppingPanel');

        new Button.Button({
            id: 'rechargeButton',
            text: "Recarregar Lanterna",
            click: Shopping.rechargelantern,
            cooldown: Shopping._CHARGE_COOLDOWN,
            width: '80px',
            cost: { 'bateria': 1 }
        }).appendTo('div#ShoppingPanel');

        new Button.Button({
            id: 'foodButton',
            text: "Comer",
            click: Shopping.eatfood,
            cooldown: Shopping._CHARGE_COOLDOWN,
            width: '80px',
            cost: { 'hamburguer': 1 }
        }).appendTo('div#ShoppingPanel');

        $('<div>').attr('id', 'storesContainer').appendTo('div#ShoppingPanel');

        $.Dispatch('stateUpdate').subscribe(Shopping.handleStateUpdates);

        Shopping.updateButton();
        Shopping.updateStoresView();
        Shopping.updateIncomeView();
        Shopping.updateBuildButtons();

        Shopping._bateryTimer = setTimeout(Shopping.coolBateria, Shopping._BATTERY_CHARGE_DELAY);

        if ($SM.get('stores.bateria', true) < 0) {
            setTimeout(Shopping.unlockForest, Shopping._BATTERY_CHARGE_DELAY);
        }
        setTimeout($SM.collectIncome, 1000);

        Notifications.notify(Shopping, "A Lanterna está " + Shopping.bateria.text);
    },



    onArrival: function(transition_diff) {
        Shopping.setTitle();
        if (Shopping.changed) {
            Notifications.notify(Shopping, "A Lanterna está " + Shopping.bateria.text);
            Shopping.changed = false;
        }

        Engine.moveStoresView(null, transition_diff);
    },

    LanternEnum: {
        fromInt: function(value) {
            for (var k in this) {
                if (typeof this[k].value != 'undefined' && this[k].value == value) {
                    return this[k];
                }
            }
            return null;
        },
        Escuro: { value: 0, text: 'Desligada' },
        Meialuz: { value: 1, text: 'Fraca' },
        luzinha: { value: 2, text: 'Quase 100%' },
        Iluminado: { value: 3, text: 'Iluminando bem' }
    },

    setTitle: function() {
        var title = "Shopping";
        if (Engine.activeModule == this) {
            document.title = title;
        }
        $('div#location_room').text(title);
    },

    updateButton: function() {
        var light = $('#ligarlanterna.button');
        var recharge = $('#rechargeButton.button');
        if (Shopping.bateria.value == Shopping.LanternEnum.Escuro.value && recharge.css('display') != 'none') {
            recharge.hide();
            light.show();
            if (recharge.hasClass('disabled')) {
                Button.cooldown(light);
            }
        } else if (light.css('display') != 'none') {
            recharge.show();
            light.hide();
            if (light.hasClass('disabled')) {
                Button.cooldown(recharge);
            }
        }

        if (!$SM.get('stores.bateria')) {
            light.addClass('free');
            recharge.addClass('free');
        } else {
            light.removeClass('free');
            recharge.removeClass('free');
        }
    },

    _lanternTimer: null,
    _bateryTimer: null,

    lightlantern: function() {
        var bateria = $SM.get('stores.bateria');
        if (bateria < 5) {
            Notifications.notify(Shopping, "Você não tem bateria para ligar a lanterna");
            Button.clearCooldown($('#lightButton.button'));
            return;
        } else if (bateria > 4) {
            $SM.set('stores.bateria', bateria - 4);
        }
        Shopping.bateria = Shopping.LanternEnum.Meialuz;
        Shopping.onlanternChange();
    },

    rechargelantern: function() {
        var bateria = $SM.get('stores.bateria');
        if (bateria === 0) {
            Notifications.notify(Shopping, "Você não tem bateria para recarregar a lanterna");
            Button.clearCooldown($('#rechargeButton.button'));
            return;
        }
        if (bateria > 0) {
            $SM.set('stores.bateria', bateria - 1);

        }
        if (Shopping.bateria.value < 3) {
            Shopping.bateria = Shopping.LanternEnum.fromInt(Shopping.bateria.value + 1);
        }
        Shopping.onlanternChange();
    },

    onlanternChange: function() {
        if (Engine.activeModule != Shopping) {
            Shopping.changed = true;
        }
        Notifications.notify(Shopping, "A Lanterna está " + Shopping.bateria.text, true);
        Shopping.updateButton();
        Shopping.setTitle();
    },

    energychange: function() {
        var energia = $SM.get('stores.energia');
        if (energia > 0) {
            $SM.add('stores.energia', -1)
        }
    },

    coolBateria: function() {
        var bateria = $SM.get('stores.bateria');
        if (Shopping.bateria.value > 0) {
            Shopping.bateria = Shopping.LanternEnum.fromInt(Shopping.bateria.value - 1);
            //Shopping._bateryTimer = setTimeout(Shopping.coolBateria, Shopping._BATTERY_CHARGE_DELAY);
            Shopping.onlanternChange();
        }
    },


    eatfood: function() {
        let hamburguer = $SM.get('stores.hamburguer')
        if (hamburguer === 0) {
            Notifications.notify(Shopping, "Você não tem Hamburguers para comer")
            return
        } else if ($SM.get('stores.energia') === 20) {
            Notifications.notify(Shopping, "Você já está satisfeito!")
            return
        } else if ($SM.get('stores.hamburguer') > 0) {
            $SM.add('stores.hamburguer', -1)
        }
        if ($SM.get('stores.energia') < 18) {
            $SM.add('stores.energia', 2)
        } else if ($SM.get('stores.energia') < 20) {
            $SM.add('stores.energia', 1)
        }

    },

    updateStoresView: function() {
        var stores = $('div#stores');
        var weapons = $('div#weapons');
        var needsAppend = false,
            wNeedsAppend = false,
            newRow = false;
        if (stores.length == 0) {
            stores = $('<div>').attr({
                id: 'stores'
            }).css('opacity', 0);
            needsAppend = true;
        }
        if (weapons.length == 0) {
            weapons = $('<div>').attr({
                id: 'weapons'
            }).css('opacity', 0);
            wNeedsAppend = true;
        }
        for (var k in $SM.get('stores')) {

            var type = null;
            if (Shopping.Craftables[k]) {
                type = Shopping.Craftables[k].type;
            }

            var location;
            switch (type) {
                case 'upgrade':
                    // Don't display upgrades on the Shopping screen
                    continue;
                default:
                    location = stores;
                    break;
            }

            var id = "row_" + k.replace(' ', '-');
            var row = $('div#' + id, location);
            var num = $SM.get('stores["' + k + '"]');

            if (typeof num != 'number' || isNaN(num)) {
                // No idea how counts get corrupted, but I have reason to believe that they occassionally do.
                // Build a little fence around it!
                num = 0;
                $SM.set('stores["' + k + '"]', 0);
            }

            if (row.length == 0 && num > 0) {
                row = $('<div>').attr('id', id).addClass('storeRow');
                $('<div>').addClass('row_key').text(k).appendTo(row);
                $('<div>').addClass('row_val').text(Math.floor(num)).appendTo(row);
                $('<div>').addClass('clear').appendTo(row);
                var curPrev = null;
                location.children().each(function(i) {
                    var child = $(this);
                    var cName = child.attr('id').substring(4).replace('-', ' ');
                    if (cName < k && (curPrev == null || cName > curPrev)) {
                        curPrev = cName;
                    }
                });
                if (curPrev == null) {
                    row.prependTo(location);
                } else {
                    row.insertAfter(location.find('#row_' + curPrev.replace(' ', '-')));
                }
                newRow = true;
            } else if (num >= 0) {
                $('div#' + row.attr('id') + ' > div.row_val', location).text(Math.floor(num));
            }
        }

        if (needsAppend && stores.children().length > 0) {
            stores.appendTo('div#storesContainer');
            stores.animate({ opacity: 1 }, 300, 'linear');
        }

        if (wNeedsAppend && weapons.children().length > 0) {
            weapons.appendTo('div#storesContainer');
            weapons.animate({ opacity: 1 }, 300, 'linear');
        }

        if (newRow) {
            Shopping.updateIncomeView();
        }
    },

    updateIncomeView: function() {
        var stores = $('div#stores');
        if (stores.length == 0 || typeof $SM.get('income') == 'undefined') return;
        $('div.storeRow', stores).each(function(index, el) {
            el = $(el);
            $('div.tooltip', el).remove();
            var tt = $('<div>').addClass('tooltip bottom right');
            var storeName = el.attr('id').substring(4).replace('-', ' ');
            for (var incomeSource in $SM.get('income')) {
                var income = $SM.get('income["' + incomeSource + '"]');
                for (var store in income.stores) {
                    if (store == storeName && income.stores[store] != 0) {
                        $('<div>').addClass('row_key').text(incomeSource).appendTo(tt);
                        $('<div>')
                            .addClass('row_val')
                            .text(Engine.getIncomeMsg(income.stores[store], income.delay))
                            .appendTo(tt);
                    }
                }
            }
            if (tt.children().length > 0) {
                tt.appendTo(el);
            }
        });
    },



    build: function(buildBtn) {
        var thing = $(buildBtn).attr('buildThing');

        var craftable = Shopping.Craftables[thing];

        var numThings = 1;
        switch (craftable.type) {
            case 'good':
            case 'weapon':
            case 'ferramenta':
            case 'upgrade':
                numThings = $SM.get('stores["' + thing + '"]', true);
                break;
            case 'building':
                numThings = $SM.get('game.buildings["' + thing + '"]', true);
                break;
        }

        if (numThings < 0) numThings = 0;
        if (craftable.maximum <= numThings) {
            return;
        }

        var storeMod = {};
        var cost = craftable.cost();
        for (var k in cost) {
            var have = $SM.get('stores["' + k + '"]', true);
            if (have < cost[k]) {
                Notifications.notify(Shopping, "Recurso " + k + " insuficiente");
                return false;
            } else {
                storeMod[k] = have - cost[k];
            }
        }
        $SM.setM('stores', storeMod);

        Notifications.notify(Shopping, craftable.buildMsg);

        switch (craftable.type) {
            case 'good':
            case 'upgrade':
            case 'ferramenta':
                $SM.add('stores["' + thing + '"]', 1);
                break;
        }
    },

    needsWorkshop: function(type) {
        return type == 'upgrade';
    },

    craftUnlocked: function(thing) {
        if (Shopping.buttons[thing]) {
            return true;
        }
        if ($SM.get('game.builder.level') < 4) return false;
        var craftable = Shopping.Craftables[thing];
        if (Shopping.needsWorkshop(craftable.type) && $SM.get('game.buildings["workshop"]', true) == 0) return false;
        var cost = craftable.cost();

        //show button if one has already been built
        if ($SM.get('game.buildings["' + thing + '"]') > 0) {
            Shopping.buttons[thing] = true;
            return true;
        }
        // Show buttons if we have at least 1/2 the bateria, and all other components have been seen.
        if ($SM.get('stores.bateria', true) < cost['bateria'] * 0.5) {
            return false;
        }
        for (var c in cost) {
            if (!$SM.get('stores["' + c + '"]')) {
                return false;
            }
        }

        Shopping.buttons[thing] = true;
        //don't notify if it has already been built before
        if (!$SM.get('game.buildings["' + thing + '"]')) {
            Notifications.notify(Shopping, craftable.availableMsg);
        }
        return true;
    },

    updateBuildButtons: function() {
        var buildSection = $('#buildBtns');
        var needsAppend = false;
        if (buildSection.length == 0) {
            buildSection = $('<div>').attr('id', 'buildBtns').css('opacity', 0);
            needsAppend = true;
        }

        var craftSection = $('#craftBtns');
        var cNeedsAppend = false;
        if (craftSection.length == 0 && $SM.get('game.buildings["workshop"]', true) > 0) {
            craftSection = $('<div>').attr('id', 'craftBtns').css('opacity', 0);
            cNeedsAppend = true;
        }

        var buySection = $('#buyBtns');
        var bNeedsAppend = false;
        if (buySection.length == 0 && $SM.get('game.buildings["trading post"]', true) > 0) {
            buySection = $('<div>').attr('id', 'buyBtns').css('opacity', 0);
            bNeedsAppend = true;
        }

        for (var k in Shopping.Craftables) {
            craftable = Shopping.Craftables[k];
            var max = $SM.num(k, craftable) + 1 > craftable.maximum;
            if (craftable.button == null) {
                if (Shopping.craftUnlocked(k)) {
                    var loc = Shopping.needsWorkshop(craftable.type) ? craftSection : buildSection;
                    craftable.button = new Button.Button({
                        id: 'build_' + k,
                        cost: craftable.cost(),
                        text: k,
                        click: Shopping.build,
                        width: '80px',
                        ttPos: loc.children().length > 10 ? 'top right' : 'bottom right'
                    }).css('opacity', 0).attr('buildThing', k).appendTo(loc).animate({ opacity: 1 }, 300, 'linear');
                }
            } else {
                // refresh the tooltip
                var costTooltip = $('.tooltip', craftable.button);
                costTooltip.empty();
                var cost = craftable.cost();
                for (var k in cost) {
                    $("<div>").addClass('row_key').text(k).appendTo(costTooltip);
                    $("<div>").addClass('row_val').text(cost[k]).appendTo(costTooltip);
                }
                if (max && !craftable.button.hasClass('disabled')) {
                    Notifications.notify(Shopping, craftable.maxMsg);
                }
            }
            if (max) {
                Button.setDisabled(craftable.button, true);
            } else {
                Button.setDisabled(craftable.button, false);
            }
        }

        for (var k in Shopping.TradeGoods) {
            good = Shopping.TradeGoods[k];
            var max = $SM.num(k, good) + 1 > good.maximum;
            if (good.button == null) {
                if (Shopping.buyUnlocked(k)) {
                    good.button = new Button.Button({
                        id: 'build_' + k,
                        cost: good.cost(),
                        text: k,
                        click: Shopping.buy,
                        width: '80px'
                    }).css('opacity', 0).attr('buildThing', k).appendTo(buySection).animate({ opacity: 1 }, 300, 'linear');
                }
            } else {
                // refresh the tooltip
                var costTooltip = $('.tooltip', good.button);
                costTooltip.empty();
                var cost = good.cost();
                for (var k in cost) {
                    $("<div>").addClass('row_key').text(k).appendTo(costTooltip);
                    $("<div>").addClass('row_val').text(cost[k]).appendTo(costTooltip);
                }
                if (max && !good.button.hasClass('disabled')) {
                    Notifications.notify(Shopping, good.maxMsg);
                }
            }
            if (max) {
                Button.setDisabled(good.button, true);
            } else {
                Button.setDisabled(good.button, false);
            }
        }

        if (needsAppend && buildSection.children().length > 0) {
            buildSection.appendTo('div#ShoppingPanel').animate({ opacity: 1 }, 300, 'linear');
        }
        if (cNeedsAppend && craftSection.children().length > 0) {
            craftSection.appendTo('div#ShoppingPanel').animate({ opacity: 1 }, 300, 'linear');
        }
        if (bNeedsAppend && buildSection.children().length > 0) {
            buySection.appendTo('div#ShoppingPanel').animate({ opacity: 1 }, 300, 'linear');
        }
    },

    handleStateUpdates: function(e) {
        if (e.category == 'stores') {
            Shopping.updateStoresView();
            Shopping.updateBuildButtons();
        } else if (e.category == 'income') {
            Shopping.updateStoresView();
            Shopping.updateIncomeView();
        } else if (e.stateName.indexOf('game.buildings') == 0) {
            Shopping.updateBuildButtons();
        }
    }
}