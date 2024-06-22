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
}

class Player{
	static BLACK =  1;
	static EMPTY =  0;
	static WHITE = -1;
	constructor(type,isHolding){
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
	constructor(options){
		this.type = options.type;
		this.target = options.target || null;
		this.origin = options.origin || null;
	}
	
}

class Game {
	constructor(rule) {
		if (rule) {
			this.rule = rule;
		} else {
			this.rule = { 'sanxie': 1, 'sixie': 1, 'dagun': 2, 'fang': 1, 'tong': 3 }
		}
		this.board = new Board(25).fill(0);
		this.stage = 0; //游戏阶段，1布子2摘子3行子
		this.status = false; //游戏运行状态 true 运行中，false游戏停止
		this.walker = -1; //行子阶段的待行之子 0-24数字
		this.winner = null; //赢家
	}
	//开启游戏
	start() {
		this.stage = 1;
		this.status = true;
		this.players = [new Player(Player.BLACK,true),new Player(Player.WHITE,false)];
	}
	//切换执手方
	shiftHolder(){
		for(p of players){ p.isHolding = !p.isHolding }
	}
	
	getHolder(){
		for(p of players){ 
			if(p.isHolding){
				return p;
			}
		}
	}

	//执行玩家指令
	excute(action) {
		if(action.type === Action.APPEND){ //执行落子
			this.board[action.target] = getHolder().type;
			//检查是否有赢家、检查是否有成项、是否切换玩家
		}

		if(action.type === Action.MOVING){ //移动一子
			this.board[action.target] = this.board[action.origin];
			this.board[action.origin] = 0;
			//检查是否有赢家、检查是否有成项、是否切换玩家
		}

		if(action.type === Action.REMOVE){ //执行摘子
			this.board[action.target] = 0;
			//检查是否有赢家、摘子是否结束、是否切换玩家
		}

		if(action.type === Action.SELECT){ //选中一子
			this.walker = action.target;
		}

	}

}