class Task {
    constructor(id, description, type, goal, reward) {
        this.id = id;
        this.description = description;
        this.type = type; // 'plant', 'harvest', 'water'
        this.goal = goal;
        this.progress = 0;
        this.reward = reward; // { water, sun, coins }
        this.completed = false;
    }

    updateProgress(amount) {
        if (this.completed) return;

        this.progress += amount;
        if (this.progress >= this.goal) {
            this.progress = this.goal; // Cap at goal
            this.completed = true;
            this.giveReward();
        }
    }

    giveReward() {
        let msg = "任务完成！获得：";
        if (this.reward.water) {
            Resources.addResource('water', this.reward.water);
            msg += `💧${this.reward.water} `;
        }
        if (this.reward.sun) {
            Resources.addResource('sun', this.reward.sun);
            msg += `☀️${this.reward.sun} `;
        }
        if (this.reward.coins) {
            Resources.addCoin(this.reward.coins);
            msg += `💰${this.reward.coins} `;
        }
        
        // Award XP for completing task
        Resources.addExp(10); 
        msg += `⭐10 XP`;
        
        UI.showToast(msg);
        UI.updateTasksUI(); // Refresh UI if open
    }

    getProgress() {
        return `${this.progress}/${this.goal}`;
    }
    
    getPercent() {
        return (this.progress / this.goal) * 100;
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.generateTasks();
    }

    generateTasks() {
        // Daily Tasks (Simplified for now, just static list)
        this.tasks = [
            new Task(1, "新手种植：种植 3 个作物", "plant", 3, { water: 20, sun: 20, coins: 10 }),
            new Task(2, "勤劳浇水：浇水 5 次", "water", 5, { water: 30, sun: 10, coins: 5 }),
            new Task(3, "丰收时刻：收获 2 个作物", "harvest", 2, { water: 10, sun: 10, coins: 50 }),
            new Task(4, "扩建准备：种植 10 个作物", "plant", 10, { water: 50, sun: 50, coins: 100 }),
            new Task(5, "大丰收：收获 10 个作物", "harvest", 10, { water: 50, sun: 50, coins: 200 })
        ];
    }

    updateTaskProgress(type, amount = 1) {
        this.tasks.forEach(task => {
            if (!task.completed && task.type === type) {
                task.updateProgress(amount);
            }
        });
    }

    getTasks() {
        return this.tasks;
    }
}

const Tasks = new TaskManager();
