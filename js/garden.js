class Plot {
    constructor(index, savedData = null) {
        this.index = index;
        if (savedData) {
            this.isWet = savedData.isWet;
            this.wetTimeRemaining = savedData.wetTimeRemaining;
            this.plant = savedData.plant ? new Plant(savedData.plant.id, savedData.plant) : null;
            this.isLocked = savedData.isLocked !== undefined ? savedData.isLocked : false; // Default false for legacy saves
        } else {
            this.isWet = false;
            this.wetTimeRemaining = 0;
            this.plant = null;
            this.isLocked = false; // Set by manager init
        }
    }

    update() {
        if (this.isLocked) return;

        // Handle Soil Moisture
        if (this.isWet) {
            this.wetTimeRemaining -= (CONFIG.TICK_RATE / 1000);
            if (this.wetTimeRemaining <= 0) {
                this.isWet = false;
                this.wetTimeRemaining = 0;
            }
        }

        // Handle Plant Growth
        if (this.plant) {
            this.plant.update(this.isWet);
        }
    }

    serialize() {
        return {
            index: this.index,
            isWet: this.isWet,
            wetTimeRemaining: this.wetTimeRemaining,
            plant: this.plant ? this.plant.serialize() : null,
            isLocked: this.isLocked
        };
    }
}

class GardenManager {
    constructor() {
        this.plots = [];
        this.unlockedPlots = 3; // Initial unlocked count (though now tracked in plots)
        this.maxPlots = CONFIG.GRID_ROWS * CONFIG.GRID_COLS;
        this.initPlots();
    }

    initPlots() {
        // Initialize ALL plots
        for (let i = 0; i < this.maxPlots; i++) {
            const plot = new Plot(i);
            // Lock plots beyond initial unlocked count
            if (i >= this.unlockedPlots) {
                plot.isLocked = true;
            }
            this.plots.push(plot);
        }
    }

    unlockPlot(index) {
        // Validation: Must be a valid locked plot
        const plot = this.plots[index];
        if (!plot || !plot.isLocked) return false;

        // Validation: Order check. Can only unlock if it's the *next* one?
        // Let's just calculate cost based on index.
        // Cost: 50 base + 10 * (index - 3)
        // index starts at 0. Initial unlocked are 0,1,2.
        // First locked is 3. Cost for 3 should be 50.
        // Formula: 50 + (index - 3) * 10
        const cost = 50 + (index - 3) * 10;

        // Optional: Enforce sequential unlocking?
        // Find first locked plot
        const firstLockedIndex = this.plots.findIndex(p => p.isLocked);
        if (index !== firstLockedIndex) {
            UI.showToast("请先开垦前面的土地！");
            return false;
        }
        
        if (Resources.spendCoin(cost)) {
            plot.isLocked = false;
            this.unlockedPlots++;
            UI.renderGarden();
            UI.showToast(`解锁成功！消耗 ${cost} 金币`);
            return true;
        } else {
            UI.showToast(`金币不足！解锁需要 ${cost} 金币`);
            return false;
        }
    }

    getUnlockCost(index) {
        if (index < 3) return 0;
        return 50 + (index - 3) * 10;
    }

    plantSeed(index, seedId) {
        const plot = this.plots[index];
        if (plot.plant) {
            UI.showToast("这里已经种了植物！");
            return false;
        }
        
        if (Resources.getItemCount(seedId) > 0) {
            Resources.useItem(seedId);
            plot.plant = new Plant(seedId);
            UI.renderGarden();
            UI.showToast("种植成功！");
            
            // Task Update
            Tasks.updateTaskProgress('plant', 1);
            
            return true;
        } else {
            UI.showToast("种子不足！");
            return false;
        }
    }

    waterPlot(index) {
        const plot = this.plots[index];
        if (plot.isWet) {
            UI.showToast("土地已经是湿润的了。");
            return;
        }

        if (Resources.useResource('water', 10)) { // Cost 10 water
            plot.isWet = true;
            plot.wetTimeRemaining = 20; // Stays wet for 20 seconds
            UI.renderGarden();
            UI.showToast("浇水成功！");
            
            // Task Update
            Tasks.updateTaskProgress('water', 1);
        } else {
            UI.showToast("水资源不足！");
        }
    }

    harvestPlot(index) {
        const plot = this.plots[index];
        if (!plot.plant) return;
        
        if (plot.plant.isMature()) {
            const reward = plot.plant.def.sellPrice;
            Resources.addCoin(reward);
            // Chance to get seed back?
            // For now just money
            plot.plant = null; // Remove plant
            UI.renderGarden();
            UI.showToast(`收获成功！获得 ${reward} 金币`);
            
            // Task Update
            Tasks.updateTaskProgress('harvest', 1);

            // Gain Exp
            Resources.addExp(5); // Award 5 XP per harvest
            // Resources.level++; // Simplified leveling (Removed)
        } else {
            UI.showToast("植物还未成熟！");
        }
    }

    // Load/Save
    load(data) {
        if (data && data.plots) {
            // Merge loaded data with current structure
            // Important: Handle size changes if needed, but for now assuming compatible
            this.plots = data.plots.map((pData, idx) => new Plot(idx, pData));
            
            // Recalculate unlocked count
            this.unlockedPlots = this.plots.filter(p => !p.isLocked).length;
            
            // Re-init missing plots if save is old/smaller
            if (this.plots.length < this.maxPlots) {
                 for (let i = this.plots.length; i < this.maxPlots; i++) {
                     const plot = new Plot(i);
                     plot.isLocked = true;
                     this.plots.push(plot);
                 }
            }
        }
        UI.renderGarden();
    }

    getData() {
        return {
            plots: this.plots.map(p => p.serialize())
        };
    }

    update() {
        // Handle Global Boost Consumption
        if (Resources.sunlightBoostEnabled) {
            // Check if we have any active plants growing
            const hasGrowingPlants = this.plots.some(p => p.plant && !p.plant.isMature() && p.isWet);
            
            if (hasGrowingPlants) {
                // Consume 1 sun per tick total (not per plant)
                if (!Resources.useResource('sun', 1)) {
                    // Out of sun, auto-disable boost
                    Resources.sunlightBoostEnabled = false;
                    UI.updateBoostButtonState(); // Helper to update UI
                    UI.showToast("阳光耗尽，加速已停止！");
                }
            }
        }

        this.plots.forEach(plot => plot.update());
        UI.updateGardenState(this.plots); // Update progress bars/visuals without full re-render
    }
}

const Garden = new GardenManager();
