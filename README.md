# dagun
五棍棋/大棍/五大棍/五虎棋/三斜
```
Game {
    
    变量

    actionType: 落子1、提子-1
    holder: 当前执手方 1黑-1白
    board: 当前棋盘 一维数组
    stage: 1布子，2摘子，3行子
    staus: true 游戏进行中 false 游戏结束
    walker: int选中待行之子
    rule: 提子规则

    函数

    action(location) //针对location执行动作 
    //动作举例：黑方提子位置8、白方落子位置6、黑方选中位置3、黑方行子位置2

    doLuozi(location) //在location处落子
    doQuzi(location) //在location除提子

    getAllActions() //所有可以执行的策略

    isDropable(location) //location坐标能否落子
    isRemovable(location) //location坐标能否提子

    isItemPoint(location) //location坐标是否参与成项

    hasWinner() //结合当前棋盘状态判断是否有赢家
    isBoardFull()   //棋盘是否已满

}

class Board extends Array {
    constructor(...args){
        super(args);
        this.reshape = (rows,cols) => {
            if(rows * cols === this.length){
                let result = [];
                for(let i = 0;i<rows;i++){
                    result[i]=this.slice(i*cols,i*cols+cols)
                }
                return result;
            }
        }
        this.isFull = ()=>{
            return !this.some(value => value === 0);
        }
    }
}

```