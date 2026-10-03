(function () {
  var canvas = document.getElementById('snow');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var W, H, flakes = [];
  var COUNT = 90;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function make(anywhere) {
    var depth = Math.random();            // 0 = far and faint, 1 = near and big
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -30,
      r: 1.5 + depth * 5.5,               // bigger flakes read as blurrier
      speed: 0.12 + depth * 0.4,
      sway: 8 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.12 + depth * 0.33
    };
  }

  for (var i = 0; i < COUNT; i++) flakes.push(make(true));

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.speed;
      f.phase += 0.004;
      var x = f.x + Math.sin(f.phase) * f.sway;

      if (f.y - f.r > H) { flakes[i] = make(false); continue; }

      var g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r);
      g.addColorStop(0, 'rgba(225, 233, 245, ' + f.alpha + ')');
      g.addColorStop(1, 'rgba(225, 233, 245, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();