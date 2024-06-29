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
    static isBoardFull(board) {
        return !board.some(value => value === 0);
    }
    //获取棋子所在行
    static getRow(board, index) {
        return board.reshape(5, 5)[index / 5 | 0];
    }
    //获取棋子所在列
    static getCol(board, index) {
        return board.reshape(5, 5).map(row => row[index % 5]);
    }
    //左上到右下斜线
    static getLeftup2Rightdown(board, index) {
        return board.filter((_, i) => (i % 5 - (i / 5 | 0)) === (Math.floor(index % 5) - Math.floor(index / 5)));
    }
    //右上到左下斜线
    static getRightup2Leftdown(board, index) {
        return board.filter((_, i) => (i % 5 + (i / 5 | 0)) === (Math.floor(index % 5) + Math.floor(index / 5)));
    }
    //第一象限
    static getQuadrant1(board, index) {
        if ((index / 5 | 0) > 0 && (index % 5) + 1 < 5) {
            return [board[index], board[index + 1], board[index - 4], board[index - 5]];
        }
        return undefined;
    }
    //第二象限
    static getQuadrant2(board, index) {
        if ((index / 5 | 0) > 0 && (index % 5) > 0) {
            return [board[index], board[index - 5], board[index - 6], board[index - 1]];
        }
        return undefined;
    }
    //第三象限
    static getQuadrant3(board, index) {
        if ((index / 5 | 0) + 1 < 5 && (index % 5) > 0) {
            return [board[index], board[index - 1], board[index + 4], board[index + 5]];
        }
        return undefined;
    }
    //第四象限
    static getQuadrant4(board, index) {
        if ((index / 5 | 0) + 1 < 5 && (index % 5) + 1 < 5) {
            return [board[index], board[index + 5], board[index + 6], board[index + 1]];
        }
        return undefined;
    }

    //向量点积
    static dotProduct(a, b) {
        if (a.length !== b.length) {
            throw new Error("Length Error!");
        }
        return a.reduce((acc, cur, i) => acc + cur * b[i], 0);
    }

    //两个位置是否相邻
    static isNeighbour(walker, location) {
        if (location === walker - 5 || location === walker + 5) {
            return true;
        } else if ((location / 5 | 0) === (walker / 5 | 0)) {
            if (location === walker - 1 || location === walker + 1) {
                return true;
            }
        }
        return false;
    }

    //location处是否可行
    static isMovable(board, location) {
        let i = location / 5 | 0;
        let j = location % 5;
        let dBoard = board.reshape(5, 5);
        if (dBoard[i][j - 1] === 0 || dBoard[i][j + 1] === 0) {
            return true;
        }
        if (dBoard[i - 1] && dBoard[i - 1][j] === 0 || dBoard[i + 1] && dBoard[i + 1][j] === 0) {
            return true;
        }
        return false;
    }
}

class Player {
    static get BLACK() { return 1 };
    static get EMPTY() { return 0 };
    static get WHITE() { return -1 };
    constructor(type, isHolding) {
        this.type = type;
        this.removes = 0; //剩余摘子次数
        this.isWinner = false; //是否赢得了本场游戏
        this.isHolding = isHolding; //处于执手状态
    }
}

class Action {
    //落子  赢、开启下一阶段
    static get APPEND() { return 0 }
    //提子
    static get REMOVE() { return 1 }
    //选中棋子待行
    static get SELECT() { return 2 }
    //待行子行动到指定位置
    static get MOVING() { return 3 }
    //取消选中
    static get CANCEL() { return 4 }

    constructor(options) {
        this.type = options.type;
        this.target = options.target;
        this.origin = options.origin;
    }

}

class Game {
    static get NOTRUN() { return 0 }
    static get APPEND() { return 1 }
    static get REMOVE() { return 2 }
    static get MOVING() { return 3 }
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
        this.players.forEach(player => player.isHolding = !player.isHolding);
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

