  /* ── Hero: braid canvas + scramble/glitch + node focus ── */
  (function(){
    const canvas = document.getElementById('braid');
    const ctx = canvas.getContext('2d');
    const heroEl = document.getElementById('hero');
    let W, H, DPR;
    function resize(){ DPR=Math.min(devicePixelRatio||1,2); const w=heroEl.clientWidth, h=heroEl.clientHeight; W=canvas.width=w*DPR; H=canvas.height=h*DPR; canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    resize(); addEventListener('resize', resize);
    function cssvar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
    const COL = { sec:cssvar('--sec'), ai:cssvar('--ai'), fin:cssvar('--fin'), signal:cssvar('--signal') };
    const MIX = 'oklch(0.95 0.035 130)';

    const A = 0.165, OMEGA = 2.15, SPEED = 0.9, TWO_PI = Math.PI*2;
    const strands = [
      { key:'sec', col:'sec', phase: 0,            entry: 0.00 },
      { key:'ai',  col:'ai',  phase: TWO_PI/3,     entry: 0.00 },
      { key:'fin', col:'fin', phase: 2*TWO_PI/3,   entry: 0.46 },
    ];
    let t=0, focus=null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerp=(a,b,u)=>a+(b-a)*u;
    const smooth=(e0,e1,x)=>{ const u=Math.max(0,Math.min(1,(x-e0)/(e1-e0))); return u*u*(3-2*u); };
    function knot(){ return { x:0.84, y:0.50 }; }
    function smoothPoly(pts){ if(pts.length<2) return; ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length-1;i++){ const mx=(pts[i][0]+pts[i+1][0])/2, my=(pts[i][1]+pts[i+1][1])/2; ctx.quadraticCurveTo(pts[i][0],pts[i][1],mx,my); } ctx.lineTo(pts[pts.length-1][0],pts[pts.length-1][1]); ctx.stroke(); }

    function symPts(s,k){
      const N=200, pts=[]; const start=Math.floor(s.entry*N);
      for(let i=start;i<=N;i++){
        const tt=i/N, x=lerp(0,k.x,tt)*W;
        const env=Math.sin(Math.PI*tt) * smooth(s.entry, s.entry+0.08, tt);
        const spine=lerp(0.5, k.y, smooth(0.5,1.0,tt));
        const off=A*env*Math.sin(OMEGA*TWO_PI*tt + t*SPEED + s.phase);
        pts.push([x,(spine+off)*H]);
      }
      return pts;
    }
    function pulse(pts, off, color){
      if(pts.length<2) return;
      let len=0; const segs=[]; for(let i=1;i<pts.length;i++){ const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); segs.push(d); len+=d; }
      const pos=(((t*0.07)+off)%1)*len; let acc=0,px=pts[0][0],py=pts[0][1];
      for(let i=1;i<pts.length;i++){ if(acc+segs[i-1]>=pos){ const f=(pos-acc)/segs[i-1]; px=pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f; py=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f; break; } acc+=segs[i-1]; }
      ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=14*DPR; ctx.beginPath(); ctx.arc(px,py,2.4*DPR,0,7); ctx.fill(); ctx.shadowBlur=0;
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      const k=knot(), kx=k.x*W, ky=k.y*H;
      ctx.lineCap='round'; ctx.lineJoin='round';
      strands.forEach(s=>{
        const foc = focus===null?1:(focus===s.key?1:0.10);
        const pts=symPts(s,k);
        const color=COL[s.col];
        ctx.globalAlpha=0.055*foc; ctx.strokeStyle=color; ctx.lineWidth=24*DPR; smoothPoly(pts);
        ctx.globalAlpha=0.14*foc;  ctx.lineWidth=8*DPR;  smoothPoly(pts);
        ctx.globalAlpha=0.95*foc;  ctx.lineWidth=1.8*DPR; smoothPoly(pts);
        ctx.globalAlpha=foc; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(pts[0][0],pts[0][1],2.8*DPR,0,7); ctx.fill();
        ctx.globalAlpha=foc; pulse(pts, s.phase*0.05, color); pulse(pts, s.phase*0.05+0.5, color);
      });
      if(focus===null){
        for(let tt=0.08; tt<0.8; tt+=0.012){
          const ys=strands.map(s=>{ if(tt<s.entry) return null; const env=Math.sin(Math.PI*tt)*smooth(s.entry,s.entry+0.08,tt); const spine=lerp(0.5,k.y,smooth(0.5,1.0,tt)); return (spine+A*env*Math.sin(OMEGA*TWO_PI*tt+t*SPEED+s.phase)); });
          const xx=lerp(0,k.x,tt)*W;
          for(let a=0;a<3;a++) for(let b=a+1;b<3;b++){
            if(ys[a]==null||ys[b]==null) continue;
            if(Math.abs(ys[a]-ys[b])<0.004){
              ctx.globalAlpha=0.85; ctx.fillStyle=MIX; ctx.shadowColor=MIX; ctx.shadowBlur=12*DPR;
              ctx.beginPath(); ctx.arc(xx,((ys[a]+ys[b])/2)*H,1.9*DPR,0,7); ctx.fill(); ctx.shadowBlur=0;
            }
          }
        }
      }
      const tg=ctx.createLinearGradient(kx,0,W,0); tg.addColorStop(0,MIX); tg.addColorStop(1,'oklch(0.95 0.035 130 / 0)');
      ctx.globalAlpha=0.7; ctx.strokeStyle=tg; ctx.lineWidth=1.6*DPR;
      ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(W,ky); ctx.stroke();
      [COL.sec,COL.ai,COL.fin].forEach(c=>{ ctx.globalAlpha=0.20; ctx.fillStyle=c; ctx.shadowColor=c; ctx.shadowBlur=28*DPR; ctx.beginPath(); ctx.arc(kx,ky,5.5*DPR,0,7); ctx.fill(); });
      ctx.shadowBlur=0;
      ctx.globalAlpha=1; ctx.fillStyle=MIX; ctx.shadowColor=MIX; ctx.shadowBlur=22*DPR;
      ctx.beginPath(); ctx.arc(kx,ky,3.8*DPR,0,7); ctx.fill(); ctx.shadowBlur=0;
      if(!reduce){ t+=0.006; requestAnimationFrame(draw); }
    }
    draw();

    document.querySelectorAll('#hero .node').forEach(n=>{
      n.addEventListener('mouseenter',()=>{ focus=n.dataset.strand; if(reduce) draw(); });
      n.addEventListener('mouseleave',()=>{ focus=null; if(reduce) draw(); });
    });

    /* headline scramble + glitch */
    const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%@&*+/'.split('');
    function scramble(el,delay){ const text=el.dataset.text, frames=Math.max(text.length,14), fdur=55; let frame=0;
      function tick(){ const rev=Math.floor(text.length*(frame/frames)); el.textContent=text.split('').map((c,i)=>(i<rev||c===' '||c==='.'||c==="'")?c:CH[Math.floor(Math.random()*CH.length)]).join(''); if(frame++<frames) setTimeout(tick,fdur); else el.textContent=text; }
      setTimeout(tick,delay||0);
    }
    if(!reduce){
      const h1=document.querySelector('#hero h1');
      const lines=h1.querySelectorAll('.l1,.l2');
      let cool=false;
      h1.addEventListener('mouseenter',()=>{
        if(cool) return; cool=true; setTimeout(()=>cool=false,1500);
        h1.classList.add('glitching'); setTimeout(()=>h1.classList.remove('glitching'),420);
        lines.forEach((l,i)=>scramble(l,i*170));
      });
    }
  })();
