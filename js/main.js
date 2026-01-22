// Main Entry Point

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI First (caches DOM)
    UI.init();

    // Initialize Systems
    Resources.load();
    UI.updateResources(); // Update UI with loaded data
    
    // Render Initial State
    UI.renderGarden();
    
    setTimeout(() => {
        UI.showToast("欢迎来到花园世界！点击空地开始种植吧 🌱");
    }, 500);

    // Start Resource Regeneration (DISABLED for Task System)
    // Resources.startRegeneration();
    
    // Game Loop
    let lastTick = Date.now();

    setInterval(() => {
        const now = Date.now();
        // const delta = now - lastTick; // Not using delta for simplicity in this version, trusting interval
        lastTick = now;

        // Update Logic
        Garden.update();

        // Auto Save occasionally
        if (now % 10000 < 1000) { // Every ~10 seconds
             // Resources.save(); // Resources saves on change, but we could add a full save here
        }

    }, CONFIG.TICK_RATE);

    console.log("Garden World Started!");
});