    getPlayerByType(type) {
        return this.players.find(player => player.type === type);
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
        if (this.stage != Game.NOTRUN && !this.isItemPoint(location) &&
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
        //取消选中
        if (this.stage === Game.MOVING && this.walker !== -1 && location === this.walker) {
            return new Action({ type: Action.CANCEL });
        }
        throw new Error("不是正确的操作");
    }

    //执行玩家指令
    excute(action) {
        console.log(action);
        let holder = this.getHolder();
        if (action.type === Action.APPEND) { //执行落子
            this.board[action.target] = holder.type;
            //检查是否有赢家、检查是否有成项、是否切换玩家、是否进入摘子（白子先摘）
            this.winner = this.findWinner();
            if (this.winner) {
                this.stage = Game.NOTRUN;
                console.log("winner", this.winner);
            } else {
                if (this.isItemPoint(action.target)) { //落子参与成项，更新执手方removes
                    let removes = Utils.dotProduct(Object.values(this.getItems(action.target)), Object.values(this.rule));
                    this.setPlayerRemoves(holder, removes);
                } else { //落子不参与成项
                    //棋盘满了，进入提子阶段
                    if (Utils.isBoardFull(this.board)) {
                        this.stage = Game.REMOVE;
                        //如果黑子可以被提子，则提一子黑子
                        if (this.isRemovable(Player.BLACK)) {
                            this.setHolder(Player.WHITE);
                            this.setPlayerRemoves(this.players[1], 1);
                        }
                        if (this.isRemovable(Player.WHITE)) {
                            this.setPlayerRemoves(this.players[0], 1);
                        }
                    } else { //棋盘没满，切换玩家
                        this.shiftHolder();
                    }
                }
            }
        }

        if (action.type === Action.MOVING) { //移动一子
            this.board[action.target] = this.board[action.origin];
            this.board[action.origin] = 0;
            this.walker = -1;
            //检查是否有赢家、检查是否有成项、是否切换玩家
            this.winner = this.findWinner();
            if (this.winner) { //存在赢家，游戏结束
                this.stage = Game.NOTRUN;
                console.log("winner", this.winner);
            } else {
                if (this.isItemPoint(action.target)) { //走子参与成项，更新执手方removes
                    let removes = Utils.dotProduct(Object.values(this.getItems(action.target)), Object.values(this.rule));
                    this.setPlayerRemoves(holder, removes);
                } else { //走子不参与成项，切换玩家
                    this.shiftHolder();
                }
            }
        }

        if (action.type === Action.REMOVE) { //执行摘子
            this.board[action.target] = 0;
            holder.removes--;
            //检查是否有赢家、摘子是否结束（无法继续摘子或结束归零）、是否切换玩家、是否开启下一阶段
            this.winner = this.findWinner();
            if (this.winner) { //存在赢家，游戏结束
                this.stage = Game.NOTRUN;
                console.log("winner", this.winner);
            } else {
                if (this.stage === Game.REMOVE) { //游戏处于下满提子阶段
                    if (this.players.every(player => player.removes === 0)) {//提子结束，进入走子阶段
                        this.stage = Game.MOVING;
                        this.players[0].isHolding = false;
                        this.players[1].isHolding = true;
                    } else if (holder.removes === 0 || !this.isRemovable(-holder.type)) { //执手方完成摘子或对手方已无子可摘
                        //切换玩家
                        this.shiftHolder();
                    }
                } else if (holder.removes === 0 || !this.isRemovable(-holder.type)) {
                    //游戏处于非下满提子阶段，且执手方完成摘子或对手无法被摘子了,切换对手
                    this.setPlayerRemoves(holder, 0);
                    this.shiftHolder();
                }
            }
        }

        if (action.type === Action.SELECT) { //选中一子
            this.walker = action.target;
        }

        if (action.type === Action.CANCEL) { //取消选中
            this.walker = -1;
        }

    }

    //判断输赢
    findWinner() {
        let blacks = this.findAllLocation(Player.BLACK);
        let whites = this.findAllLocation(Player.WHITE);
        //落子阶段确认赢家，一方的棋子个数大于13个
        if (this.stage === Game.APPEND) {
            if (blacks.length > 13) {
                return this.getPlayerByType(Player.BLACK);
            }
            if (whites.length > 13) {
                return this.getPlayerByType(Player.WHITE);
            }
            return null;
        }
        //行子阶段，闷杀
        if (this.stage === Game.MOVING || this.stage === Game.REMOVE) {
            if (blacks.every(value => !Utils.isMovable(this.board, value))) {
                return this.getPlayerByType(Player.WHITE);
            }
            if (whites.every(value => !Utils.isMovable(this.board, value))) {
                return this.getPlayerByType(Player.BLACK);
            }
            //摘子阶段都是成项，棋子少的一方判负，相等判平
            //少于2子，直接判负
            if (blacks.length < 3) {
                return this.getPlayerByType(Player.WHITE);
            }
            if (whites.length < 3) {
                return this.getPlayerByType(Player.BLACK);
            }
        }
        return null;
    }
    //获取某一方的所有格点位置
    findAllLocation(type) {
        let locations = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === type) {
                locations.push(i);
            }
        }
        return locations;
    }

    //格点是否成项点
    isItemPoint(location) {
        let items = this.getItems(location);
        return Object.values(items).some(item => item > 0);
    }

    //确认落子参与哪些成项
    getItems(location) {
        let items = { 'sanxie': 0, 'sixie': 0, 'dagun': 0, 'fang': 0, 'tong': 0 };
        let relatedVectors = this.getRelatedVectors(location);
        relatedVectors.forEach((vector, index) => {
            if (vector && vector.every(piece => piece === vector[0])) {
                switch (index) {
                    case 0:
                    case 1:
                        items.dagun++;
                        break; // 行列

                    case 2:
                    case 3:
                        switch (vector.length) {  // 正斜、反斜
                            case 3:
                                items.sanxie++;
                                break;
                            case 4:
                                items.sixie++;
                                break;
                            case 5:
                                items.tong++;
                                break;
                        }
                        break;

                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        items.fang++;
                        break; // 小方
                }
            }
        });
        return items;
    }

    //设置玩家剩余摘子数
    setPlayerRemoves(player, removes) {
        player.removes = removes;
    }

    //还有能被提子的子
    isRemovable(type) {
        return this.board.some((piece, index) => {
            return piece === type && !this.isItemPoint(index);
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
