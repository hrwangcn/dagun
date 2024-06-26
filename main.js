//扩展Array原型，添加reshape方法
Array.prototype.reshape = function (rows, cols) {
	if (this.length !== rows * cols) {
		throw new Error("原始数组的元素数量与目标形状不匹配");
	}
	let result = [];
	for (let i = 0; i < rows; i++) {
		result[i] = this.slice(i * cols, i * cols + cols);
	}
	return result;
};
/**
 *   0    1    2    3    4
 *
 *   5    6    7    8    9
 *
 *  10   11   12   13   14
 *
 *  15   16   17   18   19
 *
 *  20   21   22   23   24
 */
//当前执手方，1黑-1白，黑先白后
let currentHolder = 0;
//空棋盘
let board = new Array(25).fill(0);
//定义成项消子数
let removeNum = {
	dagun: 2,  //大棍
	sanxie: 1,  //三斜
	sixie: 1,  //四斜
	xiaofang: 1,  //小方
	tongtian: 3,//通天
}

function init(mode) {
	if (mode) {
		//deal with mode
	} else {
		//set default mode
	}
	currentHolder = 1;
}

/**
 * 检查该格子能否落子
 */
function checkDropable(index) {
	return board[index] === 0;
}

/**
 * 检查该格子能否提子
 */
function checkRemovable(index) {
	return !isItemPoint(index);
}

/**
 * 检查某方是否无敌，棋盘上没有该方棋子返回false
 */
function checkInvincible(holder) {
	if (board.some(v => v === holder)) {
		return !board.some((_, i) => checkRemovable(i));
	}
	return false;
}

/**
 * 确认棋盘是否满位
 * @returns 
 */
function isBoardFull() {
	return !board.some(value => value === 0);
}

/**
 * 检查棋盘是否还有敌子
 */
function hasEnemey(holder) {
	return board.some(value => value === -holder);
}

/**
 * 执行落子
 */
function dropChess(index) {
	if (checkDropable(index)) {
		board[index] = currentHolder;
		return true;
	}
	return false;
}

/**
 * 执行消除
 */
function removeChess(index) {
	checkRemovable(index) && (board[index] = 0);
}

/**
 * 根据成项信息获取消子机会、成项信息
 */
function checkItem(index) {
	let relatedVectors = getRelatedVectors(index);
	return validateItem(
		[relatedVectors.row, relatedVectors.col],
		[relatedVectors.ltrb, relatedVectors.lbrt],
		[relatedVectors.lt, relatedVectors.ld, relatedVectors.rt, relatedVectors.rd]
	);
}

/**
 * 校验某一格点是否为成项点
 */
function isItemPoint(index) {
	let relatedVectors = getRelatedVectors(index);
	return Object.values(relatedVectors).some(checkPattern);
}

/**
 * 提取该棋子所有向量和以其为顶点的方块
 */
function getRelatedVectors(index) {
	let rowIndex = Math.floor(index / 5);
	let colIndex = Math.floor(index % 5);
	let squares = getSuqares(index);
	return {
		...{
			col: board.filter((_, j) => (j % 5 | 0) === colIndex),
			row: board.filter((_, i) => (i / 5 | 0) === rowIndex),
			ltrb: board.filter((_, i) => (i % 5 - (i / 5 | 0)) === (colIndex - rowIndex)),
			lbrt: board.filter((_, i) => (i % 5 + (i / 5 | 0)) === (colIndex + rowIndex)),
		}, ...squares
	};
}

/**
 * 校验数组是否成项，更新消子机会、成项信息
 */
