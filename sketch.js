/*
----- Coding Tutorial by Patt Vira ----- 
Name: Interactive Falling Coins (with ml5.js handPose) 
Video Tutorial: https://youtu.be/Fp7nkcKi5Dw
Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

let grid = [];
let cols, rows;
let size = 10;

let handPose;
let video;
let hands = [];
let options = { flipped: true };
let showTKUET = false;
let tkuetIndex = 0;
let tkuetPixels = [];

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  cols = floor(width / size);
  rows = floor(height / size);
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let indexFinger = hand.keypoints[8];
    addCoins(indexFinger.x, indexFinger.y);
  }

  drawRect();

  // Coin Physics
  let nextGrid = [];
  for (let i = 0; i < cols; i++) {
    nextGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      nextGrid[i][j] = 0;
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      if (state > 0) {
        if (j + 1 < rows) {
          let below = grid[i][j + 1];
          let dir = (random() < 0.5) ? 1 : -1;
          let belowDiag = (i + dir >= 0 && i + dir <= cols - 1) ? grid[i + dir][j + 1] : 1;

          if (below == 0) {
            nextGrid[i][j + 1] = state;
          } else if (belowDiag == 0) {
            nextGrid[i + dir][j + 1] = state;
          } else {
            nextGrid[i][j] = state;
          }
        } else {
          nextGrid[i][j] = state;
        }
      }
    }
  }

  grid = nextGrid;

  // TKUET 顯示控制
  if (checkFull()) {
    if (!showTKUET) {
      showTKUET = true;
      tkuetPixels = getTKUETCoords();
      tkuetIndex = 0;
    } else {
      if (frameCount % 2 == 0 && tkuetIndex < tkuetPixels.length) {
        tkuetIndex++;
      }
    }
  }

  // 顯示學號與姓名（底部）
  textSize(24);
  fill(255, 150, 200); // 粉紅色
  textAlign(CENTER);
  textStyle(BOLDITALIC);
  text("413730168 許孟婕 期末實作", width / 2, height - 10);
  textStyle(NORMAL); // 讀取完再恢復預設，避免影響後續文字
}

function drawRect() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] > 0) {
        noStroke();
        let isLetter = showTKUET && tkuetPixels
          .slice(0, tkuetIndex)
          .some(p => p[0] === i && p[1] === j);
        fill(isLetter ? color(0, 153, 255, grid[i][j]) : color(255, 223, 0, grid[i][j]));
        ellipse(i * size + size / 2, j * size + size / 2, size, size);
        fill(0);
        rectMode(CENTER);
        rect(i * size + size / 2, j * size + size / 2, size / 3, size / 3);
      }
    }
  }
}

function checkFull() {
  let count = 0;
  for (let i = 0; i < cols; i++) {
    if (grid[i][rows - 1] > 0) {
      count++;
    }
  }
  return (count > cols * 0.9);
}

function getTKUETCoords() {
  let baseX = 10;
  let baseY = rows - 20;
  let coords = [];

  let letterT = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
             [2, 1], [2, 2], [2, 3], [2, 4], [2, 5]
  ];
  let letterK = [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
             [1, 3], [2, 2], [3, 1], [4, 0],
             [1, 4], [2, 5], [3, 6], [4, 7]
  ];
  let letterU = [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
    [1, 5], [2, 5], [3, 5]
  ];
  let letterE = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 3], [2, 3],
    [1, 5], [2, 5], [3, 5], [4, 5]
  ];
  let letterT2 = letterT;

  let letters = [letterT, letterK, letterU, letterE, letterT2];

  for (let l = 0; l < letters.length; l++) {
    let offsetX = baseX + l * 7;
    for (let [x, y] of letters[l]) {
      coords.push([offsetX + x, baseY + y]);
    }
  }

  return coords;
}

function addCoins(fingerX, fingerY) {
  let x = floor(fingerX / size);
  let y = floor(fingerY / size);
  x = constrain(x, 0, cols - 1);
  y = constrain(y, 0, rows - 1);
  grid[x][y] = (frameCount % 205) + 50;
}

function gotHands(results) {
  hands = results;
}
