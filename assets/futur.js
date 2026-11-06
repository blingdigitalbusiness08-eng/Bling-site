(function(){
var d=document,$=function(s,r){return(r||d).querySelector(s)},$$=function(s,r){return[].slice.call((r||d).querySelectorAll(s))};
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var nav=$('#nav');
if(nav){var keep=function(){nav.classList.remove('hidden');d.documentElement.classList.remove('nav-away')};keep();addEventListener('scroll',keep,{passive:true})}
$$('.offer,.contact-card,.service-row,.step,.brand-row,.feature-grid>*').forEach(function(c){
if(getComputedStyle(c).position==='static')c.style.position='relative';c.classList.add('has-spot');
var s=d.createElement('span');s.className='spot';s.setAttribute('aria-hidden','true');c.appendChild(s);
c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')},{passive:true})});
var hero=$('.hero'),cv=$('.hero-fx canvas');
if(!hero||!cv)return;
var ctx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W=0,H=0,P=[],mx=-999,my=-999,touch=false,run=true,wall=$('.wall-wrap'),wl=$('.wall'),obs=$$('.ob');
var GOLD='rgba(255,215,94,A)',SILV='rgba(214,214,214,A)';
function star(x,y,r,col){ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.quadraticCurveTo(x,y,x,y+r);ctx.quadraticCurveTo(x,y,x-r,y);ctx.quadraticCurveTo(x,y,x,y-r);ctx.fillStyle=col;ctx.fill()}
function init(){var n=W<700?26:W<1200?46:70;P=[];for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()<.35?4+Math.random()*5:1+Math.random()*1.4,s:0,g:Math.random()<.4,p:Math.random()*6.3});P.forEach(function(p){p.s=p.r>3})}
function size(){var r=hero.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);init();place()}
function place(){if(!wall)return;var h=hero.getBoundingClientRect(),w=wall.getBoundingClientRect(),s=Math.min(Math.max(w.width,w.height)*1.2,innerWidth*.98);obs.forEach(function(o){o.style.left=(w.left-h.left+w.width/2)+'px';o.style.top=(w.top-h.top+w.height/2)+'px';o.style.setProperty('--os',s+'px')})}
function frame(t){
if(!run)return;
ctx.clearRect(0,0,W,H);
if(touch||mx<-900){mx=W*(.5+.32*Math.cos(t*.0004));my=H*(.5+.3*Math.sin(t*.0006))}
for(var i=0;i<P.length;i++){var p=P[i];
var dx=mx-p.x,dy=my-p.y,dist=Math.sqrt(dx*dx+dy*dy);
if(dist<190&&dist>1){p.vx+=dx/dist*.012;p.vy+=dy/dist*.012}
p.vx*=.995;p.vy*=.995;p.x+=p.vx;p.y+=p.vy;
if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;
for(var j=i+1;j<P.length;j++){var q=P[j],ax=p.x-q.x,ay=p.y-q.y,dd=ax*ax+ay*ay;
if(dd<16900){var a=(1-dd/16900)*.28;ctx.strokeStyle=(p.g||q.g?GOLD:SILV).replace('A',a);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}
var al=.4+.45*Math.sin(t*.002+p.p),col=(p.g?GOLD:SILV).replace('A',Math.max(.08,al));
if(p.s)star(p.x,p.y,p.r,col);else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle=col;ctx.fill()}}
if(!rm)requestAnimationFrame(frame)}
hero.addEventListener('pointermove',function(e){if(e.pointerType==='touch'){touch=true;return}touch=false;var r=hero.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;
if(wl&&!rm){var nx=(e.clientX/innerWidth-.5)*2,ny=(e.clientY/innerHeight-.5)*2,a=Math.min(1,Math.sqrt(nx*nx+ny*ny))*7;wl.style.rotate=(-ny)+' '+nx+' 0 '+a+'deg'}},{passive:true});
hero.addEventListener('pointerleave',function(){mx=-999;if(wl)wl.style.rotate='none'});
new IntersectionObserver(function(en){var v=en[0].isIntersecting;if(v&&!run){run=true;requestAnimationFrame(frame)}else if(!v)run=false}).observe(hero);
var tk=false;addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(function(){place();tk=false})}},{passive:true});
addEventListener('resize',size);
size();[250,900,1800].forEach(function(ms){setTimeout(place,ms)});
requestAnimationFrame(frame);
})();