function validateItem(sticks, bevels, squares) {
	let itemNames = [];
	let removeChance = 0;
	// 三斜、四斜、通天
	for (bevel of bevels) {
		if (bevel.length === 3 && checkPattern(bevel)) {
			removeChance += removeNum.sanxie;
			itemNames.push("三斜");
		}
		if (bevel.length === 4 && checkPattern(bevel)) {
			removeChance += removeNum.sixie;
			itemNames.push("四斜");
		}
		if (bevel.length === 5 && checkPattern(bevel)) {
			removeChance += removeNum.tongtian;
			itemNames.push("通天");
		}
	}
	//大棍
	for (stick of sticks) {
		if (checkPattern(stick)) {
			removeChance += removeNum.dagun;
			itemNames.push("大棍");
		}
	}
	//小方
	for (square of squares) {
		if (square != undefined && checkPattern(square)) {
			removeChance += removeNum.xiaofang;
			itemNames.push("小方");
		}
	}
	return { removeChance: removeChance, itemNames: itemNames };
}

/**
 * 校验输入数组元素是否符合成项花样，数组长度不小于3且每个元素都相同
 */
function checkPattern(arr) {
	return (arr.length > 2)
		&& arr.every(element => element === arr[0]);
}

/**
 * 获取落子所在的区块
 */
function getSuqares(index) {
	matrix = board.reshape(5, 5);
	i = index / 5 | 0;
	j = index % 5;
	let squares = {};
	// 检查边界条件，避免数组越界
	if (i + 1 < matrix.length && j + 1 < matrix[0].length) {
		// 右下角子矩阵
		squares.rd =
			[matrix[i][j], matrix[i][j + 1], matrix[i + 1][j], matrix[i + 1][j + 1]];
	}
	if (i > 0 && j + 1 < matrix[0].length) {
		// 右上角子矩阵
		squares.ld =
			[matrix[i - 1][j], matrix[i - 1][j + 1], matrix[i][j], matrix[i][j + 1]];
	}
	if (i + 1 < matrix.length && j > 0) {
		// 左下角子矩阵
		squares.rt =
			[matrix[i][j - 1], matrix[i][j], matrix[i + 1][j - 1], matrix[i + 1][j]];
	}
	if (i > 0 && j > 0) {
		// 左上角子矩阵
		squares.lt =
			[matrix[i - 1][j - 1], matrix[i - 1][j], matrix[i][j - 1], matrix[i][j]];
	}
	// console.log(index,squares);
	return squares;
}

class Board extends Array {
	constructor(...args) {
		super(...args);
		this.reshape = (rows, cols) => {
			if (rows * cols === this.length) {
				let result = [];
				for (let i = 0; i < rows; i++) {
					result[i] = this.slice(i * cols, i * cols + cols)
				}
				return result;
			}
			else {
				throw new Error("Shape Error!");
			}
		}
	}
}

class Utils {
	constructor() { }
	//检查棋盘是否全满
	static isBoardFull = board => {
		return !board.some(value => value === 0);
	}
	//获取棋子所在行
	static getRow = (board, index) => {
		return board.reshape(5, 5)[index / 5 | 0];
	}
	//获取棋子所在列
	static getCol = (board, index) => {
		return board.reshape(5, 5).map(row => row[index % 5]);
	}
	//左上到右下斜线
	static getLeftup2Rightdown = (board, index) => {
		return board.filter((_, i) => (i % 5 - (i / 5 | 0)) === (Math.floor(index % 5) - Math.floor(index / 5)));
	}
	//右上到左下斜线
	static getRightup2Leftdown = (board, index) => {
		return board.filter((_, i) => (i % 5 + (i / 5 | 0)) === (Math.floor(index % 5) + Math.floor(index / 5)));
	}
	//第一象限
	static getQuadrant1 = (board, index) => {
		if ((index / 5 | 0) > 0 && (index % 5) + 1 < 5) {
			return [board[index], board[index + 1], board[index - 4], board[index - 5]];
		}
		return undefined;
	}
	//第二象限
	static getQuadrant2 = (board, index) => {
		if ((index / 5 | 0) > 0 && (index % 5) > 0) {
			return [board[index], board[index - 5], board[index - 6], board[index - 1]];
		}
		return undefined;
	}
	//第三象限
	static getQuadrant3 = (board, index) => {
		if ((index / 5 | 0) + 1 < 5 && (index % 5) > 0) {
			return [board[index], board[index - 1], board[index + 4], board[index + 5]];
		}
		return undefined;
	}
	//第四象限
	static getQuadrant4 = (board, index) => {
		if ((index / 5 | 0) + 1 < 5 && (index % 5) + 1 < 5) {
			return [board[index], board[index + 5], board[index + 6], board[index + 1]];
		}
		return undefined;
	}

