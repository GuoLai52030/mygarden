class Story {
    constructor(id, title, content, triggerTaskId, nextTaskId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.triggerTaskId = triggerTaskId; // Which task triggers this story
        this.nextTaskId = nextTaskId; // Which task to start after this story (optional)
        this.choices = []; // Optional choices
    }
}

class StoryManager {
    constructor() {
        this.stories = [];
        this.currentStory = null;
        this.completedStories = []; // Track completed stories
        this.initStories();
    }

    initStories() {
        // Initial Story
        this.stories.push(new Story(1, "新的开始", "欢迎来到你的小花园！这里荒废已久，但充满了希望。作为新的农场主，你的第一步是种下希望的种子。去种下3个胡萝卜吧！", 0, 1));
        
        // Story after Task 1 (Plant 3 carrots) -> Start Task 2 (Water 5 times)
        this.stories.push(new Story(2, "生命的源泉", "干得好！种子已经种下了，但它们需要水才能生长。拿起你的水壶，给这些小生命一些滋润吧。", 1, 2));

        // Story after Task 2 -> Start Task 3 (Harvest 2)
        this.stories.push(new Story(3, "收获的喜悦", "看！它们长得多快。是时候享受劳动的果实了。去收获一些成熟的胡萝卜吧！", 2, 3));
        
        // Story after Task 3 -> Start Task 4 (Plant 10)
        this.stories.push(new Story(4, "扩大规模", "太棒了！你已经掌握了基本的技巧。现在，让我们把花园变得更热闹些。尝试种植更多的作物吧！", 3, 4));
    }

    // Check if a story should be triggered for a completed task
    checkTrigger(completedTaskId) {
        const story = this.stories.find(s => s.triggerTaskId === completedTaskId);
        if (story) {
            this.showStory(story);
        }
    }

    showStory(story) {
        this.currentStory = story;
        // Mark as completed/seen if not already
        if (!this.completedStories.includes(story)) {
            this.completedStories.push(story);
        }

        const container = document.getElementById('story-container');
        const titleEl = document.getElementById('story-title');
        const bodyEl = document.getElementById('story-body-content');
        const btnContinue = document.getElementById('continue-story');

        titleEl.textContent = story.title;
        bodyEl.innerHTML = `<p>${story.content}</p>`;
        
        container.classList.remove('hidden');

        // Unbind previous events to avoid stacking
        const newBtn = btnContinue.cloneNode(true);
        btnContinue.parentNode.replaceChild(newBtn, btnContinue);
        
        newBtn.addEventListener('click', () => {
            this.closeStory();
            if (story.nextTaskId) {
                // Here we would ideally unlock or highlight the next task
                // For now, let's just toast
                // UI.showToast(`新任务已解锁！`);
            }
        });
    }

    closeStory() {
        document.getElementById('story-container').classList.add('hidden');
        this.currentStory = null;
    }

    // Story Record Feature
    showStoryRecord() {
        const container = document.getElementById('story-record-container');
        const body = document.getElementById('story-record-body');
        body.innerHTML = '';

        if (this.completedStories.length === 0) {
            body.innerHTML = '<p style="color:#999; margin-top:50px;">暂无剧情记录</p>';
        } else {
            this.completedStories.forEach(story => {
                const item = document.createElement('div');
                item.className = 'story-record-item';
                item.innerHTML = `
                    <h3>${story.title}</h3>
                    <p>${story.content}</p>
                `;
                item.addEventListener('click', () => {
                     // Re-show story detail in a modal or just alert
                     UI.showModal(story.title, `<p>${story.content}</p>`);
                });
                body.appendChild(item);
            });
        }
        
        container.classList.remove('hidden');
    }

    closeStoryRecord() {
        document.getElementById('story-record-container').classList.add('hidden');
    }
}

const Stories = new StoryManager();