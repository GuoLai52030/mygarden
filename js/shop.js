class ShopManager {
    constructor() {
        this.items = CONFIG.SHOP_ITEMS;
    }

    buyItem(itemId) {
        const itemDef = CONFIG.PLANTS[itemId]; // Assuming only seeds for now
        if (!itemDef) return false;

        if (Resources.spendCoin(itemDef.cost)) {
            Resources.addItem(itemId, 1);
            UI.showToast(`购买 ${itemDef.name} 成功！`);
            return true;
        } else {
            UI.showToast("金币不足！");
            return false;
        }
    }
    
    getShopItems() {
        return this.items.map(item => {
            const def = CONFIG.PLANTS[item.id];
            return {
                ...item,
                name: def.name,
                cost: def.cost,
                emoji: def.emoji
            };
        });
    }
}

const Shop = new ShopManager();