	//两个位置是否相邻
	static isNeighbour(walker, location) {
		if (location === walker - 5 || location === walker + 5) {
			return true;
		} else if (location / 5 | 0 === walker / 5 | 0) {
			if (location === walker - 1 || location === walker + 1) {
				return true;
			}
		}
		return false;
	}

	//location处是否可行
	static isMovable(board, location) {
		if (board[location - 5] === 0 || board[location + 5] === 0) {
			return true;
		} else if ((location - 1) / 5 | 0 === location / 5 | 0) {
			if (board[location - 1] === 0) return true;
		} else if ((location + 1) / 5 | 0 === location / 5 | 0) {
			if (board[location + 1] === 0) return true;
		}
		return false;
	}
}

class Player {
	static BLACK = 1;
	static EMPTY = 0;
	static WHITE = -1;
	constructor(type, isHolding) {
		this.type = type;
		this.removes = 0; //剩余摘子次数
		this.isWinner = false; //是否赢得了本场游戏
		this.isHolding = isHolding; //处于执手状态
	}
}

class Action {
	static APPEND = 0; //落子  赢、开启下一阶段
	static REMOVE = 1; //提子
	static SELECT = 2; //选中棋子待行
	static MOVING = 3; //待行子行动到指定位置

	constructor(options) {
		this.type = options.type;
		this.target = options.target || null;
		this.origin = options.origin || null;
	}

}

class Game {
	static NOTRUN = 0;
	static APPEND = 1;
	static REMOVE = 2;
	static MOVING = 3;
	constructor(rule) {
		if (rule) {
			this.rule = rule;
		} else {
			this.rule = { 'sanxie': 1, 'sixie': 1, 'dagun': 2, 'fang': 1, 'tong': 3 }
		}
		this.board = new Board(25).fill(0);
		this.stage = Game.NOTRUN; //游戏阶段，1布子2摘子3行子
		this.walker = -1; //行子阶段的待行之子 0-24数字
		this.winner = null; //赢家
	}
	//开启游戏
	start() {
		this.stage = Game.APPEND;
		this.players = [new Player(Player.BLACK, true), new Player(Player.WHITE, false)];
	}
	//切换执手方
	shiftHolder() {
		this.players.every(player => player.isHolding = !player.isHolding);
	}
	//获取当前执手方
	getHolder() {
		return this.players.find(player => player.isHolding);
	}
	//将执手方设置为某一方
	setHolder(type) {
		this.players.find(player => player.type === type).isHolding = true;
		this.players.find(player => player.type != type).isHolding = false;
	}

	//将事件转化为Action
	getAction(location) {
		//落子，Game处于APPEND 两个Player的removes都为0 board此处为0
		if (this.stage === Game.APPEND &&
			this.players.every(player => player.removes === 0) &&
			this.board[location] === 0) {
			return new Action({ type: Action.APPEND, target: location });
		}
		//提子，Game不处于NOTRUN阶段，存在player的removes大于0，board此处为敌子
		if (this.stage != Game.NOTRUN &&
			this.players.some(player => player.removes > 0) &&
			this.board[location] === -this.getHolder().type) {
			return new Action({ type: Action.REMOVE, target: location });
		}
		//选中棋子待行，Game处于MOVING阶段，Game.walker为-1，board此处是友军，location可行
		if (this.stage === Game.MOVING &&
			this.walker === -1 && Utils.isMovable(this.board, location) &&
			this.board[location] === this.getHolder().type) {
			return new Action({ type: Action.SELECT, target: location });
		}
		//行子，Game处于MOVING阶段，Game.walker不为-1，
		// board[Game.walker]是友军，board[location]为0,location和walker相邻
		if (this.stage === Game.MOVING && this.walker != -1 && this.board[location] === 0 &&
			Utils.isNeighbour(this.walker, location) &&
			this.board[this.walker] === this.getHolder().type) {
			return new Action({ type: Action.MOVING, target: location, origin: this.walker });
		}
		throw new Error("不是正确的操作");
	}

