(function () {
  var canvas = document.getElementById("flow");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ctx = canvas.getContext("2d");

  function size() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  size();
  window.addEventListener("resize", size);

  // ---- Perlin-like noise ----
  var perm = [];
  for (var i = 0; i < 256; i++) perm[i] = i;
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = perm[i]; perm[i] = perm[j]; perm[j] = t;
  }
  var p = perm.concat(perm);

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(hash, x, y) {
    var h = hash & 3;
    if (h === 0) return x + y;
    if (h === 1) return -x + y;
    if (h === 2) return x - y;
    return -x - y;
  }
  function noise(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    var u = fade(x), v = fade(y);
    var aa = p[p[X] + Y], ab = p[p[X] + Y + 1];
    var ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
    var x1 = lerp(grad(aa, x, y), grad(ba, x - 1, y), u);
    var x2 = lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u);
    return lerp(x1, x2, v);
  }

  // ---- Particles ----
  var COUNT = 1200;
  var particles = [];

  function Particle() { this.reset(); }
  Particle.prototype.reset = function () {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.px = this.x; this.py = this.y;
    this.speed = 0.6 + Math.random() * 1.0;   // slower = calmer
    this.life = 100 + Math.random() * 300;
  };
  Particle.prototype.update = function () {
    this.px = this.x; this.py = this.y;
    var angle = noise(this.x * 0.002, this.y * 0.002) * Math.PI * 4;
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
    this.life--;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 ||
        this.y > canvas.height || this.life <= 0) this.reset();
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(this.px, this.py);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
  };

  for (var k = 0; k < COUNT; k++) particles.push(new Particle());

  function animate() {
    // fade old trails toward transparent (keeps the page background visible)
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(25, 211, 255, 0.35)";
    ctx.lineWidth = 0.7;

    for (var n = 0; n < particles.length; n++) {
      particles[n].update();
      particles[n].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
})();