// ==UserScript==
// @name         Clickton – Cookie Clicker Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Um assistente robótico que joga Cookie Clicker por você, 24/7. Meio humano, meio máquina – apenas cookies.
// @author       Você
// @match        https://orteil.dashnet.org/cookieclicker/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const Clickton = {
        settings: {
            autoClick: true,
            autoGolden: true,
            autoGrimoire: false,
            autoDragonAura: false,
            autoAscend: false
        },

        interval: null,
        goldenBuffActive: () => Game.hasBuff('Click frenzy') || Game.hasBuff('Frenzy'),

        init: function () {
            this.createUI();
            this.startAutomation();
            console.log('%cClickton está pronto para servir, senhor.', 'color: gold; font-weight: bold');
        },

        startAutomation: function () {
            if (this.interval) clearInterval(this.interval);
            this.interval = setInterval(() => {
                if (this.settings.autoClick) this.autoClick();
                if (this.settings.autoGolden) this.autoGolden();
                if (this.settings.autoGrimoire) this.autoGrimoire();
                if (this.settings.autoDragonAura) this.autoDragonAura();
                if (this.settings.autoAscend) this.autoAscend();
            }, 100);
        },

        autoClick: function () {
            const cps = this.goldenBuffActive() ? 10 : 3;
            for (let i = 0; i < cps; i++) Game.ClickCookie();
        },

        autoGolden: function () {
            for (const sh of Game.shimmers) {
                if (sh.type === 'golden') sh.pop();
            }
        },

        autoGrimoire: function () {
            // Placeholder – adicionar lógica baseada em produção e custo-benefício
        },

        autoDragonAura: function () {
            // Placeholder – lógica para mudar aura com base em buffs
        },

        autoAscend: function () {
            // Placeholder – lógica para ascensão automática
        },

        createUI: function () {
            const panel = document.createElement('div');
            panel.id = 'clickton-panel';
            panel.style = `
                position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.7); 
                color: #fff; padding: 10px; border-radius: 8px; font-family: monospace; z-index: 10000;
            `;

            const makeToggle = (name, label) => {
                const row = document.createElement('div');
                const toggle = document.createElement('input');
                toggle.type = 'checkbox';
                toggle.checked = this.settings[name];
                toggle.onchange = () => {
                    this.settings[name] = toggle.checked;
                    console.log(`Clickton: ${label} ${toggle.checked ? 'ativado' : 'desativado'}.`);
                };
                row.appendChild(toggle);
                row.appendChild(document.createTextNode(' ' + label));
                panel.appendChild(row);
            };

            makeToggle('autoClick', 'Auto Clique');
            makeToggle('autoGolden', 'Auto Cookie Dourado');
            makeToggle('autoGrimoire', 'Auto Grimoire');
            makeToggle('autoDragonAura', 'Auto Aura de Dragão');
            makeToggle('autoAscend', 'Auto Ascensão');

            document.body.appendChild(panel);
        }
    };

    const checkReady = setInterval(() => {
        if (typeof Game !== 'undefined' && Game.ready) {
            clearInterval(checkReady);
            Clickton.init();
        }
    }, 500);
})();
