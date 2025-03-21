// @license AGPL-3.0
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 初始化游戏尺寸
function init() {
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.95;
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth * 0.95;
        canvas.height = window.innerHeight * 0.95;
    });
}

// 玩家对象
class Player {
    constructor() {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.size = 20;
        this.speed = 5;
        this.color = '#00ff00';
        this.bullets = [];
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }

    shoot(targetX, targetY) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.bullets.push({
            x: this.x,
            y: this.y,
            dx: Math.cos(angle) * 10,
            dy: Math.sin(angle) * 10,
            size: 5
        });
    }
}

// 敌人对象
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.speed = 2;
        this.color = '#ff0000';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }

    update(player) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
}

// 游戏主循环
function gameLoop() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制玩家
    player.draw();
    
    // 更新和绘制子弹
    player.bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI*2);
        ctx.fill();
        
        // 移除屏幕外的子弹
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            player.bullets.splice(index, 1);
        }
    });

    // 更新和绘制敌人
    // 更新和绘制敌人（反向遍历以便安全删除）
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update(player);
        enemies[i].draw();

        // 检测子弹碰撞
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            const bullet = player.bullets[j];
            const dx = bullet.x - enemies[i].x;
            const dy = bullet.y - enemies[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemies[i].size + bullet.size) {
                // 移除敌人和子弹
                enemies.splice(i, 1);
                player.bullets.splice(j, 1);
                break; // 跳出子弹循环
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// 初始化游戏
const player = new Player();
const enemies = [];
init();
gameLoop();

// 生成敌人
setInterval(() => {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch(side) {
        case 0: // 上
            x = Math.random() * canvas.width;
            y = -50;
            break;
        case 1: // 右
            x = canvas.width + 50;
            y = Math.random() * canvas.height;
            break;
        case 2: // 下
            x = Math.random() * canvas.width;
            y = canvas.height + 50;
            break;
        case 3: // 左
            x = -50;
            y = Math.random() * canvas.height;
            break;
    }
    enemies.push(new Enemy(x, y));
}, 2000);

// 键盘控制
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// 鼠标点击事件（射击）
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.shoot(mouseX, mouseY);
});

// 移动处理
function handleMovement() {
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
}

// 更新游戏逻辑
setInterval(() => {
    handleMovement();
    
    // 限制玩家在屏幕内
    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

    // 敌人自动生成（确保在屏幕外生成）
    if(enemies.length < 5) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch(side) {
            case 0: x = -50; y = Math.random() * canvas.height; break;
            case 1: x = canvas.width + 50; y = Math.random() * canvas.height; break; 
            case 2: y = -50; x = Math.random() * canvas.width; break;
            case 3: y = canvas.height + 50; x = Math.random() * canvas.width; break;
        }
        enemies.push(new Enemy(x, y));
    }
}, 1000/60);
