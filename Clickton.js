(() => {
  const AutoPlayer = {
    modules: {},
    settings: {
      autoClick: true,
      autoBuy: true,
      autoGolden: true,
      autoGrimoire: false,
      autoDragon: false,
      grimoireMode: 'safe', // 'safe', 'efficient', 'balanced'
      debug: true
    },
    log: (...args) => {
      if (AutoPlayer.settings.debug) console.log('[AutoPlayer]', ...args);
    },
    toggle: (mod) => {
      if (mod in AutoPlayer.settings && typeof AutoPlayer.settings[mod] === 'boolean') {
        AutoPlayer.settings[mod] = !AutoPlayer.settings[mod];
        AutoPlayer.updateUI();
        AutoPlayer.log(`${mod} set to ${AutoPlayer.settings[mod]}`);
      }
    },
    cycleGrimoireMode: () => {
      const modes = ['safe', 'efficient', 'balanced'];
      const current = AutoPlayer.settings.grimoireMode;
      const next = modes[(modes.indexOf(current) + 1) % modes.length];
      AutoPlayer.settings.grimoireMode = next;
      AutoPlayer.log(`Grimoire mode set to ${next}`);
      AutoPlayer.updateUI();
    },
    loop: () => {
      for (const [key, mod] of Object.entries(AutoPlayer.modules)) {
        if (AutoPlayer.settings[key] && typeof mod.run === 'function') {
          try {
            mod.run();
          } catch (e) {
            AutoPlayer.log(`Error in ${key}:`, e);
          }
        }
      }
    },
    start: () => {
      AutoPlayer.log('AutoPlayer started');
      setInterval(AutoPlayer.loop, 250);
      AutoPlayer.createUI();
    },
    createUI: () => {
      const style = document.createElement('style');
      style.textContent = `
        #autoPlayerUI {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          padding: 10px;
          border-radius: 10px;
          font-family: monospace;
          color: white;
          z-index: 10000;
          font-size: 12px;
        }
        #autoPlayerUI button {
          margin: 2px;
          padding: 3px 6px;
          background: #444;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        #autoPlayerUI button.active {
          background: #0a0;
        }
        #autoPlayerUI button:hover {
          background: #666;
        }
      `;
      document.head.appendChild(style);

      const ui = document.createElement('div');
      ui.id = 'autoPlayerUI';
      document.body.appendChild(ui);
      AutoPlayer.updateUI();
    },
    updateUI: () => {
      const ui = document.getElementById('autoPlayerUI');
      ui.innerHTML = `<b>AutoPlayer</b><br>`;
      for (const key in AutoPlayer.settings) {
        if (typeof AutoPlayer.settings[key] === 'boolean') {
          const btn = document.createElement('button');
          btn.textContent = key;
          btn.className = AutoPlayer.settings[key] ? 'active' : '';
          btn.onclick = () => AutoPlayer.toggle(key);
          ui.appendChild(btn);
        }
      }
      const grimoireBtn = document.createElement('button');
      grimoireBtn.textContent = `Grimoire: ${AutoPlayer.settings.grimoireMode}`;
      grimoireBtn.onclick = AutoPlayer.cycleGrimoireMode;
      ui.appendChild(document.createElement('br'));
      ui.appendChild(grimoireBtn);
    }
  };

  // Módulo: AutoClick
  AutoPlayer.modules.autoClick = {
    run: () => {
      for (let i = 0; i < 50; i++) Game.ClickCookie();
    }
  };

  // Módulo: AutoBuy
AutoPlayer.modules.autoBuy = {
  run: () => {
    // Comprar upgrades com alta prioridade
    Game.UpgradesInStore
      .filter(upg => upg.canBuy() && Game.cookies >= upg.getPrice())
      .sort((a, b) => a.getPrice() - b.getPrice())
      .forEach(upg => upg.buy());

    // Comprar edifícios com melhor custo-benefício
    const buildings = Object.values(Game.ObjectsById)
      .map(b => ({
        building: b,
        efficiency: b.storedCps / b.getPrice() || 0
      }))
      .filter(b => b.building.getPrice() <= Game.cookies)
      .sort((a, b) => b.efficiency - a.efficiency);

    buildings.forEach(b => {
      if (Game.cookies >= b.building.getPrice()) {
        b.building.buy();
      }
    });
  }
};


  // Módulo: AutoGolden
  AutoPlayer.modules.autoGolden = {
    run: () => {
      Game.shimmers.forEach(shimmer => {
        if (shimmer.type === 'golden') shimmer.pop();
      });
    }
  };

  // Módulo: AutoGrimoire
  AutoPlayer.modules.autoGrimoire = {
    run: () => {
      const grimoire = Game.ObjectsById[7]?.minigame;
      if (!grimoire) return;
      const spell = grimoire.spellsById[0]; // "Force the Hand of Fate"
      const canCast = grimoire.getSpellCost(spell) <= grimoire.magic;
      const failChance = grimoire.getFailChance(spell);

      if (!canCast) return;

      const mode = AutoPlayer.settings.grimoireMode;

      if (mode === 'safe' && failChance === 0) {
        grimoire.castSpell(spell);
      } else if (mode === 'efficient') {
        grimoire.castSpell(spell);
      } else if (mode === 'balanced') {
        if (failChance <= 0.05) grimoire.castSpell(spell);
      }
    }
  };

  window.AutoPlayer = AutoPlayer;
  AutoPlayer.start();
})();
