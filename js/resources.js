class ResourceManager {
    constructor() {
        this.coins = CONFIG.INITIAL_COINS;
        this.water = CONFIG.INITIAL_WATER;
        this.sun = CONFIG.INITIAL_SUN;
        this.level = 1;
        this.exp = 0;
        this.inventory = {
            'carrot': 2 // Start with some seeds
        };
        this.regenInterval = null;
        this.sunlightBoostEnabled = false; // New state
    }

    startRegeneration() {
        // Passive regeneration: 1 water every 60 seconds
        if (this.regenInterval) clearInterval(this.regenInterval);
        this.regenInterval = setInterval(() => {
            this.addResource('water', 1);
            // Sun is not auto-regenerated (user decision or task based?) 
            // User prompt said "enable water regeneration... 1 min 1 drop".
            // So we only regen water here.
        }, 60000); // Every 60 seconds
    }

    addCoin(amount) {
        this.coins += amount;
        UI.updateResources();
        this.save();
    }

    spendCoin(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            UI.updateResources();
            this.save();
            return true;
        }
        return false;
    }

    addResource(type, amount) {
        if (type === 'water') this.water += amount;
        if (type === 'sun') this.sun += amount;
        UI.updateResources();
        this.save();
    }

    useResource(type, amount) {
        if (type === 'water') {
            if (this.water >= amount) {
                this.water -= amount;
                UI.updateResources();
                return true;
            }
        } else if (type === 'sun') {
            if (this.sun >= amount) {
                this.sun -= amount;
                UI.updateResources();
                return true;
            }
        }
        return false;
    }

    addItem(itemId, amount = 1) {
        if (!this.inventory[itemId]) {
            this.inventory[itemId] = 0;
        }
        this.inventory[itemId] += amount;
        this.save();
    }

    useItem(itemId) {
        if (this.inventory[itemId] && this.inventory[itemId] > 0) {
            this.inventory[itemId]--;
            this.save();
            return true;
        }
        return false;
    }

    getItemCount(itemId) {
        return this.inventory[itemId] || 0;
    }

    // Load from local storage or use defaults
    load() {
        const saved = localStorage.getItem(CONFIG.SAVE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            this.coins = data.resources.coins;
            this.water = data.resources.water;
            this.sun = data.resources.sun;
            this.level = data.resources.level;
            this.exp = data.resources.exp || 0; // Load exp or default 0
            this.inventory = data.inventory;
        }
        // UI update should be handled by the caller after init
    }

    save() {
        const data = {
            resources: {
                coins: this.coins,
                water: this.water,
                sun: this.sun,
                level: this.level,
                exp: this.exp
            },
            inventory: this.inventory
        };
        // We will merge this with garden data in the main save loop usually,
        // but for simplicity, let's just save resources here separately or
        // let the Game class handle the full save.
        // For now, let's expose a getData method for the Game class to use.
    }

    // Level System
    addExp(amount) {
        this.exp += amount;

        // Check level up
        if (this.exp >= this.getExpForNextLevel()) {
            this.levelUp();
        }

        UI.updateResources();
        this.save();
    }

    levelUp() {
        this.level++;
        this.exp = 0; // Reset exp or keep overflow? Simple reset for now.
        UI.showToast(`🎉 等级提升！当前等级：Lv.${this.level}`);
        // Could unlock things here
    }

    getExpForNextLevel() {
        return 100 * this.level;
    }

    getData() {
        return {
            coins: this.coins,
            water: this.water,
            sun: this.sun,
            level: this.level,
            exp: this.exp
        };
    }
}

const Resources = new ResourceManager();
