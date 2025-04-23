// ==UserScript==
// @name         Cookie Clicker AutoHelper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  AutoClicker, Golden Cookie Clicker, Autobuyer e Timer para Cookie Clicker
// @author       Você
// @match        https://orteil.dashnet.org/cookieclicker/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const waitForGame = setInterval(() => {
        if (typeof Game !== 'undefined' && Game.ready) {
            clearInterval(waitForGame);
            initAutoHelper();
        }
    }, 1000);

    function initAutoHelper() {
        const styles = `
            .autohelper-section { margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; background: #222; color: #fff; border-radius: 10px; }
            .autohelper-section h3 { margin: 0 0 10px 0; font-size: 14px; color: #ffcc00; }
            .autohelper-toggle, .autohelper-mode { display: inline-block; margin: 3px; padding: 5px 10px; background: #444; color: #fff; border-radius: 5px; cursor: pointer; font-size: 12px; }
            .autohelper-toggle.active, .autohelper-mode.active { background: #4caf50; }
            .autohelper-suboptions { margin-top: 5px; padding-left: 10px; }
            #autohelper-menu-toggle {
                position: fixed;
                top: 90px;         /* Ajuste vertical para alinhar à faixa do topo */
                left: 270px;       /* Ajuste horizontal ao lado do nome da confeitaria */
                z-index: 10001;
                font-size: 20px;
                cursor: pointer;
                color: white;
                background: transparent;
                border: none;
            }
            #autohelper-container { position: absolute; top: 0; left: 0; z-index: 10001; }
            #autohelper-menu {
                position: absolute;
                top: 30px;
                left: 10px;
                z-index: 10000;
                width: 220px;
                background-color: #111;
                padding: 10px;
                border: 2px solid #444;
                border-radius: 10px;
                display: none;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const container = document.createElement('div');
        container.id = 'autohelper-container';

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'autohelper-menu-toggle';
        toggleBtn.textContent = '⚙️';
        container.appendChild(toggleBtn);

        const menu = document.createElement('div');
        menu.id = 'autohelper-menu';
        menu.innerHTML = `
            <div class="autohelper-section">
                <h3>AutoClicker</h3>
                <div class="autohelper-toggle" id="toggleAutoClicker">Desligado</div>
                <div class="autohelper-suboptions">
                    <div class="autohelper-mode" id="autoMode-normal">Normal</div>
                    <div class="autohelper-mode" id="autoMode-fast">Rápido</div>
                    <div class="autohelper-mode" id="autoMode-insane">Insano</div>
                </div>
            </div>
            <div class="autohelper-section">
                <h3>Golden Cookie Clicker</h3>
                <div class="autohelper-toggle" id="toggleGolden">Desligado</div>
                <div class="autohelper-suboptions">
                    <div class="autohelper-mode" id="goldenMode-beneficial">Somente Benéficos</div>
                </div>
            </div>
            <div class="autohelper-section">
                <h3>AutoBuyer</h3>
                <div class="autohelper-toggle" id="toggleBuyer">Desligado</div>
            </div>
        `;
        container.appendChild(menu);
        document.body.appendChild(container);

        toggleBtn.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        // AutoClicker
        let autoClickInterval;
        let autoClickMode = 'normal';
        let autoClickActive = false;

        function getCPS(mode) {
            if (mode === 'normal') return 10;
            if (mode === 'fast') return 25;
            if (mode === 'insane') return 50;
        }

        function startAutoClicker() {
            clearInterval(autoClickInterval);
            const cps = getCPS(autoClickMode);
            autoClickInterval = setInterval(() => {
                for (let i = 0; i < cps; i++) Game.ClickCookie();
            }, 1000);
        }

        function setAutoClicker(active) {
            autoClickActive = active;
            const btn = document.getElementById("toggleAutoClicker");
            btn.textContent = autoClickActive ? "Ligado" : "Desligado";
            btn.classList.toggle("active", autoClickActive);
            if (autoClickActive) startAutoClicker();
            else clearInterval(autoClickInterval);
            if (!active) {
                document.querySelectorAll("#autoMode-normal, #autoMode-fast, #autoMode-insane").forEach(b => b.classList.remove("active"));
            }
        }

        document.getElementById("toggleAutoClicker").addEventListener("click", () => {
            setAutoClicker(!autoClickActive);
        });

        document.querySelectorAll("#autoMode-normal, #autoMode-fast, #autoMode-insane").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("#autoMode-normal, #autoMode-fast, #autoMode-insane").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                autoClickMode = btn.id.replace("autoMode-", "");
                if (!autoClickActive) setAutoClicker(true);
                else startAutoClicker();
            });
        });

        // Golden Cookie Clicker
        let goldenMode = 'all';
        let goldenActive = false;
        let goldenInterval;

        function clickGoldenCookie() {
            const cookies = Game.shimmers;
            for (let cookie of cookies) {
                if (goldenMode === 'beneficial') {
                    if (cookie.type === 'golden' && cookie.wrath === 0) cookie.pop();
                } else {
                    cookie.pop();
                }
            }
        }

        function setGoldenClicker(active) {
            goldenActive = active;
            const btn = document.getElementById("toggleGolden");
            btn.textContent = goldenActive ? "Ligado" : "Desligado";
            btn.classList.toggle("active", goldenActive);
            if (goldenActive) startGoldenClicker();
            else clearInterval(goldenInterval);
            if (!active) {
                document.querySelectorAll("#goldenMode-beneficial").forEach(b => b.classList.remove("active"));
            }
        }

        function startGoldenClicker() {
            clearInterval(goldenInterval);
            goldenInterval = setInterval(clickGoldenCookie, 250);
        }

        document.getElementById("toggleGolden").addEventListener("click", () => {
            setGoldenClicker(!goldenActive);
        });

        document.querySelectorAll("#goldenMode-beneficial").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("#goldenMode-beneficial").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                goldenMode = 'beneficial';
                if (!goldenActive) setGoldenClicker(true);
            });
        });

        // AutoBuyer
        let buyerActive = false;
        let buyerInterval;

        function autoBuy() {
            let buildings = Game.ObjectsById;
            let upgrades = Game.UpgradesInStore.filter(u => u.getPrice && u.getPrice() > 0);
            let allItems = buildings.concat(upgrades);
            allItems = allItems.filter(i => i && typeof i.getPrice === 'function');
            allItems.sort((a, b) => (a.getPrice() / ((a.storedCps || 1))) - (b.getPrice() / ((b.storedCps || 1))));
            for (let item of allItems) {
                if (Game.cookies >= item.getPrice()) {
                    item.buy();
                    break;
                }
            }
        }

        document.getElementById("toggleBuyer").addEventListener("click", () => {
            buyerActive = !buyerActive;
            const btn = document.getElementById("toggleBuyer");
            btn.textContent = buyerActive ? "Ligado" : "Desligado";
            btn.classList.toggle("active", buyerActive);
            if (buyerActive) buyerInterval = setInterval(autoBuy, 2000);
            else clearInterval(buyerInterval);
        });
    }
})();
