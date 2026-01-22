const CONFIG = {
    // Game Settings
    TICK_RATE: 1000, // 1 second per tick
    SAVE_KEY: 'garden_world_save_v1',
    
    // Initial Resources
    INITIAL_COINS: 100,
    INITIAL_WATER: 50,
    INITIAL_SUN: 50,
    
    // Plant Definitions
    PLANTS: {
        carrot: {
            id: 'carrot',
            name: '胡萝卜',
            emoji: '🥕',
            cost: 10,
            sellPrice: 20,
            growthTime: 10, // seconds
            waterReq: 2,
            sunReq: 2,
            stages: 3
        },
        rose: {
            id: 'rose',
            name: '玫瑰',
            emoji: '🌹',
            cost: 30,
            sellPrice: 60,
            growthTime: 30,
            waterReq: 5,
            sunReq: 5,
            stages: 3
        },
        corn: {
            id: 'corn',
            name: '玉米',
            emoji: '🌽',
            cost: 50,
            sellPrice: 120,
            growthTime: 60,
            waterReq: 8,
            sunReq: 8,
            stages: 4
        }
    },
    
    // Shop Items (could include tools later)
    SHOP_ITEMS: [
        { type: 'seed', id: 'carrot' },
        { type: 'seed', id: 'rose' },
        { type: 'seed', id: 'corn' }
    ],

    // Grid Size
    GRID_ROWS: 4,
    GRID_COLS: 3
};
