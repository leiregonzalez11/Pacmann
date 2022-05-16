// >=test1
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;


Math.trunc = Math.trunc || function(x) {
	return x - x % 1;
}

/**************************************************/
/*                GAME FRAMEWORK				  */
/**************************************************/
// >=test1
// GAME FRAMEWORK 
var GF = function(){

	// >=test2
 	// variables para contar frames/s, usadas por measureFPS
	var frameCount = 0;
	var lastTime;
	var fpsContainer;
	var fps;
    //var dirDerecha = true; //test3
 	
 	// >=test4
	//  variable global temporalmente para poder testear el ejercicio
	inputStates = {left: false, right: false, space: false, up: false, down: false};


	// >=test10
	const TILE_WIDTH=24, TILE_HEIGHT=24;
	var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost
	
	// >=test10
	// hold ghost objects
	var ghosts = {};

	/**************************************************/
	/*                     GHOSTS                     */
	/**************************************************/

	// >=test10
	var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;
		
		this.nearestRow = 0;
		this.nearestCol = 0;
	
		this.ctx = ctx;
	
		this.id = id;
		this.homeX = 0;
		this.homeY = 0;
		this.state = Ghost.NORMAL;

		this.draw = function(){

			// test13
			// Tu código aquí
			// El cuerpo del fantasma sólo debe dibujarse cuando el estado del mismo es distinto a Ghost.SPECTACLES

			if (this.state != Ghost.SPECTACLES){

				// test10
				// Pintar cuerpo de fantasma
				// Tu código aquí

				this.ctx.beginPath();
				this.ctx.moveTo(this.x,this.y+TILE_HEIGHT);
				this.ctx.quadraticCurveTo(this.x+(TILE_WIDTH/2),this.y/1.05,this.x+TILE_WIDTH,this.y+TILE_HEIGHT);

				// test12
				// Tu código aquí
				// Asegúrate de pintar el fantasma de un color u otro dependiendo del estado del fantasma y de thisGame.ghostTimer
				// siguiendo el enunciado

				if (this.state == Ghost.NORMAL){
					this.ctx.fillStyle = ghostcolor[this.id];
					this.ctx.fill();
				}

				else if(this.state == Ghost.VULNERABLE) {
					if(thisGame.ghostTimer > 100){
						this.ctx.fillStyle = ghostcolor[4];
					}
					else {
						if(thisGame.ghostTimer % 2 == 0){
							this.ctx.fillStyle = ghostcolor[5];
							this.ctx.fill();
						}
						else{
							this.ctx.fillStyle = ghostcolor[4];
							this.ctx.fill();
						}
					}
				}

				this.ctx.closePath();
			}

			// test10
			// Tu código aquí
			// Pintar ojos

			this.ctx.beginPath();
			this.ctx.fillStyle = '#fff';
			this.ctx.arc(this.x+(TILE_WIDTH/4),this.y+(TILE_WIDTH/2),3,0,2*Math.PI,true);
			this.ctx.fill();

			this.ctx.beginPath();
			this.ctx.arc(this.x+(3*TILE_WIDTH/4),this.y+(TILE_WIDTH/2),3,0,2*Math.PI,true);
			this.ctx.fill();


		}; // draw
		
		this.move = function() {

			// test13
			// Tu código aquí
			// Si el estado del fantasma es Ghost.SPECTACLES
			// Mover el fantasma lo más recto posible hacia la casilla de salida

			if (this.state === Ghost.SPECTACLES){

				this.x = this.x < w / 2 ? this.x + this.velX : this.x - this.velX;
				this.y = this.y > h / 2 ? this.y - this.velY : this.y + this.velY;

				if(this.x === this.homeX && this.y === this.homeY) {
					this.state = Ghost.NORMAL;
				}
			}
			else {
				// test10
				// Tu código aquí

				if (this.x % thisGame.TILE_WIDTH != 0 && this.x % (thisGame.TILE_WIDTH / 2) == 0 && this.y % thisGame.TILE_HEIGHT != 0 && this.y % (thisGame.TILE_HEIGHT / 2) == 0) {
					const filaGhost = Math.trunc(((this.y) / thisGame.TILE_WIDTH));
					const colGhost = Math.trunc(((this.x) / TILE_HEIGHT));

					let posiblesMovimientos = [];

					if (!thisLevel.isWall(filaGhost, colGhost - 1)) { //Si no hay pared a la izquierda
						posiblesMovimientos.push("izquierda");
					} else if (!thisLevel.isWall(filaGhost, colGhost + 1)) {//Si no hay pared a la derecha
						posiblesMovimientos.push("derecha");
					} else if (!thisLevel.isWall(filaGhost - 1, colGhost)) { //Si no hay pared arriba
						posiblesMovimientos.push("arriba");
					} else if (!thisLevel.isWall(filaGhost + 1, colGhost)) { //Si no hay pared arriba
						posiblesMovimientos.push("abajo");
					}

					//Si hay cruce o va a chocar
					if (posiblesMovimientos.length >= 3 || this.velX < 0 && thisLevel.isWall(filaGhost, colGhost - 1) ||
						this.velX > 0 && thisLevel.isWall(filaGhost, colGhost + 1) ||
						this.velY < 0 && thisLevel.isWall(filaGhost - 1, colGhost) ||
						this.velY > 0 && thisLevel.isWall(filaGhost + 1, colGhost) ||
						(this.velX == 0 && this.velY == 0)) {

						//Elegimos una dirección al azar y actualizamos velX y velY según la dirección
						let dir = posiblesMovimientos[Math.round(Math.random() * (posiblesMovimientos.length - 1))];

						if (dir === "izquierda") {
							this.velX = -this.speed;
							this.velY = 0;
						} else if (dir === "derecha") {
							this.velX = this.speed;
							this.velY = 0;
						} else if (dir === "arriba") {
							this.velX = 0;
							this.velY = -this.speed;
						} else {
							this.velX = 0;
							this.velY = this.speed;
						}
					}
				}

				this.x = this.x + this.velX;
				this.y = this.y + this.velY;
			}
		};

	}; //FIN CLASE GHOST
	
	// >=test12
	// static variables
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;


	/**************************************************/
	/*                      LEVEL                     */
	/**************************************************/

	// >=test5
	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

		this.setMapTile = function(row, col, newValue){
			// test5
			// Tu código aquí
            if(newValue == 2 || newValue == 3){ //Pildora normal o de poder (blanca o roja)
                this.pellets++;
            }
            this.map[(row * this.lvlWidth) + col] = newValue;
		};

		this.getMapTile = function(row, col){
			// test5
			// Tu código aquí
            return this.map[(row * this.lvlWidth) + col];
		};

		this.printMap = function(){
			// test5
			// Tu código aquí
            console.log(this.map);
		};

		this.loadLevel = function(){
			// test5
			// Tu código aquí
			// leer res/levels/1.txt y guardarlo en el atributo map	
			// haciendo uso de setMapTile

            $.ajaxSetup({async:false});

            $.get("../res/levels/1.txt", (data) => {
                let partes = data.split("#");

				//Ancho
                let valores = partes[1].split(" ");
                this.lvlWidth = valores[2];

				//Altura
                valores = partes[2].split(" ");
                this.lvlHeight = valores[2];

				//Valores
                valores = partes[3].split("\n");
                let filas = valores.slice(1, valores.length - 1);

                $.each(filas, (n, elem1) => {
                    let nums = elem1.split(" ");
                    $.each(nums, (m, elem2) => {
                        this.setMapTile(n,m,elem2);
                    });
                });
            });
            this.printMap();

			// test10
			// Tu código aquí
		};

		// >=test6
		this.drawMap = function(){

			let TILE_WIDTH = thisGame.TILE_WIDTH;
			let TILE_HEIGHT = thisGame.TILE_HEIGHT;

			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3
			};

			thisLevel.powerPelletBlinkTimer++;
			if (thisLevel.powerPelletBlinkTimer === 60)	thisLevel.powerPelletBlinkTimer = 0;


			// test6
			// Tu código aquí
			for (let fila=0; fila <= thisGame.screenTileSize[0]; fila++){
				for (let col=0; col <= thisGame.screenTileSize[1]-1; col++){

					let b = this.getMapTile(fila, col);
					let baldosa = parseInt(b);

					if( baldosa === 2){ //Pildora -> circulo blanco
						ctx.beginPath();
						ctx.fillStyle = "white";
						ctx.arc(col * TILE_WIDTH + (TILE_WIDTH/2), fila * TILE_HEIGHT + (TILE_HEIGHT/2), 5, 0, 2 * Math.PI, true);
						ctx.fill();
						ctx.stroke();
						ctx.closePath();
					}
					else if(baldosa === 3){ //Pildora de poder -> circulo rojo
						if(this.powerPelletBlinkTimer < 30) {
							ctx.beginPath();
							ctx.fillStyle = "red";
							ctx.arc(col * TILE_WIDTH + (TILE_WIDTH / 2), fila * TILE_HEIGHT + (TILE_HEIGHT / 2), 5, 0, 2 * Math.PI, true);
							ctx.fill();
							ctx.stroke();
							ctx.closePath();
						}
					}
					/*else if(baldosa == 4 || baldosa == 0){ //Pacman o baldosa vacía}*/
					else if(baldosa >= 10 && baldosa <= 13){ //Fantasmas
						ctx.fillStyle = "black";
						ctx.fillRect(col * TILE_WIDTH, fila * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
						ctx.stroke();
					}
					else if(baldosa >= 100 && baldosa <= 199){ //Pared
						ctx.fillStyle = "blue";
						ctx.fillRect(col * TILE_WIDTH, fila * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
						ctx.stroke();
					}
				}
			}
		};

		// >=test7
		this.isWall = function(row, col) {
			// test7
			// Tu código aquí
			let b = this.getMapTile(row, col);
			let baldosa = parseInt(b);
			return (100 <= baldosa && baldosa <= 199);
		};

		// >=test7
		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			// test7
			// Tu código aquí
			// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
			// Hacer uso de isWall

			if ((possiblePlayerX % (thisGame.TILE_WIDTH/2) ==0) || (possiblePlayerY % (thisGame.TILE_HEIGHT/2) == 0)){
				let row = Math.trunc(((possiblePlayerY)/thisGame.TILE_HEIGHT));
				let col = Math.trunc(((possiblePlayerX)/thisGame.TILE_WIDTH));
				return this.isWall(row,col);
			}
			else{ return true;}

		};
		
		// >=test11
		this.checkIfHit = function(playerX, playerY, x, y, holgura){
			// Test11
			// Tu código aquí
			if ((Math.abs(playerX - x) > holgura) || (Math.abs(playerY - y) > holgura) ){
				return false;
			}
			return true;

		};

		// >=test8
		this.checkIfHitSomething = function(playerX, playerY, row, col){

			var tileID = {
				'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};
			
			// test8
			// Tu código aquí
			// Gestiona la recogida de píldoras

			let fila = Math.trunc(((playerY)/thisGame.TILE_HEIGHT));
			let columna = Math.trunc(((playerX)/thisGame.TILE_WIDTH));
			let baldosa = this.getMapTile(fila, columna);

			if (baldosa == tileID.pellet){
				this.setMapTile(fila, columna, 0); //Cambiamos el tipo de baldosa
				this.pellets--; //Restamos 1 al nº de pildoras que quedan por recoger
				thisGame.addToScore(10); //Añadimos 10 puntos al score
			}

			// test9
			// Tu código aquí
			// Gestiona las puertas teletransportadoras

			if(baldosa == tileID['door-h']){ // Puerta horizontal
				for(let j=0; j < thisLevel.lvlWidth; j++){
					if(j != columna && this.getMapTile(fila, j) == tileID['door-h']){
						player.x = j*thisGame.TILE_WIDTH;
						if(player.velX > 0){
							player.x = player.x + thisGame.TILE_WIDTH;
						}else{
							player.x = player.x - thisGame.TILE_WIDTH;
						}
					}
				}
			}

			if(baldosa == tileID['door-v']){ // Puerta vertical
				for(let i = 0; i < thisLevel.lvlHeight;i++){
					if(i != fila && this.getMapTile(i, columna) == tileID['door-v']){
						player.y = i * thisGame.TILE_WIDTH;
						if(player.velY > 0){
							player.y = player.y + thisGame.TILE_WIDTH;
						}else{
							player.y = player.y - thisGame.TILE_WIDTH;
						}
					}
				}
			}
			
			// test12
			// Tu código aquí
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)

			if(baldosa == tileID['pellet-power']){ // Pildora de poder
				this.setMapTile(fila, columna, 0); //Cambiamos el tipo de baldosa
				this.pellets--; //Restamos 1 al nº de pildoras que quedan por recoger
				thisGame.ghostTimer = 360;  // Inicializamos el valor de ghostTimer a 360 (6 seg. aprox.)
				thisGame.addToScore(20); //Añadimos 20 puntos al score
				for (let i = 0; i<numGhosts; i++){ //Cambiamos el estado de los fantasmas
					ghosts[i].state = Ghost.VULNERABLE;
				}

			}

		};

		this.displayScore = function() {
			ctx.beginPath();
			ctx.font = "18px Arial";
			ctx.fillStyle = "red";
			ctx.fillText("1UP ",TILE_WIDTH,TILE_HEIGHT-5);
			ctx.closePath();
			ctx.beginPath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillText(thisGame.points,TILE_WIDTH*4,TILE_HEIGHT-5);
			ctx.closePath();
			ctx.fillStyle = "red";
			ctx.fillText("HIGH SCORE",TILE_WIDTH*12,TILE_HEIGHT-5);
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillText("0",TILE_WIDTH*19,TILE_HEIGHT-5);
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillText("Lifes: " + thisGame.lifes,TILE_WIDTH,TILE_HEIGHT*25-5);
			ctx.closePath();
		};

		this.displayGameOver = function() {
			ctx.beginPath();
			ctx.font = "60px Arial";
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.fillText("GAME OVER",w/2,h/2);
			ctx.closePath();
		};

	}; //FIN CLASE LEVEL


	/**************************************************/
	/*                     PACMAN                     */
	/**************************************************/

	// >=test2
	var Pacman = function() {
		this.radius = 15;
		this.x = 0;
		this.y = 0;
		this.speed = 5;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.velY = 0;
		this.velX = this.speed;
	};
	
	// >=test3
	Pacman.prototype.move = function() {
	
		// test3 / test4 / test7
		// Tu código aquí

		//test3
		/*let pacman = new Pacman();
        pacman.draw(this.posX, this.posY);
        if(dirDerecha){
            if(this.posX < w - this.radius){
                this.posX=this.posX+this.speed;
            }
            else{
                dirDerecha = false;
            }
        }
        else{
            if(this.posX > this.radius){
                this.posX = this.posX - this.speed;
            }
            else{
                dirDerecha = true;
            }
        }*/

		//test4

        /*player.draw(this.x,this.y);

        //Movimiento en el eje X
        if (player.x + player.velX > w - 2 * player.radius){//Choca en el borde derecho
            inputStates.right = false;
        }
        else if (player.x + player.velX == 0){//Choca en el borde izquierdo
            inputStates.left = false;
        }
        else {
            player.x = player.x + player.velX;
        }

        //Movimiento en el eje Y
        if (player.y + player.velY > h - 2*player.radius){ //Choca en el borde inferior
            inputStates.down = false;
        }
        else if (player.y + player.velY == 0){ //Choca en el borde superior
            inputStates.up = false;
        }
        else {
            player.y = player.y + player.velY;
        }*/

		//test 7

		if(player.x + player.velX > w - player.radius){ //Choca en el borde derecho
			inputStates.right=false;
		}
		else if(player.x == 0){ //Choca en el borde izquierdo
			inputStates.left=false;
		}
		else if(player.y + player.velY > h - player.radius){ //Choca en el borde inferior
			inputStates.down = false;
		}
		else if(player.y == 0){ //Choca en el borde superior
			inputStates.up = false;
		}
		else{
			player.y = player.y + player.velY;
			player.x = player.x + player.velX;
		}

		// >=test8:
		// introduce esta instrucción
		// dentro del código implementado en el test7:
		// tras actualizar this.x  y  this.y... 
		// check for collisions with other tiles (pellets, etc)

		thisLevel.checkIfHitSomething(this.x, this.y, this.nearestRow, this.nearestCol);

		// test11
		// Tu código aquí
		// check for collisions with the ghosts

		for (let i = 0; i <numGhosts; i++){
			if (thisLevel.checkIfHit(player.x, player.y, ghosts[i].x, ghosts[i].y, thisGame.TILE_WIDTH/2)){
				console.log("Choque entre fantasma y pacman");

				// test13
				// Tu código aquí
				// Si chocamos contra un fantasma y su estado es Ghost.VULNERABLE
				// cambiar velocidad del fantasma y pasarlo a modo Ghost.SPECTACLES

				if (ghosts[i].state == Ghost.VULNERABLE){
					ghosts[i].velX = -ghosts[i].speed;
					ghosts[i].velY = -ghosts[i].speed;
					ghosts[i].state = Ghost.SPECTACLES;
				}

				// test14
				// Tu código aquí.
				// Si chocamos contra un fantasma cuando éste esta en estado Ghost.NORMAL --> cambiar el modo de juego a HIT_GHOST

				else if (ghosts[i].state == Ghost.NORMAL){
					thisGame.setMode(thisGame.HIT_GHOST);
				}

			}
		}
		


	};
	
	// >=test2
	// Función para pintar el Pacman
	// En el test2 se llama drawPacman(x, y) {
	Pacman.prototype.draw = function(x, y) {
         
		// Pac Man
		// test2   
		// Tu código aquí
		// ojo: en el test2 esta función se llama drawPacman(x,y))

		const borde = "black";
		const fondo = "yellow";

		const pc = new Pacman();

		ctx.beginPath();
		ctx.strokeStyle = borde;
		ctx.fillStyle = fondo;

		ctx.arc(x+pc.radius,y+pc.radius,pc.radius,pc.angle1*Math.PI,pc.angle2*Math.PI, false);
		ctx.lineTo(x+pc.radius, y+pc.radius);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	};
    	
	// >=test5
	var player = new Pacman();
	
	// >=test10
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}
 
	// >=test5
	var thisGame = {

		getLevelNum : function(){
			return 0;
		},
		
		// >=test14
	        setMode : function(mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},

		addToScore : function(puntos){
			this.points += puntos;
		},
		
		// >=test6
		screenTileSize: [24, 21],
		
		// >=test5
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24,
		
		// >=test12
		ghostTimer: 0,
		
		// >=test14
		NORMAL : 1,
		HIT_GHOST : 2,
		GAME_OVER : 3,
		WAIT_TO_START: 4,
		modeTimer: 0,

		mode : 1,
		lifes : 3,
		points : 0,
		highscore : 0
	};
	
	// >=test5
	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap(); 
	
	// >=test2
	var measureFPS = function(newTime){
		// la primera ejecución tiene una condición especial

		if(lastTime === undefined) {
			lastTime = newTime; 
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime; 

		if (diffTime >= 1000) {

			fps = frameCount;    
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps; 
		frameCount++;
	};
	
	// >=test3
	// clears the canvas content
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);
	};

	// >=test4
	let checkInputs = function(){
		// test4
		// Tu código aquí (reestructúralo para el test7)

       /* if(inputStates.right){
            player.x= player.x + player.speed;
            player.velY = 0;
        }
        if(inputStates.left){
            player.x = player.x - player.speed;
            player.velY = 0;
        }
        if(inputStates.up){
            player.y = player.y - player.speed;
            player.velX = 0;
        }
        if(inputStates.down){
            player.y = player.y + player.speed;
            player.velX = 0;
        }
        if(inputStates.space){
            console.log("Ha pulsado espacio");
        }*/

		// test7
		// Tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7

		var TILE_WIDTH = thisGame.TILE_WIDTH;
		var TILE_HEIGHT = thisGame.TILE_HEIGHT;

		if((player.x % (TILE_WIDTH/2)) == 0 && ((player.x % TILE_WIDTH) != 0) && (player.y % (TILE_HEIGHT/2)) == 0 && ((player.y%TILE_WIDTH) != 0) && !inputStates.space ){

			if(inputStates.right && !thisLevel.checkIfHitWall(player.x + 4 * player.speed, player.y,0,0)){ //Pulsa hacia derecha y no toca borde
				player.velX = player.speed;
				player.velY = 0;
			}
			else if(inputStates.left && !thisLevel.checkIfHitWall(player.x - 5*player.speed, player.y,0,0)){ //Pulsa hacia izquierda y no toca borde
				player.velX = -player.speed;
				player.velY = 0;
			}
			else if(inputStates.up && !thisLevel.checkIfHitWall(player.x, player.y-5*player.speed,0,0)){ //Pulsa hacia arriba y no toca borde
				player.velY = -player.speed;
				player.velX = 0;
			}
			else if(inputStates.down && !thisLevel.checkIfHitWall(player.x, player.y+4*player.speed,0,0)){ //Pulsa hacia abajo y no toca borde
				player.velY = player.speed;
				player.velX = 0;
			}
			else if(inputStates.space){ //Pulsa espacio
				//console.log("Ha pulsado espacio");
			}
			else{ //Sin movimiento ni keydown
				player.velX=0;
				player.velY=0;

			}
		}
	};

	// >=test12
	var updateTimers = function(){
		// test12
        // Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)
		// Tu código aquí

		if (thisGame.ghostTimer == 0){
			for(let  i=0; i < numGhosts; i++){
				ghosts[i].state=Ghost.NORMAL;
			}
		}
		thisGame.ghostTimer--;

		// test14
		// Tu código aquí
		// actualiza modeTimer...
		thisGame.modeTimer++;
	};
	
	// >=test1
	var mainLoop = function(time){
    
		// test1 
		// Tu codigo aquí (solo tu código y la instrucción requestAnimationFrame(mainLoop);)

		/*var radio = 5;
		var borde ="green";
		var fondo = "green";
		var x = Math.random()*canvas.width;
		var y = Math.random()*canvas.height;
		var ini = (Math.PI/180)*0;
  		var fin = (Math.PI/180)*360;

		context = canvas.getContext("2d");
		context.beginPath();
		context.arc(x,y,radio,ini,fin,false);
		context.fillStyle = fondo;
		context.fill();
		context.strokeStyle = borde;
		context.stroke();*/

		// A partir del test2 deberás borrar lo implementado en el test1
		
		// >=test2
		// main function, called each frame 
		measureFPS(time);


		if (thisGame.mode == thisGame.GAME_OVER){
			thisLevel.displayGameOver();
		} else{
			// test14
			// Tu código aquí
			// sólo en modo NORMAL

			if (thisGame.mode == thisGame.NORMAL){
				// >=test4
				checkInputs();
				// test10
				// Tu código aquí
				// Mover fantasmas
				for(let i = 0; i<numGhosts; i++){
					ghosts[i].move();
				}
				// >=test3
				//ojo: en el test3 esta instrucción es pacman.move()
				player.move();
			}

			// test14
			// en modo HIT_GHOST
			// seguir el enunciado...
			// Tu código aquí
			else if (thisGame.mode === thisGame.HIT_GHOST){
				thisGame.modeTimer++;
				if(thisGame.modeTimer >= 90) {
					thisGame.lifes--;
					if(thisGame.lifes === 0)
						thisGame.setMode(thisGame.GAME_OVER);
					else {
						thisGame.setMode(thisGame.WAIT_TO_START);
						reset();
					}
				}
			}

			// test14
			// en modo WAIT_TO_START
			// seguir el enunciado...
			// Tu código aquí
			else if (thisGame.mode === thisGame.WAIT_TO_START){
				thisGame.modeTimer++;
				if(thisGame.modeTimer >= 30) {
					thisGame.setMode(thisGame.NORMAL);
				}
			}

			// >=test2
			// Clear the canvas
			clearCanvas();
			// >=test6
			thisLevel.drawMap();
			thisLevel.displayScore();
			// test10
			// Tu código aquí
			// Pintar fantasmas
			for(let i = 0; i<numGhosts; i++){
				ghosts[i].draw();
			}

			// >=test3
			//ojo: en el test3 esta instrucción es pacman.draw()
			player.draw();

			// >=test12
			updateTimers();

			// call the animation loop every 1/60th of second
			// comentar esta instrucción en el test3
			requestAnimationFrame(mainLoop);
		}
	};

	
	// >=test4
	var addListeners = function(){
    
		// add the listener to the main, window object, and update the states
		// test4
		// Tu código aquí
        window.addEventListener( "keydown", function(event){
            tecla = event.keyCode;
            if(tecla == 37){ //Izquierda
				inputStates.left=true;
				inputStates.right=false;
				inputStates.up=false;
				inputStates.space=false;
				inputStates.down=false;
            }
			else if(tecla == 39){ //Derecha
				inputStates.right = true;
				inputStates.left = inputStates.down = inputStates.up = inputStates.space = false;
            }
			else if(tecla == 38){ //Arriba
				inputStates.up = true;
				inputStates.right = inputStates.left = inputStates.down = inputStates.space = false;
            }
			else if(tecla == 40){ //Abajo
				inputStates.down = true;
				inputStates.up = inputStates.right = inputStates.left = inputStates.space = false;
            }
			else if (tecla == 32){ //Espacio
				inputStates.space = true;
				inputStates.right = inputStates.left = inputStates.down = inputStates.up = false;
            }
        }, false );
    };
	
	//>=test7
	var reset = function(){

		// test7
		// Tu código aquí
		// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
		// inicializa la posición inicial de Pacman tal y como indica el enunciado

		let TILE_WIDTH = thisGame.TILE_WIDTH;
		let TILE_HEIGHT = thisGame.TILE_HEIGHT;

		for (let j = 0; j <= thisGame.screenTileSize[0]; j++){ //Fila
			for (let i = 0; i <= thisGame.screenTileSize[1] - 1; i++){ //Columna
				let b = thisLevel.getMapTile(j, i);
				const baldosa = parseInt(b);
				if (baldosa == 4){ //Tipo baldosa = Pacman
					player.x = i * TILE_WIDTH + (TILE_WIDTH/2);
					player.y = j * TILE_HEIGHT + (TILE_HEIGHT/2);
				}

				// test10
				// Tu código aquí
				// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente

				else if(baldosa == 10){
					ghosts[0].x= i * TILE_WIDTH + (TILE_WIDTH/2);
					ghosts[0].y= j * TILE_HEIGHT + (TILE_HEIGHT/2);
					ghosts[0].homeX=ghosts[0].x;
					ghosts[0].homeY=ghosts[0].y;
					ghosts[0].velX = ghosts[0].speed;
					ghosts[0].velY = 0;
				}
				else if(baldosa == 11){
					ghosts[1].x= i * TILE_WIDTH + (TILE_WIDTH/2);
					ghosts[1].y= j * TILE_HEIGHT + (TILE_HEIGHT/2);
					ghosts[1].homeX = ghosts[1].x;
					ghosts[1].homeY = ghosts[1].y;
					ghosts[1].velX = ghosts[1].speed;
					ghosts[1].velY = 0;
				}
				else if(baldosa == 12){
					ghosts[2].x= i * TILE_WIDTH + (TILE_WIDTH/2);
					ghosts[2].y= j * TILE_HEIGHT + (TILE_HEIGHT/2);
					ghosts[2].homeX = ghosts[2].x;
					ghosts[2].homeY = ghosts[2].y;
					ghosts[2].velX = ghosts[2].speed;
					ghosts[2].velY = 0;
				}
				else if(baldosa == 13){
					ghosts[3].x = i * TILE_WIDTH + (TILE_WIDTH/2);
					ghosts[3].y = j * TILE_HEIGHT + (TILE_HEIGHT/2);
					ghosts[3].homeX = ghosts[3].x;
					ghosts[3].homeY = ghosts[3].y;
					ghosts[3].velX = ghosts[3].speed;
					ghosts[3].velY = 0;
				}
			}
		}

		inputStates.right=true;

		// >=test14
		thisGame.setMode( thisGame.NORMAL);
	};
	
	// >=test1
	var start = function(){
	
		// >=test2
		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer);
       	
       	// >=test4
		addListeners();

		// >=test7
		reset();

		// start the animation
		requestAnimationFrame(mainLoop);
	};

	// >=test1
	//our GameFramework returns a public API visible from outside its scope
	return {
		start: start,

		// solo para el test 10
		ghost: Ghost,  // exportando Ghost para poder probarla

		// solo para estos test: test12 y test13
		ghosts: ghosts,

		// solo para el test12
		thisLevel: thisLevel,

		// solo para el test 13
		Ghost: Ghost,

		// solo para el test14
		thisGame: thisGame
	};
};

// >=test1
var game = new GF();
game.start();




