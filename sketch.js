let anemones = []; // 用來儲存所有水草屬性的陣列
let numAnemones = 150; // 水草數量
let bubbles = []; // 儲存水泡的陣列

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0); // 確保畫布固定在左上角
  canvas.style('z-index', '1'); // 讓畫布浮在 iframe 上層
  canvas.style('pointer-events', 'none'); // 允許滑鼠事件穿透畫布，這樣才能操作下方的網頁
  
  // 初始化產生每一條水草的屬性並存入陣列
  for (let j = 0; j < numAnemones; j++) {
    anemones.push({
      x: random(0, width), // 位置
      c: color(random(100, 255), random(50, 200), random(150, 255), 120), // 顏色
      h: random(100, 350), // 高度
      w: random(15, 65), // 粗細
      freq: random(0.5, 2.0), // 搖晃頻率 (乘數)
      rid: j // 亂數種子 ID (控制 noise 的第三維度)
    });
  }
}


function draw() {
    clear(); // 清除前一幀的畫面，避免透明背景不斷疊加變成不透明
    background('rgba(20, 80, 150, 0.3)'); // 設定深藍色背景，且透明度為 0.3
    
    // 透過陣列取出屬性來繪製每一條水草
    for (let i = 0; i < anemones.length; i++) {
        let a = anemones[i];
        anemone(a.x, a.rid, a.c, a.h, a.w, a.freq);
    }

    // 隨機產生新的水泡
    if (random() < 0.08) { // 控制每幀產生水泡的機率
        bubbles.push({
            x: random(width),
            y: height + 20, // 從畫面底部外面一點開始生成
            size: random(10, 25), // 水泡大小
            speed: random(1, 3), // 上升速度
            popHeight: random(height * 0.1, height * 0.7), // 隨機破裂的高度
            state: 'rising', // 狀態：上升中
            popTimer: 0 // 破裂動畫計時器
        });
    }

    // 更新與繪製水泡（反向迴圈以便在破裂後安全移除）
    for (let i = bubbles.length - 1; i >= 0; i--) {
        let b = bubbles[i];
        
        if (b.state === 'rising') {
            b.y -= b.speed; // 向上移動
            b.x += sin(b.y * 0.05) * 0.5; // 加上微微的左右搖晃，比較自然
            
            push();
            noStroke();
            // 畫水泡主體：白色，透明度 0.5 (255 * 0.5 ≒ 127)
            fill(255, 127); 
            ellipse(b.x, b.y, b.size);
            
            // 畫左上角反光點：白色，透明度 0.8 (255 * 0.8 ≒ 204)
            fill(255, 204);
            ellipse(b.x - b.size * 0.25, b.y - b.size * 0.25, b.size * 0.3);
            pop();
            
            // 如果到達破裂高度，切換為破裂狀態
            if (b.y <= b.popHeight) {
                b.state = 'popping';
            }
        } else if (b.state === 'popping') {
            // 破裂特效：畫一個逐漸擴大並消失的空心圓
            push();
            noFill();
            stroke(255, map(b.popTimer, 0, 15, 127, 0)); // 透明度隨時間遞減至 0
            strokeWeight(1.5);
            ellipse(b.x, b.y, b.size + b.popTimer * 2); // 圓圈變大
            
            // 加上向外散射的水花小點
            for(let j = 0; j < 5; j++) {
                let angle = TWO_PI / 5 * j;
                let r = b.size/2 + b.popTimer * 1.5;
                fill(255, map(b.popTimer, 0, 15, 200, 0));
                noStroke();
                ellipse(b.x + cos(angle)*r, b.y + sin(angle)*r, 2);
            }
            pop();
            
            b.popTimer++;
            // 動畫結束後從陣列中移除該水泡
            if (b.popTimer > 15) {
                bubbles.splice(i, 1);
            }
        }
    }
}
function anemone(xx,rid,clr,h,w,freq){  // 加入頻率參數 freq
    
    push();
    noFill(); // 確保海葵只畫線條而不填滿內部
    beginShape()
	    strokeWeight(w) // 根據傳入的參數 w 設定不同的粗細
			stroke(clr)
	    for(var i=0;i<h;i+=2){ // 限制最大長度為 h，並增加跨步效能
				
				let deltaFactor = map(i,0,h,0,1,true); // 根據整體的長度逐漸增加搖擺幅度，比較自然
		    let deltaX = deltaFactor*(noise(i/200,(frameCount*freq)/300,rid)-0.5)*200; // 加入 freq 參數改變搖晃頻率
				
				curveVertex(xx+deltaX, height - i) // 將 Y 座標改為 height - i，從畫面底部往上生長
		
	    }
	endShape()
    pop();
    
}

// 當瀏覽器視窗大小改變時，自動調整畫布以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
