( function() {
  window.Bricks = window.Bricks || {};

  var Paddle = window.Bricks.Paddle = function(options) {
    this.pos = options.pos;
    this.vel = options.vel; //initializes to 0
    this.width = Paddle.WIDTH;
    this.height = Paddle.HEIGHT;
    this.color = options.color || "white";
    this.dimX = options.dimX;
    // this.game = options.game;       //it must know the game it's on, if the game will have wrapping function. will i need this?
  };

  Paddle.WIDTH = 100;
  Paddle.HEIGHT = 10;
  Paddle.OFF_SCREEN = 30;
  Paddle.SPEED = 2;

  //draws onto the board
  Paddle.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.moveTo(this.pos[0], this.pos[1]);
    ctx.lineTo(this.pos[0] + this.width, this.pos[1]);
    ctx.lineTo(this.pos[0] + this.width - Paddle.OFF_SCREEN,
               this.pos[1] + this.height);
    ctx.lineTo(this.pos[0] + Paddle.OFF_SCREEN,
               this.pos[1] + this.height);
    ctx.closePath();

    ctx.fill();
  };

  Paddle.prototype.move = function () {
    this.checkKeysPressed();
    var newX = this.pos[0] + this.vel[0];
    var newY = this.pos[1] + this.vel[1];
    this.ensurePaddleStaysOnScreen();
    this.pos = [newX, newY];      //check for bounces here
  };

  Paddle.prototype.checkKeysPressed = function() {
    if (key.isPressed('left')) {
      this.powerPaddle(-1);
    } else if (key.isPressed('right')) {
      this.powerPaddle(1);
    } else {
      this.powerPaddle(0);
    }
  };

  Paddle.prototype.powerPaddle = function(scale) {
    this.vel[0] = Paddle.SPEED * scale;
  };

  Paddle.prototype.ensurePaddleStaysOnScreen = function() {
    //PH******* allow 30px of give;
    if (this.pos[0] < -Paddle.OFF_SCREEN) {
      this.pos[0] = -Paddle.OFF_SCREEN;
    } else if ((this.pos[0] + this.width) > this.dimX + Paddle.OFF_SCREEN) {
      this.pos[0] = this.dimX - this.width + Paddle.OFF_SCREEN;
    }
  };

  Paddle.prototype.checkBallHit = function(ball) {
    if ( this.ballNotOnPaddle(ball) || this.ballBelowPaddle(ball) ) {
      this._transitionOutOfPaddle = false;
      return;
    }

    if (this._transitionOutOfPaddle) {
      return
    } else {
      this._transitionOutOfPaddle = true;
      ball.vel[1] *= -1;      //once actually handle ballHit, remove this line
      this.handleBallHit(ball);
    }
  };

  //it's not on or below the ball...
  Paddle.prototype.ballNotOnPaddle = function(ball) {
    if (ball.pos[1] + ball.radius < this.pos[1]) {

      return true;        //ball hasn't reached paddle's Y coordinate ( ie. it's above the paddle)
      //remember the position is the TOP LEFT of the rectangle
    } else {
      return (ball.pos[0] + ball.radius < this.pos[0]) ||
             (ball.pos[0] - ball.radius > this.pos[0] + this.width);
    }
  };

  Paddle.prototype.ballBelowPaddle = function(ball) {
    return ball.pos[1] >= this.pos[1] + this.height / 2;
    //need a greater than/equal to - else could skate ALONG the paddle.terrible
    //what if you make a thicker paddle?
  };

  Paddle.prototype.handleBallHit = function(ball) {
    var collisionPos = this.findCollisionPos(ball);
    var nudgeScale = this.findNudgeScale(collisionPos);
  };

  Paddle.prototype.findCollisionPos = function(ball) {
    var collisionPos = ball.pos[0];
    // if ball hits the paddle on left or right side (ie. center of ball not over paddle), handles as if center has hit the edge
    //PH**** - need to see if we need to take velocity into account. will be weird if paddle moves into ball, and then you hit the ball on the edge...
    if (collisionPos > this.pos[0] + this.width) {
      collisionPos = this.pos[0] + this.width;
    } else if (collisionPos < this.pos[0]) {
      collisionPos = this.pos[0];
    }

    return collisionPos;
  };

  Paddle.prototype.findNudgeScale = function(collisionPos) {
    // scales the collisionPos vs. width of the paddle, -1 to 1, inclusive
    var paddleCollisionSpot = collisionPos - this.pos[0];

    var halfWidth = this.width / 2;
    var scale = ((paddleCollisionSpot - halfWidth) / halfWidth);
    return scale;
  };

}() );
