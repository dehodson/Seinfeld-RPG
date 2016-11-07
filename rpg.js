var gameMode = 1;

var characters = [["George", 30, 30, 5, 0, 1, 1, ["Back"]], ["Jerry", 25, 35, 4, 0, 2, 1, ["Back"]], ["Elaine", 23, 23, 3, 0, 5, 1, ["Back", "Nip Slip"]], ["Kramer", 20, 20, 6, 0, 3, 1, ["Back", "Hot Tub Soak"]]];
var enemy      = ["Enraged Newman", 40, 40, 10, 1, "images/newman.jpg"];
var selectedCharacter = 0;
var battleState = 0;
var animations = [];
var animationTick = false;
var canPress = true;

var selectedMenu  = 0;
var isMenu 		  = false;
var battleOptions = ["Attack", "Defend", "Tactics"];
var menuOptions   = battleOptions;
var victoryQuotes = ["Yeah baby!", "All right!", "Get out!", "Giddy up!"]
var isNipSlip     = false;

var cutscene = [["images/prison.jpg"], ["images/jerry.jpg", "Well, we're finally out of prison. What's the first thing we do?"], ["images/kramer.jpg", "We celebrate, of course! Let's go get a box of cuban cigars."], ["images/cigarstore.jpg"], ["images/george.jpg", "Wait a minute... They're out of cubans!"], ["images/jerry.jpg", "Out of cubans?"], ["images/george.jpg", "Completely out!"], ["images/elaine.jpg", "Hold on, look who got the last box!"], ["images/jerry.jpg", "...Newman!"]];
var cutscenePosition = 1;

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function setBattleText(text){
	var battleText = document.getElementById("battle-text");
	battleText.innerHTML = text;
	battleText.style.visibility = "visible";
}

function hideBattleText(){
	var battleText = document.getElementById("battle-text");
	battleText.style.visibility = "hidden";
}

function estimateCharacterDamage(character, damage){
	var estimate = damage;

	if(characters[character][1] - damage <= 0){
		return -1;
	}
	
	return estimate;
}

function healCharacter(character, health){
	if(characters[character][1] > 0){
		characters[character][1] += health;

		if(characters[character][1] > characters[character][2]){
			characters[character][1] = characters[character][2];
		}
	}
}

function killCharacter(character){
	characters[character][6] = 0;

	document.getElementById("char"+character).className += " dead"
}

function damageCharacter(character, damage){
	characters[character][1] -= damage;

	if(characters[character][1] <= 0){
		characters[character][1] = 0;
		killCharacter(character);
		return -1;
	}
	
	return damage;
}

function damageEnemy(damage){
	var realDamage = damage - enemy[4];

	if(realDamage < 0){
		realDamage = 0;
	}

	enemy[1] = enemy[1] - realDamage;

	if(enemy[1] <= 0){
		enemy[1] = 0;
		return -1;
	}

	return realDamage;
}

function updateHealth(){
	for(var i = 0; i < 4; i++){
		document.getElementById("char"+i+"-hp").innerText = "HP: "+characters[i][1]+"/"+characters[i][2];
	}
}

function setStatus(character, text){
	document.getElementById("char"+character+"-status").innerText = text;
}

function clearStatus(character){
	document.getElementById("char"+character+"-status").innerText = "";
}

function showMenu(character){
	var menu  = "<span id=\"menu0\" class=\"highlight\">"+menuOptions[0]+"</span>";

	for(var i = 1; i < menuOptions.length; i++){
		menu += "<br /><span id=\"menu"+i+"\">"+menuOptions[i]+"</span>";
	}

	selectedMenu = 0;
	isMenu = true;

	for(var i = 0; i < 4; i++){
		document.getElementById("char"+i+"-menu").innerHTML = character == i ? menu : "";
	}
}

function hideMenu(){
	isMenu = false;

	for(var i = 0; i < 4; i++){
		document.getElementById("char"+i+"-menu").innerHTML = "";
	}
}

function selectMenu(item){
	for(var i = 0; i < menuOptions.length; i++){
		document.getElementById("menu"+i).className = item == i ? "highlight" : "";
	}
}

function changeMenu(offset){
	selectedMenu += offset;

	if(selectedMenu >= menuOptions.length){
		selectedMenu = 0;
	}
	if(selectedMenu < 0){
		selectedMenu = menuOptions.length - 1;
	}

	selectMenu(selectedMenu);
}

