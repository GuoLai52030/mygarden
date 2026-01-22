class Plant {
    constructor(id, savedData = null) {
        this.id = id;
        this.def = CONFIG.PLANTS[id];
        
        if (savedData) {
            this.plantedTime = savedData.plantedTime;
            this.lastWateredTime = savedData.lastWateredTime;
            this.accumulatedGrowth = savedData.accumulatedGrowth || 0;
        } else {
            this.plantedTime = Date.now();
            this.lastWateredTime = 0; // Never watered
            this.accumulatedGrowth = 0; // In seconds
        }
    }

    // Called every tick (e.g. 1 sec)
    // isPlotWet: boolean
    update(isPlotWet) {
        if (this.isMature()) return;

        // Calculate Growth Speed based on Sunlight Boost
        let growthSpeed = 1;

        // Only boost if explicitly enabled by user
        if (Resources.sunlightBoostEnabled && Resources.sun >= 1) {
            // Boost factor: 2x speed (or adjustable)
            growthSpeed = 2;
            
            // Note: Consumption is handled globally or per plant? 
            // Requirement says "consume sun ... until disabled".
            // If handled per plant, 9 plants = 9 sun/sec. That's fast.
            // Let's assume the boost is global, but consumption is maybe per active plant or global rate?
            // "System should consume ... e.g. 1 unit per second".
            // Let's handle consumption in GardenManager to be cleaner, OR here if per plant.
            // Requirement: "Every time boost is enabled... system consumes... e.g. 1 unit".
            // If it's 1 unit TOTAL, handle in Garden/Main. If 1 unit PER PLANT, handle here.
            // "Consume a certain amount... e.g. 1 unit/sec".
            // Let's assume 1 unit TOTAL per second for simplicity, handled in Main loop or Garden update.
            // But wait, "Modify Plant.update...".
            // Let's stick to: If boost is ON, plant grows faster.
            // Consumption logic will be moved to Garden.update() to avoid draining 9 sun/sec if user has full grid.
        }

        if (isPlotWet) {
            this.accumulatedGrowth += (CONFIG.TICK_RATE / 1000) * growthSpeed;
        }
    }

    getGrowthPercentage() {
        return Math.min(100, (this.accumulatedGrowth / this.def.growthTime) * 100);
    }

    isMature() {
        return this.accumulatedGrowth >= this.def.growthTime;
    }

    getStage() {
        const pct = this.getGrowthPercentage();
        if (pct >= 100) return this.def.stages; // Final stage
        // Map 0-99% to 1-(stages-1)
        return Math.floor((pct / 100) * (this.def.stages - 1)) + 1;
    }

    // Get the plant icon based on growth stage
    getPlantIcon() {
        const pct = this.getGrowthPercentage();
        if (pct < 60) {
            return '🌱'; // Seedling icon for early stages
        }
        return this.def.emoji; // Mature icon
    }

    // Get scale based on growth percentage for smooth transition
    getScale() {
        const pct = this.getGrowthPercentage();
        if (pct < 60) {
            // Scale seedling from 0.5 to 0.8
            return 0.5 + (pct / 60) * 0.3;
        } else {
            // Transition to full plant, scale from 0.8 to 1.0 (or slightly larger bounce)
            // Map 60-100 to 0.8-1.0
            return 0.8 + ((pct - 60) / 40) * 0.3;
        }
    }

    serialize() {
        return {
            id: this.id,
            plantedTime: this.plantedTime,
            lastWateredTime: this.lastWateredTime,
            accumulatedGrowth: this.accumulatedGrowth
        };
    }
}
