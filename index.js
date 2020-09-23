const blackNumElem = document.getElementById("black_num");
const whiteNumElem = document.getElementById("white_num");
const currentColorElem = document.getElementById("currentColor");
const winnerElem = document.getElementById("winner");
const board = document.getElementById("board");
const tbody = board.querySelector("tbody");

const status = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, "white", "black", null, null, null],
  [null, null, null, "black", "white", null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
];
const directions = [
  // rowDiff, colDiff
  [-1, -1], // 左上
  [-1, 0], // 上
  [-1, 1], // 右上
  [0, -1], // 左
  [0, 1], // 右
  [1, -1], // 左下
  [1, 0], // 下
  [1, 1], // 右下
];
let currentColor = "black";
let winner = null;

function skip() {
  changeCurrentColor();
  updateUI();
}

function changeCurrentColor() {
  currentColor = currentColor === "black" ? "white" : "black";
}

function setStatus(rowIndex, colIndex) {
  if (!isValid(rowIndex, colIndex, currentColor)) return;
  status[rowIndex][colIndex] = currentColor;
  // 8方向に向かってひっくり返す探索と実行
  directions.forEach(([rowDiff, colDiff]) => {
    reverseDisc(rowDiff, colDiff, rowIndex + rowDiff, colIndex + colDiff);
  });
  // 置けるマスが無くなったら勝者判定
  if (getStatusCount(null) === 0) {
    const blackNum = getStatusCount("black");
    const whiteNum = getStatusCount("white");
    if (blackNum === whiteNum) winner = "draw";
    else if (blackNum > whiteNum) winner = "black";
    else winner = "white";
  }
  // 一方の色が0個になっても勝者判定
  if (getStatusCount("black") === 0) winner = "white";
  if (getStatusCount("white") === 0) winner = "black";
  changeCurrentColor();
  updateUI();
}

function reverseDisc(rowDiff, colDiff, currentRow, currentCol, dryRun = false) {
  /**
   * 再帰的にひっくり返せるか探索しひっくり返す
   * @param {Boolean} dryRun - trueでひっくり返さない
   * @return {Number} ひっくり返した数を返す
   */
  // 端に到達したら何もせずに探索した経路を戻る
  if (currentRow < 0 || currentRow >= 8 || currentCol < 0 || currentCol >= 8)
    return false;

  const targetColor = status[currentRow][currentCol];

  // nullに到達したら何もせずに探索した経路を戻る
  if (targetColor === null) return false;

  // currentColorであればひっくり返しながら探索した経路を戻る
  if (targetColor === currentColor) return 0;

  // currentColorでもnullでもない限り探索
  const sholdReverse = reverseDisc(
    rowDiff,
    colDiff,
    currentRow + rowDiff,
    currentCol + colDiff
  );
  if (sholdReverse === false) return sholdReverse;
  if (!dryRun) {
    status[currentRow][currentCol] = currentColor;
  }
  return sholdReverse + 1;
}

function isValid(rowIndex, colIndex, color) {
  // 何もおいてない かつ 置くとひっくり返せる石があることが条件
  return (
    status[rowIndex][colIndex] === null &&
    directions.some(
      ([rowDiff, colDiff]) =>
        reverseDisc(
          rowDiff,
          colDiff,
          rowIndex + rowDiff,
          colIndex + colDiff,
          true
        ) > 0
    )
  );
}

function getStatusCount(color) {
  return status.reduce((p, c) => p + c.filter((e) => e === color).length, 0);
}

function updateUI() {
  // ゲーム情報の表示
  blackNumElem.textContent = getStatusCount("black");
  whiteNumElem.textContent = getStatusCount("white");
  currentColorElem.textContent = {
    black: "黒",
    white: "白",
  }[currentColor];
  // 勝者の表示
  if (!!winner) {
    winnerElem.textContent = {
      draw: "引き分け!",
      black: "黒の勝ち!",
      white: "白の勝ち!",
    }[winner];
  }
  // テーブルの初期化
  tbody.innerHTML = "";
  // テーブル情報の更新
  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    const tr = document.createElement("tr");
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      const td = document.createElement("td");
      if (!!status[rowIndex][colIndex]) {
        const disc = document.createElement("div");
        disc.classList.add("disc");
        disc.classList.add(status[rowIndex][colIndex]);
        td.appendChild(disc);
      }
      td.onclick = () => {
        setStatus(rowIndex, colIndex);
      };
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

updateUI();