function selectNoCharacter(){
	hideMenu();

	for(var i = 0; i < 4; i++){
		if(characters[i][1] > 0){
			document.getElementById("char"+i).className = "card";
		}else{
			document.getElementById("char"+i).className = "card dead";
		}
	}
}

function selectNextCharacter(){
	var next = -1;

	for(var i = selectedCharacter + 1; i < 4; i++){
		if(characters[i][1] > 0){
			next = i;
			break;
		}
	}
	if(next != -1){
		selectedCharacter = next;
		return 0;
	}else{
		for(var i = 0; i <= selectedCharacter; i++){
			if(characters[i][1] > 0){
				next = i;
				break;
			}
		}
		if(next != -1){
			selectedCharacter = next;
			return 1;
		} else{
			return -1;
		}
	}
}

function selectCharacter(character){
	document.getElementById("char"+character).className += " selected";

	showMenu(character);
}

function randomLivingCharacter(){
	var number = 0;

	for(var i = 0; i < 4; i++){
		if(characters[i][1] > 0){
			number += 1;
		}
	}

	var random = getRandomInt(0, number);

	for(var i = 0; i < 4; i++){
		if(i == random){
			if(characters[i][1] == 0){
				random += 1;
			}else{
				return random;
			}
		}
	}
}

function attackEnemy(character){
	var damageTaken = damageEnemy(characters[character][3]);
	if(damageTaken == -1){
		var statusUpdate = characters[character][0] + " strikes " + enemy[0] + " down!<br />";
		statusUpdate += characters[character][0] + ": \"" + victoryQuotes[character] + "\"";
		setBattleText(statusUpdate);
		selectNoCharacter();
		animations = [];
		canPress = true;
		document.getElementById("enemy").className = "defeated";
		addAnimation(["noPress", 5]);
		return -1;
	}else{
		var statusUpdate = characters[character][0] + " attacks " + enemy[0] + ", doing " + damageTaken + " damage!";
		setBattleText(statusUpdate);
		return damageTaken;
	}
}

function startBattle(arr){
	enemy = arr;
	updateHealth();
	var enemyElement = document.getElementById("enemy");
	enemyElement.src = enemy[5];
	enemyElement.className = "";
	setBattleText("The gang confronts "+enemy[0]+".");
	menuOptions = battleOptions;
	battleState = 0;
	gameMode    = 0;
	isNipSlip   = false;
	document.getElementById("main").style.visibility = "visible";
	document.getElementById("main2").style.visibility = "hidden";
	selectedCharacter = 0;
}

function endAttackStep(){
	var result = selectNextCharacter();

	if(result == 1){
		battleState = 3;
	}else if(result == 0){
		battleState = 0;
	}else{
		battleState = 4;
	}
}

