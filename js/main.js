'use strict';

let canvas, context;
const [width, height] = [500, 600];
const stars = new Array();
let points = new Array(), shots = new Array();
let px, py, time = 0;
let startTime, prevTime, elapsedTime;
let status = "ready";

class Shot {
    constructor(type, x = 0, y = 0, angle = 0, delay = 0){
        this.type = type;
        this.x = Math.floor(Math.random()* (width - 50)) + 25;
        this.y = Math.floor(Math.random()* (height - 50)) + 25;
        this.r = width / 2;
        if (type == "shot")[this.x, this.y, this.r] = [x, y, 10];
        this.angle = angle;
        this.delay = delay;
    }
    update(){
        if(this.type == "point"){
            this.r -= this.r / 20;
            drawCircle(this.x, this.y, this.r, null, "cyan");
        } else if (this.type == "shot"){
            this.delay--;
            if(this.delay < 0){
                this.x += Math.cos(this.angle) * 2;
                this.y += Math.sin(this.angle) * 2;
                drawCircle(this.x, this.y, this.r, "lightyellow", "lime");
            }
        }
    }
}

const init = ()=>{
    canvas = document.getElementById("space");
    // 引数を"2d"とすることで2Dグラフィックの描画に特化したメソッドやプロパティを持つオブジェクトを取得
    context = canvas.getContext("2d");
    [canvas.width, canvas.height] = [width, height];
    context.lineWidth = 4;

    canvas.addEventListener("click", startGame);
    canvas.addEventListener("mousemove", movePlayer);

    for (let i = 0; i < 100; i++){
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 1.5;
        stars.push({x:x, y:y, r:r});

    }

    update();
}

const startGame = event => {
    if(status != "play"){
        [points, shots] = [[], []];
        // Date.nowはUTCから現在までの経過ミリ秒
        [startTime, prevTime, elapsedTime] = [Date.now(), Date.now(), 0];
        movePlayer(event);
        status = "play";
    }
}

const movePlayer = event => {
    // キャンバス内のマウスカーソルの座標
    const canvasRect = canvas.getBoundingClientRect();
    px = event.clientX - canvasRect.left;
    py = event.clientY - canvasRect.top - 10;
}

const update = () => {
    context.fillStyle = "rgba(0,0,60,0.5)";
    context.fillRect(0,0, canvas.width, canvas.height);
    for (const star of stars){
        if(Math.random() > 0.1)drawCircle(star.x, star.y, star.r, "white");
    }
    if (status == "play"){
        elapsedTime += Date.now() - prevTime;
        [prevTime, time] = [Date.now(), Date.now() - startTime];

        if(elapsedTime > 1000){
            elapsedTime = 0;
            points.push(new Shot("point"));
        }

        
        const shape = [[20, 20], [0, -20], [-20, 20]];
        context.fillStyle = "tomato";
        context.beginPath();
        context.moveTo(px + shape[0][0], py + shape[0][1]);
        for(let i=1; i < shape.length; i++){
            context.lineTo(px + shape[i][0], py + shape[i][1]);
        }
        context.fill();
    }

    for(let i = points.length - 1; i >= 0; i--){
        if(points[i].r <= 1){
            const [x, y] = [points[i].x, points[i].y];
            let angle = 0;
            if ((time/1000 > 10)&&(Math.random() > 0.5)){
                for (let j=0; j<16; j++){
                    angle += Math.PI*2 / 16;
                    shots.push(new Shot("shot", x, y, angle));                   
                }
            }else if ((time/1000 > 20)&&(Math.random() > 0.5)){
                for (let j=0; j<64; j++){
                    angle += Math.PI*2 / 18;
                    shots.push(new Shot("shot", x, y, angle, 63 - j));                   
                }               
            }else {
                for (let j=0; j<5; j++){
                    angle += Math.PI*2 * Math.random();
                    shots.push(new Shot("shot", x, y, angle));                   
                }
            }
            points.splice(i, 1);
        }else {
            points[i].update();
        }
    }

    for(let i = shots.length - 1; i > 0; i--){
        shots[i].update();
        let[x, y, r] = [shots[i].x, shots[i].y, shots[i].r];
        if (Math.hypot(px-x, py-y) < 20) status = "end";
        if((x < -r) || (x > width+r) || (y < -r) || (y > height+r)){
            shots.splice(i, 1);
        }
    }

    drawText(`TIME: ${(time/1000).toFixed(1)}`, 5, 5, 20, "white", "left", "top");
    if(status == "end") {
        drawText("GAME OVER", width/2, height/2 - 30, 50, "red");
        drawText("Click here to replay", width/2, height/2+20, 30, "white");
    } else if (status == "ready") {
        drawText("Click here to start", width/2, height/2+20, 30, "white");
    }
    window.requestAnimationFrame(update);
}

const drawCircle = (x, y, r, color1, color2 = null) => {
    context.fillStyle = color1;
    context.strokeStyle = color2;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI*2);
    if(color2 != null) context.stroke();
    if(color1 != null) context.fill();

}

const drawText = (text, x, y, size, color, align = "center", base = "middle") => {
    context.font = `${size}px Arial Black`;
    context.textAlign = align;
    context.textBaseline = base;
    context.fillStyle = color;
    context.fillText(text, x, y);
}