	//执行玩家指令
	excute(action) {
		if (action.type === Action.APPEND) { //执行落子
			this.board[action.target] = getHolder().type;
			//检查是否有赢家、检查是否有成项、是否切换玩家、是否进入摘子（白子先摘）
		}

		if (action.type === Action.MOVING) { //移动一子
			this.board[action.target] = this.board[action.origin];
			this.board[action.origin] = 0;
			//检查是否有赢家、检查是否有成项、是否切换玩家
		}

		if (action.type === Action.REMOVE) { //执行摘子
			this.board[action.target] = 0;
			//检查是否有赢家、摘子是否结束（无法继续摘子或结束归零）、是否切换玩家、是否开启下一阶段
		}

		if (action.type === Action.SELECT) { //选中一子
			this.walker = action.target;
		}

	}

	//判断输赢
	findWinner() {
		//落子阶段确认赢家，一方的棋子个数大于13个
		if (this.stage === Game.APPEND) {
			if (this.board.reduce((i, piece) => { return i + (piece === Player.BLACK ? 1 : 0) }, 0) > 13) {
				return this.players.find(player => player.type = Player.BLACK);
			}
			if (this.board.reduce((i, piece) => { return i + (piece === Player.WHITE ? 1 : 0) }, 0) > 13) {
				return this.players.find(player => player.type = Player.WHITE);
			}
			return null;
		}
		//摘子阶段和行子阶段少子判负
		if (this.stage === Game.REMOVE || this.stage === Game.MOVING) {
			if (this.board.reduce((i, piece) => { return i + (piece === Player.BLACK ? 1 : 0) }, 0) < 3) {
				return this.players.find(player => player.type = Player.WHITE);
			}
			if (this.board.reduce((i, piece) => { return i + (piece === Player.WHITE ? 1 : 0) }, 0) < 3) {
				return this.players.find(player => player.type = Player.BLACK);
			}
		}
		//行子阶段，闷杀
		if (this.stage === Game.MOVING) {
			//黑子不可移动，赢家是白子
			if (!board.some(value, i => value === Player.BLACK && Utils.isMovable(this.board, i))) {
				return this.players.find(player => player.type = Player.WHITE);
			}
			//白子不可移动，赢家是黑子
			if (!board.some(value, i => value === Player.WHITE && Utils.isMovable(this.board, i))) {
				return this.players.find(player => player.type = Player.BLACK);
			}
		}
		return null;
	}

	//格点是否成项点
	isItemPoint(location) {
		let relatedVectors = getRelatedVectors(location);
		return relatedVectors.some(vector => {
			vector.length > 3 && vector.every(piece => piece === vector[0])
		});
	}

	//确认落子参与哪些成项
	getItems(location) {
		let items = { 'sanxie': 0, 'sixie': 0, 'dagun': 0, 'fang': 0, 'tong': 0 };
		let relatedVectors = getRelatedVectors(location);
		relatedVectors.forEach((vector, index) => {
			if (vector && vector.every(piece => piece === vector[0])) {
				switch (index) {
					case 0 || 1: items.dagun++; break; //行列
					case 2 || 3: switch (vector.length) {  //正斜、反斜
						case 3: items.sanxie++; break;
						case 4: items.sixie++; break;
						case 5: items.tong++; break;
					}; break;
					case 4 || 5 || 6 || 7: items.fang++; break; //小方
				}
			}
		});
	}

	//获取格点相关向量
	getRelatedVectors(location) {
		return [
			Utils.getCol(this.board, location),
			Utils.getRow(this.board, location),
			Utils.getLeftup2Rightdown(this.board, location),
			Utils.getRightup2Leftdown(this.board, location),
			Utils.getQuadrant1(this.board, location),
			Utils.getQuadrant2(this.board, location),
			Utils.getQuadrant3(this.board, location),
			Utils.getQuadrant4(this.board, location)
		];
	}

}