function battleStep(){
	if(battleState == 0){         // Display Text
		battleState = 1;

		if(characters[selectedCharacter][1] == 0){
			endAttackStep();

			battleStep();
		}else{
			setBattleText(characters[selectedCharacter][0] + "'s turn.");
			selectNoCharacter();
			selectCharacter(selectedCharacter);
		}
	}else if(battleState == 1){   // Attack
		hideMenu();

		if(characters[selectedCharacter][1] > 0){
			if(menuOptions[selectedMenu] == "Attack"){
				var outcome = attackEnemy(selectedCharacter);

				if(outcome == -1){
					battleState = 2;
				}else{
					document.getElementById("enemy").className = "hurt";
					addAnimation(["hurt", 2]);
					endAttackStep();
				}
			}else if(menuOptions[selectedMenu] == "Defend"){
				setBattleText(characters[selectedCharacter][0] + " is defending.");
				characters[selectedCharacter][4] = 1;

				endAttackStep();
			}else if(menuOptions[selectedMenu] == "Tactics"){
				menuOptions = characters[selectedCharacter][7];
				showMenu(selectedCharacter);

			}else if(menuOptions[selectedMenu] == "Back"){
				menuOptions = battleOptions;
				showMenu(selectedCharacter);

			}else if(menuOptions[selectedMenu] == "Nip Slip"){
				isNipSlip = true;
				setBattleText("Elaine lets a nip slip!<br />The enemy might be distracted.");

				menuOptions = battleOptions;
				endAttackStep();
			}else if(menuOptions[selectedMenu] == "Hot Tub Soak"){
				setBattleText("Kramer: \"This'll fix you right up.\"<br />The gang was healed for 3!")

				for(var i = 0; i < 4; i++){
					healCharacter(i, 3);
				}

				updateHealth();
				menuOptions = battleOptions;
				endAttackStep();
			}
		}else{
			setBattleText(characters[selectedCharacter][0] + " is dead!");

			endAttackStep();
		}
	}else if(battleState == 2){   // Battle Over
		startBattle(["Jane", 30, 30, 7, 2, "images/jane.jpg"]);
	}else if(battleState == 3){   // Enemy Attacking
		selectNoCharacter();

		var target = randomLivingCharacter();
		var defend = 0;
		var distracted = false;

		if(isNipSlip){
			if(getRandomInt(0, 3) == 0){
				distracted = true;
			}
		}

		if(target < 4){
			if(distracted){
				setBattleText(enemy[0]+" is too distracted by Elaine's nip slip to attack!");
			}else{
				if(characters[target][4] == 1){
					var chance = getRandomInt(0, 10);

					if(chance < characters[target][5]){
						defend = 1;
					}
				}
				if(defend == 1){
					setBattleText(characters[target][0] + " successfully defends against "+enemy[0]+"'s attack!");
				}else{
					var estimate = estimateCharacterDamage(target, enemy[3]);
					if(estimate == -1){
						estimate = "mortal";
					}
					setBattleText(enemy[0] + " attacks "+characters[target][0]+", doing "+estimate+" damage!");
					addAnimation(["damage", target, enemy[3]]);
				}
			}

			battleState = 0;
		}else{
			setBattleText("The Gang is dead!");
			battleState = 4;
		}

		//Stop Defending
		for(var i = 0; i < 4; i++){
			characters[i][4] = 0;
		}
		isNipSlip = false;
	}else if(battleState == 4){    //Party Dead
		selectNoCharacter();
		setBattleText("The Gang is dead!");
		console.log("no baby");
	}
}

function doAnimation(){
	for(var i = animations.length - 1; i >= 0; i--){
		if(animations[i][0] == "damage"){
			animations[i][2] -= 1;

			damageCharacter(animations[i][1], 1);
			updateHealth();

			if(animations[i][2] == 0){ 
				animations.splice(i, 1);
			}
		}else if(animations[i][0] == "noPress"){
			animations[i][1] -= 1;

			if(animations[i][1] == 0){
				animations.splice(i, 1);
				canPress = true;
			}
		}else if(animations[i][0] == "hurt"){
			animations[i][1] -= 1;

			if(animations[i][1] == 0){
				animations.splice(i, 1);
				document.getElementById("enemy").className = "";
			}
		}
	}

	if(animations.length == 0){
		clearInterval(animationTick);
		animationTick = false;
	}
}

function addAnimation(animation){
	if(animation[0] == "damage"){
		var found = false;

		for(var i = 0; i < animations.length; i++){
			if(animations[i][0] == "damage" && animation[1] == animations[i][1]){
				animations[i][2] += animation[2];
				found = true;
				break;
			}
		}

		if(found == false){
			animations.push(animation);
		}
	}else if(animation[0] == "noPress"){
		canPress = false;
		animations.push(animation);
	}else{
		animations.push(animation);
	}

	if(animationTick == false){
		animationTick = setInterval(doAnimation, 200);
	}
}

function startCutscene(arr){
	cutscene = arr;
	cutscenePosition = -1;
	gameMode = 1;

	cutsceneStep();
}

function cutsceneStep(){
	if(cutscenePosition < cutscene.length - 1){
		cutscenePosition += 1;
		if(cutscene[cutscenePosition].length == 1){
			document.getElementById("main2").style.backgroundImage = "url('"+cutscene[cutscenePosition][0]+"')";
			cutsceneStep();
		}else{
			document.getElementById("character-speech-text").innerHTML = cutscene[cutscenePosition][1];
			document.getElementById("character-speech-portrait").src   = cutscene[cutscenePosition][0];
		}
	}else{
		startBattle(["Enraged Newman", 40, 40, 10, 1, "images/newman.jpg"]);
	}
}

function keyPressed(event){
	if(event.which == 13 && canPress){  //enter
		if(gameMode == 0){
			battleStep();
			addAnimation(["noPress", 1]);
		}else if(gameMode == 1){
			cutsceneStep();
			addAnimation(["noPress", 1]);
		}
	};
	if(isMenu){
		if(event.which == 38){
			changeMenu(-1);
		}else if(event.which == 40){
			changeMenu(1);
		}
	}
}

startCutscene(cutscene);