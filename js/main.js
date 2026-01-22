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

    // Start Resource Regeneration
    Resources.startRegeneration();
    
    // Game Loop
    setInterval(() => {
        Garden.update();
        Resources.save(); // Auto save
    }, 1000);

    // Initial Story Trigger (Intro)
    // Check if task 1 is not completed, then show intro story
    const firstTask = Tasks.tasks.find(t => t.id === 1);
    if (firstTask && !firstTask.completed) {
        setTimeout(() => {
            Stories.checkTrigger(0); // 0 is trigger for intro
        }, 1000);
    }
});
