
// ==UserScript==
// @name         Clickton – Cookie Clicker Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A loyal half-human half-bot assistant to play Cookie Clicker 24/7
// @author       You
// @match        *://orteil.dashnet.org/cookieclicker/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const Clickton = {
        intervalIds: {},
        settings: {
            autoClick: true,
            autoGolden: true,
            autoGrimoire: false,
            autoDragonAura: false,
            autoAscend: false
        },

        init() {
            if (!Game || !Game.ready) return setTimeout(Clickton.init, 1000);

            Clickton.createUI();
            Clickton.startModules();
            console.log("Clickton initialized!");
        },

        createUI() {
            const panel = document.createElement("div");
            panel.style.position = "fixed";
            panel.style.top = "50px";
            panel.style.right = "10px";
            panel.style.background = "rgba(0,0,0,0.7)";
            panel.style.color = "white";
            panel.style.padding = "10px";
            panel.style.zIndex = "10000";
            panel.style.borderRadius = "10px";
            panel.style.fontSize = "12px";

            const options = [
                { key: 'autoClick', label: 'Auto Click' },
                { key: 'autoGolden', label: 'Auto Golden Cookies' },
                { key: 'autoGrimoire', label: 'Auto Grimoire' },
                { key: 'autoDragonAura', label: 'Auto Dragon Aura' },
                { key: 'autoAscend', label: 'Auto Ascend' }
            ];

            options.forEach(opt => {
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = Clickton.settings[opt.key];
                checkbox.onchange = () => {
                    Clickton.settings[opt.key] = checkbox.checked;
                    Clickton.toggleModule(opt.key, checkbox.checked);
                };
                label.appendChild(checkbox);
                label.append(` ${opt.label}`);
                label.style.display = "block";
                panel.appendChild(label);
            });

            document.body.appendChild(panel);
        },

        startModules() {
            Object.keys(Clickton.settings).forEach(key => {
                if (Clickton.settings[key]) Clickton.toggleModule(key, true);
            });
        },

        toggleModule(key, enable) {
            clearInterval(Clickton.intervalIds[key]);
            if (!enable) return;

            switch (key) {
                case 'autoClick':
                    Clickton.intervalIds[key] = setInterval(() => {
                        let clicks = 3;
                        if (Game.hasBuff('Click frenzy')) clicks = 10;
                        else if (Game.buffs['Frenzy']) clicks = 5;
                        for (let i = 0; i < clicks; i++) Game.ClickCookie();
                    }, 1000);
                    break;
                case 'autoGolden':
                    Clickton.intervalIds[key] = setInterval(() => {
                        Game.shimmers.forEach(s => s.pop());
                    }, 500);
                    break;
                case 'autoGrimoire':
                    Clickton.intervalIds[key] = setInterval(() => {
                        const minigame = Game.Objects['Wizard tower'].minigame;
                        if (!minigame || !minigame.spellsById) return;
                        const spell = minigame.spellsById[0]; // Force the Hand of Fate
                        const magic = minigame.magic;
                        const cost = minigame.getSpellCost(spell);
                        const failChance = minigame.getFailChance(spell);

                        if (magic >= cost && failChance < 0.25 && !Game.hasBuff('Clot') && !Game.hasBuff('Cursed finger')) {
                            minigame.castSpell(spell);
                        }
                    }, 1000);
                    break;
                case 'autoDragonAura':
                    Clickton.intervalIds[key] = setInterval(() => {
                        if (!Game.dragonAura || Game.dragonLevel < 5) return;
                        const bestAura = "Reality Bending";
                        const currentAura = Game.dragonAura;

                        if (currentAura !== bestAura) {
                            Game.ChooseDragonAura(bestAura);
                        }
                    }, 10000);
                    break;
                case 'autoAscend':
                    Clickton.intervalIds[key] = setInterval(() => {
                        if (Game.HasAscend && Game.AscendTimer === 0 && Game.CanAscend()) {
                            if (Game.UpgradesInStore.length === 0) Game.Ascend(1);
                        }
                    }, 5000);
                    break;
            }
        }
    };

    Clickton.init();
})();
