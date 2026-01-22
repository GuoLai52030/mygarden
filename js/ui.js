const UI = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateResources();
    },

    cacheDOM() {
        this.dom = {
            waterCount: document.getElementById('water-count'),
            sunCount: document.getElementById('sun-count'),
            coinCount: document.getElementById('coin-count'),
            levelDisplay: document.getElementById('level-display'),
            btnSunBoost: document.getElementById('btn-sun-boost'),
            gardenGrid: document.getElementById('garden-grid'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalClose: document.getElementById('modal-close'),
            toastContainer: document.getElementById('toast-container'),
            btnShop: document.getElementById('btn-shop'),
            btnBag: document.getElementById('btn-bag'),
            btnTasks: document.getElementById('btn-tasks'),
            btnFriends: document.getElementById('btn-friends')
        };
    },

    bindEvents() {
        this.dom.modalClose.addEventListener('click', () => this.closeModal());
        this.dom.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.modalOverlay) this.closeModal();
        });

        this.dom.btnSunBoost.addEventListener('click', () => this.showSunlightModal());

        this.dom.levelDisplay.parentElement.style.cursor = 'pointer'; // Make it look clickable
        this.dom.levelDisplay.parentElement.addEventListener('click', () => this.showLevelExplanation());

        this.dom.btnShop.addEventListener('click', () => this.openShop());
        this.dom.btnBag.addEventListener('click', () => this.openBag());
        this.dom.btnTasks.addEventListener('click', () => this.showTasksModal());
        this.dom.btnFriends.addEventListener('click', () => this.showToast("好友系统开发中..."));
    },

    updateResources() {
        const data = Resources.getData();
        this.dom.waterCount.textContent = Math.floor(data.water);
        this.dom.sunCount.textContent = Math.floor(data.sun);
        this.dom.coinCount.textContent = data.coins;
        this.dom.levelDisplay.textContent = `Lv.${data.level}`;
    },

    renderGarden() {
        this.dom.gardenGrid.innerHTML = '';
        Garden.plots.forEach((plot) => {
            const plotEl = document.createElement('div');
            plotEl.dataset.index = plot.index;
            
            if (plot.isLocked) {
                plotEl.className = 'plot locked';
                plotEl.innerHTML = `
                    <div style="font-size: 2em; opacity: 0.5;">🔒</div>
                    <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                        ${Garden.getUnlockCost(plot.index)}💰
                    </div>
                `;
                plotEl.addEventListener('click', () => {
                     Garden.unlockPlot(plot.index);
                });
            } else {
                plotEl.className = `plot ${plot.isWet ? 'wet' : 'dry'}`;
                // Add click event listener immediately
                plotEl.addEventListener('click', () => this.handlePlotClick(plot));

                if (plot.plant) {
                    const plantEl = document.createElement('div');
                    plantEl.className = 'plant';
                    
                    // Use new icon logic
                    plantEl.textContent = plot.plant.getPlantIcon();
                    
                    // Use new scale logic
                    const scale = plot.plant.getScale();
                    plantEl.style.transform = `scale(${scale})`;
                    
                    // Progress Bar
                    const barContainer = document.createElement('div');
                    barContainer.className = 'progress-bar-container';
                    const bar = document.createElement('div');
                    bar.className = 'progress-bar';
                    bar.style.width = `${plot.plant.getGrowthPercentage()}%`;
                    
                    // Color change if ready
                    if (plot.plant.isMature()) {
                        bar.style.backgroundColor = '#ffd700'; // Gold
                        plantEl.classList.add('mature'); // Optional visual cue
                    }

                    barContainer.appendChild(bar);
                    plotEl.appendChild(plantEl);
                    plotEl.appendChild(barContainer);
                } else {
                    // Empty plot hint
                    const hintEl = document.createElement('div');
                    hintEl.style.opacity = '0.3';
                    hintEl.style.fontSize = '2em';
                    hintEl.textContent = '🌱'; // Faint sprout to indicate planting spot
                    plotEl.appendChild(hintEl);
                }
            }

            this.dom.gardenGrid.appendChild(plotEl);
        });
    },

    updateGardenState(plots) {
        // Lightweight update: just classes and progress bars
        const plotEls = this.dom.gardenGrid.children;
        for (let i = 0; i < plotEls.length; i++) {
            const plot = plots[i];
            const el = plotEls[i];
            
            // Skip updates for locked plots (except initially handled by render)
            if (plot.isLocked) {
                if (!el.classList.contains('locked')) {
                    // State mismatch (e.g. just unlocked), trigger full re-render
                    // But we are in a loop, careful.
                    // For now, let's assume unlock triggers renderGarden(), so this loop is for steady state
                    continue; 
                }
                continue; 
            }

            // Update Soil
            if (plot.isWet) {
                el.classList.add('wet');
                el.classList.remove('dry');
            } else {
                el.classList.add('dry');
                el.classList.remove('wet');
            }

            // Update Plant Progress
            if (plot.plant) {
                const bar = el.querySelector('.progress-bar');
                if (bar) {
                    bar.style.width = `${plot.plant.getGrowthPercentage()}%`;
                    if (plot.plant.isMature()) {
                        bar.style.backgroundColor = '#ffd700';
                        el.querySelector('.plant').classList.add('mature');
                    }
                }
                const plantEl = el.querySelector('.plant');
                if (plantEl) {
                    // Update Icon if needed (transition from seedling to crop)
                    const currentIcon = plot.plant.getPlantIcon();
                    if (plantEl.textContent !== currentIcon) {
                        plantEl.textContent = currentIcon;
                    }

                    // Update Scale
                    const scale = plot.plant.getScale();
                    plantEl.style.transform = `scale(${scale})`;
                }
            }
        }
    },

    handlePlotClick(plot) {
        if (!plot.plant) {
            // Empty plot -> Open Bag to Plant
            this.openBag(plot.index);
        } else {
            if (plot.plant.isMature()) {
                Garden.harvestPlot(plot.index);
            } else {
                if (!plot.isWet) {
                    Garden.waterPlot(plot.index);
                } else {
                    this.showToast("植物正在茁壮成长中...");
                }
            }
        }
    },

    showLevelExplanation() {
        const level = Resources.level;
        const nextExp = Resources.getExpForNextLevel();
        const currentExp = Resources.exp;
        
        this.dom.modalTitle.textContent = "等级说明";
        this.dom.modalBody.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: #ffb300; margin-bottom: 10px; font-size: 1.5em;">当前等级：Lv.${level}</h3>
                <p><strong>等级的作用：</strong><br>解锁更多的作物、工具和资源。</p>
                <p><strong>如何提升：</strong><br>通过完成任务、种植和收获来获得经验。</p>
                
                <div style="background: #f5f5f5; border-radius: 10px; padding: 15px; margin-top: 15px;">
                    <div style="margin-bottom: 5px; font-weight: bold; color: #555;">当前经验</div>
                    <div style="font-size: 1.2em; color: #1976d2; margin-bottom: 8px;">${currentExp} / ${nextExp}</div>
                    <div class="task-progress-bar" style="height: 10px; background: #e0e0e0;">
                        <div class="fill" style="width: ${(currentExp / nextExp) * 100}%; background: #42a5f5;"></div>
                    </div>
                </div>
                
                <button id="modal-close-btn" class="modal-btn">关闭</button>
            </div>
        `;
        
        this.dom.modalOverlay.classList.remove('hidden');

        // Bind new close button
        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    },

    showSunlightModal() {
        this.dom.modalTitle.textContent = "阳光加速";
        const isEnabled = Resources.sunlightBoostEnabled;
        
        this.dom.modalBody.innerHTML = `
            <div style="text-align: center;">
                <p style="font-size: 1.1em; margin-bottom: 15px;">
                    消耗阳光，双倍生长速度！
                </p>
                <div style="background: #fff9c4; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div>当前阳光: <b>${Math.floor(Resources.sun)}</b></div>
                    <div style="color: #f57f17; font-size: 0.9em; margin-top: 5px;">消耗: 1 阳光/秒</div>
                </div>
                
                ${isEnabled ? 
                    `<button id="btn-disable-boost" class="modal-btn" style="background-color: #e57373; box-shadow: 0 4px 0 #d32f2f;">禁用加速</button>` :
                    `<button id="btn-enable-boost" class="modal-btn">启用加速</button>`
                }
            </div>
        `;
        
        this.dom.modalOverlay.classList.remove('hidden');

        const btnEnable = document.getElementById('btn-enable-boost');
        if (btnEnable) {
            btnEnable.addEventListener('click', () => {
                if (Resources.sun >= 1) {
                    Resources.sunlightBoostEnabled = true;
                    this.updateBoostButtonState();
                    this.closeModal();
                    this.showToast("阳光加速已启用！☀️⚡");
                } else {
                    this.showToast("阳光不足，无法启用！");
                }
            });
        }

        const btnDisable = document.getElementById('btn-disable-boost');
        if (btnDisable) {
            btnDisable.addEventListener('click', () => {
                Resources.sunlightBoostEnabled = false;
                this.updateBoostButtonState();
                this.closeModal();
                this.showToast("阳光加速已停止");
            });
        }
    },

    showTasksModal() {
        this.dom.modalTitle.textContent = "任务列表";
        this.dom.modalBody.innerHTML = '<div class="task-list"></div>';
        const list = this.dom.modalBody.querySelector('.task-list');

        Tasks.getTasks().forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            let rewardText = '';
            if (task.reward.water) rewardText += `💧${task.reward.water} `;
            if (task.reward.sun) rewardText += `☀️${task.reward.sun} `;
            if (task.reward.coins) rewardText += `💰${task.reward.coins} `;

            taskEl.innerHTML = `
                <div class="task-info">
                    <div class="task-desc">${task.description}</div>
                    <div class="task-reward">奖励: ${rewardText}</div>
                </div>
                <div class="task-status">
                    ${task.completed ? 
                        '<span class="badge-completed">已完成</span>' : 
                        `<span class="badge-progress">${task.getProgress()}</span>`
                    }
                </div>
                <div class="task-progress-bar">
                    <div class="fill" style="width: ${task.getPercent()}%"></div>
                </div>
            `;
            list.appendChild(taskEl);
        });

        this.dom.modalOverlay.classList.remove('hidden');
    },

    updateTasksUI() {
        // Refresh if modal is open
        if (!this.dom.modalOverlay.classList.contains('hidden') && 
             this.dom.modalTitle.textContent === "任务列表") {
            this.showTasksModal();
        }
    },

    updateBoostButtonState() {
        if (Resources.sunlightBoostEnabled) {
            this.dom.btnSunBoost.classList.add('active');
            this.dom.btnSunBoost.textContent = "☀️ 加速中";
        } else {
            this.dom.btnSunBoost.classList.remove('active');
            this.dom.btnSunBoost.textContent = "☀️ 加速";
        }
    },

    openShop() {
        this.dom.modalTitle.textContent = "种子商店";
        this.dom.modalBody.innerHTML = '<div class="shop-grid"></div>';
        const grid = this.dom.modalBody.querySelector('.shop-grid');
        
        Shop.getShopItems().forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'shop-item';
            itemEl.innerHTML = `
                <div style="font-size: 2em">${item.emoji}</div>
                <div>${item.name}</div>
                <div class="price-tag">💰${item.cost}</div>
            `;
            itemEl.addEventListener('click', () => {
                Shop.buyItem(item.id);
            });
            grid.appendChild(itemEl);
        });
        
        this.dom.modalOverlay.classList.remove('hidden');
    },

    openBag(targetPlotIndex = null) {
        this.dom.modalTitle.textContent = "背包";
        this.dom.modalBody.innerHTML = '<div class="inventory-grid"></div>';
        const grid = this.dom.modalBody.querySelector('.inventory-grid');

        let hasItems = false;
        Object.entries(Resources.inventory).forEach(([itemId, count]) => {
            if (count > 0) {
                hasItems = true;
                const def = CONFIG.PLANTS[itemId];
                const itemEl = document.createElement('div');
                itemEl.className = 'inventory-item';
                itemEl.innerHTML = `
                    <div style="font-size: 2em">${def.emoji}</div>
                    <div>${def.name}</div>
                    <div>x${count}</div>
                `;
                itemEl.addEventListener('click', () => {
                    if (targetPlotIndex !== null) {
                        if (Garden.plantSeed(targetPlotIndex, itemId)) {
                            this.closeModal();
                        }
                    } else {
                        this.showToast("请点击土地进行种植");
                        this.closeModal();
                    }
                });
                grid.appendChild(itemEl);
            }
        });

        if (!hasItems) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">背包是空的，去商店看看吧！</p>';
        }
        
        this.dom.modalOverlay.classList.remove('hidden');
    },

    closeModal() {
        this.dom.modalOverlay.classList.add('hidden');
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        this.dom.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }
};
