window.onload = function () {
	init();
	let invincibleInfo = "您的对手处于无敌状态，切换为";
	let panel = document.querySelector("#panel");
	let advs = document.querySelector("#advs");
	let result = {};
	let holderModes = {
		drop: true, //落子模式
		remove: false //提子模式
	}
	panel.addEventListener('click', doLuozi);

	advs.innerHTML = getHolderInfo(currentHolder, holderModes.drop);

	//落子点击事件
	function doLuozi(e) {
		let target = e.target;
		let index = parseInt(target.id);
		let isEnemyInvincible = checkInvincible(-currentHolder);
		if (checkDropable(index)) {
			let isDropSuccessful = dropChess(index);
			target.className = currentHolder == 1 ? "black" : "white";
			result = checkItem(index);
			let isDropStageEnd = isBoardFull() &&
				(isEnemyInvincible || result.removeChance === 0);
			//落子阶段结束，进入去子
			if (isDropStageEnd) {
				advs.innerHTML = "棋盘已满，请白方提子";
			} else { //
				//获取落子后的结果：消子机会、成项名称
				advs.innerHTML = '';
				let removeChance = result.removeChance;
				//没成项或成项但无子可消，切换执手方
				if (removeChance === 0 || isEnemyInvincible) {
					currentHolder *= -1;
					info = getHolderInfo(currentHolder, holderModes.drop);
					removeChance != 0 && isEnemyInvincible
						&& (advs.innerHTML += invincibleInfo);
					advs.innerHTML += info;
				} else {
					//成项，转到消子
					panel.removeEventListener('click', doLuozi);
					panel.addEventListener('click', doQuzi);

					let info = currentHolder === 1 ? "黑方消子" : "白方提子";
					info += `剩余${removeChance}次`;
					advs.innerHTML = info;
				}
			}
		} else {
			alert("无法完成落子");
		}
	}

	//提子事件
	function doQuzi(e) {
		let target = e.target;
		let index = parseInt(target.id);
		if (board[index] != currentHolder && checkRemovable(index)) {
			removeChess(index);
			result.removeChance --;
			target.className = '';
			//正常消子
			if (result.removeChance > 0 && hasEnemey(currentHolder) && !checkInvincible(-currentHolder)) {
				let info = getHolderInfo(currentHolder, holderModes.remove);
				info += `剩余${result.removeChance}次`;
				advs.innerHTML = info;
			} else {
				let tag = "";
				//还有消字机会，但敌方都为成项子
				if (result.removeChance > 0 && checkInvincible(-currentHolder)) { //消字机会未用完，但无子可消
					tag = "您的对手处于无敌状态，切换为";
				} else if (result.removeChance > 0 && !hasEnemey(currentHolder)) {
					tag = "已无子可消，切换为";
				}
				currentHolder *= -1;
				info = getHolderInfo(currentHolder, holderModes.drop);
				advs.innerHTML = tag + info;
				result = {};
				panel.removeEventListener('click', doQuzi);
				panel.addEventListener('click', doLuozi);
			}
		} else {
			alert("该子无法被消除！");
		}
	}

	//获取执手方提示信息
	function getHolderInfo(holder, holderMode) {
		let holderName = holder === 1 ? "黑方" : "白方";
		let holderModeName = holderMode === holderModes.drop ? "落子" : "提子";
		return `${holderName}${holderModeName}`;
	}
}
