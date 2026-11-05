  /* ---------- Exercise figures: drawn athletes (side view), male and female, both in KDN tees ---------- */
  /* Original characters. Everything is drawn from joint positions (head, neck, hip, arms, legs). */
  var EQ='#1D4ED8', OL='#14202B', SK='#FFD7BC', SK2='#E3B193', RED='#E5483B';
  var PAL = {
    m:{shirt:'#1D4ED8',shirt2:'#17368F',txt:'#FFFFFF',sh:'#1F2937',sh2:'#0F172A',lg:'',lg2:'',shoe:'#F8FAFC',shoe2:'#C8D2DE',hair:'#0E2A6B',hair2:'#3B6FE0',bg:'#D8E5FF',w:11.8},
    f:{shirt:'#FFFFFF',shirt2:'#D9E2F2',txt:'#1D4ED8',sh:'',sh2:'',lg:'#243066',lg2:'#161E47',shoe:'#F8FAFC',shoe2:'#C8D2DE',hair:'#4B2A1A',hair2:'#85552F',bg:'#F9DEE8',w:10.2}
  };
  function pts(a){return a.map(function(p){return p[0]+','+p[1]}).join(' ')}
  function ln(a,w,col){return '<polyline points="'+pts(a)+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>'}
  function along(a,b,t){return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]}
  function legDraw(p,l,far,P){
    var k=l[0], a=l[1], toe=l[2]||[a[0]+8,a[1]+1];
    var skin=far?SK2:SK, shoe=far?P.shoe2:P.shoe, g='';
    if(P.lg){
      var lc=far?P.lg2:P.lg;
      g=ln([p,k,a],11.4,OL)+ln([a,toe],8.6,OL)+ln([p,k],9.4,lc)+ln([k,along(k,a,0.86)],7.6,lc)+ln([along(k,a,0.86),a],6,skin);
    } else {
      var sh=far?P.sh2:P.sh;
      g=ln([p,k,a],11.6,OL)+ln([a,toe],8.6,OL)+ln([p,k],8.8,skin)+ln([k,a],7,skin)+ln([p,along(p,k,0.64)],10.4,sh);
    }
    return g+ln([a,toe],6.4,shoe)+ln([along(a,toe,0.55),along(a,toe,0.9)],6.4,RED);
  }
  function armDraw(n,a,far,P){
    var e=a[0], h=a[1], skin=far?SK2:SK, sl=far?P.shirt2:P.shirt;
    return ln([n,e,h],8.6,OL)+ln([n,e],6.6,skin)+ln([e,h],5.6,skin)+
      ln([n,along(n,e,0.5)],8,sl)+
      ln([along(e,h,0.62),along(e,h,0.8)],6,RED)+
      '<circle cx="'+h[0]+'" cy="'+h[1]+'" r="3.5" fill="'+skin+'" stroke="'+OL+'" stroke-width="1.2"/>';
  }
  function headDraw(h,n,P,gd){
    var th=Math.atan2(h[1]-n[1],h[0]-n[0])*180/Math.PI;
    var rot=Math.round((th+90)*10)/10;
    var g='';
    if(gd==='f'){
      g+='<path d="M-8 -8Q-20 -9 -21 2Q-22 11 -15 15Q-18 7 -13.5 2.5Q-10 -2 -8 -8Z" fill="'+P.hair+'" stroke="'+OL+'" stroke-width="1.1" stroke-linejoin="round"/>';
      g+='<path d="M-8.6 5Q-13.5 -4 -9 -11Q-2 -17.5 6 -13.5Q11.5 -9 9.4 -3Q4 -8 -3 -5Q-7 -2 -8.6 5Z" fill="'+P.hair+'" stroke="'+OL+'" stroke-width="1.2" stroke-linejoin="round"/>';
      g+='<path d="M-9 -9Q-12 -10 -13 -6" stroke="'+P.hair2+'" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
      g+='<circle r="9" fill="'+SK+'" stroke="'+OL+'" stroke-width="1.6"/>';
      g+='<ellipse cx="-2.8" cy="1.4" rx="2" ry="2.6" fill="'+SK2+'" stroke="'+OL+'" stroke-width="1"/>';
      g+='<path d="M-8.7 -2.4Q-7 -10 2 -9.6Q8.2 -9 9 -4Q5.4 -6.6 3.4 -4Q1.2 -6.8 -2.8 -5Q-5.8 -3.2 -8.7 -2.4Z" fill="'+P.hair+'"/>';
      g+='<path d="M-8.9 -3.4Q0 -6.6 8.9 -4" stroke="'+EQ+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      g+='<ellipse cx="4.2" cy="0.6" rx="2.6" ry="3.3" fill="#fff" stroke="'+OL+'" stroke-width="0.9"/>';
      g+='<circle cx="4.9" cy="1" r="2" fill="#7A4A2A"/><circle cx="4.9" cy="1.1" r="1" fill="#0B1220"/><circle cx="5.6" cy="0" r="0.75" fill="#fff"/>';
      g+='<path d="M1.8 -3L7.6 -4.4M7 -2.6L8.6 -3.6" stroke="'+OL+'" stroke-width="1.2" stroke-linecap="round"/>';
      g+='<ellipse cx="5.4" cy="4.4" rx="1.8" ry="1" fill="#FF8FA3" opacity=".7"/>';
      g+='<path d="M5.4 6.4Q7.2 7.6 8.6 6" stroke="#D9435A" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
    } else {
      g+='<path d="M-8.5 5L-15 -2L-10.5 -4.5L-14.5 -12L-6.5 -9L-6 -18.5L0 -11.5L4.5 -18.5L6.5 -10L12.5 -13L10 -4Z" fill="'+P.hair+'" stroke="'+OL+'" stroke-width="1.2" stroke-linejoin="round"/>';
      g+='<path d="M-6 -9L-6 -16M4.5 -11L4.5 -16" stroke="'+P.hair2+'" stroke-width="1.4" stroke-linecap="round"/>';
      g+='<path d="M-8.8 -3.4L-17 -7M-8.8 -3.4L-18 -1.5" stroke="'+RED+'" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
      g+='<circle r="9" fill="'+SK+'" stroke="'+OL+'" stroke-width="1.6"/>';
      g+='<ellipse cx="-2.8" cy="1.4" rx="2" ry="2.6" fill="'+SK2+'" stroke="'+OL+'" stroke-width="1"/>';
      g+='<path d="M-8.7 -2.2Q-7 -10 2 -9.6Q8.2 -9 9 -4.2Q5.6 -6.4 3.6 -3.8Q1.4 -6.6 -2.6 -4.8Q-5.6 -3 -8.7 -2.2Z" fill="'+P.hair+'"/>';
      g+='<path d="M-8.9 -3.4Q0 -6.6 8.9 -4" stroke="'+RED+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      g+='<ellipse cx="4.2" cy="0.4" rx="2.6" ry="3.4" fill="#fff" stroke="'+OL+'" stroke-width="0.9"/>';
      g+='<circle cx="4.9" cy="0.8" r="2" fill="#2563EB"/><circle cx="4.9" cy="0.9" r="1" fill="#0B1220"/><circle cx="5.6" cy="-0.3" r="0.75" fill="#fff"/>';
      g+='<path d="M1.8 -3.4L7.4 -4.6" stroke="'+OL+'" stroke-width="1.2" stroke-linecap="round"/>';
      g+='<ellipse cx="5.4" cy="4.2" rx="1.8" ry="1" fill="#FF9AA2" opacity=".75"/>';
      g+='<path d="M6 6Q7.8 7 8.5 5.6" stroke="'+OL+'" stroke-width="1" fill="none" stroke-linecap="round"/>';
    }
    return '<g transform="translate('+h[0]+' '+h[1]+') rotate('+rot+')">'+g+'</g>';
  }
  /* the tee: torso plus the KDN print, turned to follow the body */
  function torsoDraw(n,p,P){
    var s=ln([n,p],P.w+2.4,OL)+ln([n,p],P.w,P.shirt);
    s+=ln([along(n,p,0.86),along(n,p,0.97)],P.w-1.2,P.shirt2).replace('stroke-linecap="round"','stroke-linecap="butt" stroke-opacity=".55"');
    var m=along(n,p,0.43), ang=Math.atan2(p[1]-n[1],p[0]-n[0])*180/Math.PI-90;
    while(ang>90) ang-=180;
    while(ang<-90) ang+=180;
    s+='<g transform="translate('+m[0].toFixed(1)+' '+m[1].toFixed(1)+') rotate('+ang.toFixed(1)+')"><text x="0" y="1.7" text-anchor="middle" font-family="Bricolage Grotesque,Arial Black,Arial,sans-serif" font-weight="800" font-size="4.7" letter-spacing=".15" fill="'+P.txt+'">KDN</text></g>';
    return s;
  }
  function bgFor(col){
    var s='<rect x="0" y="-12" width="100" height="102" fill="'+col+'"/>';
    for(var i=0;i<26;i++){
      var an=i*Math.PI*2/26, c=Math.cos(an), sn=Math.sin(an);
      s+='<line x1="'+(50+c*30).toFixed(1)+'" y1="'+(34+sn*30).toFixed(1)+'" x2="'+(50+c*95).toFixed(1)+'" y2="'+(34+sn*95).toFixed(1)+'" stroke="#fff" stroke-opacity=".6" stroke-width="'+(i%2?1.1:2.6)+'"/>';
    }
    return s;
  }
  var BGS={m:bgFor(PAL.m.bg),f:bgFor(PAL.f.bg)};
  /* the figure only (no background), used by cards and by the home-page scene */
  function body(j,g){
    var P=PAL[g||'m'], s='';
    if(j.pre) s+=j.pre;
    if(j.l[1]) s+=legDraw(j.p,j.l[1],true,P);
    if(j.a[1]) s+=armDraw(j.n,j.a[1],true,P);
    s+=torsoDraw(j.n,j.p,P);
    s+=legDraw(j.p,j.l[0],false,P);
    s+=ln([j.n,along(j.n,j.h,0.7)],5.4,OL)+ln([j.n,along(j.n,j.h,0.7)],3.8,SK);
    s+=armDraw(j.n,j.a[0],false,P);
    s+=headDraw(j.h,j.n,P,g||'m');
    if(j.eq) s+=j.eq;
    return s;
  }
  function frame(j,g){
    g=g||'m';
    return '<svg viewBox="0 -12 100 102" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'+BGS[g]+'<ellipse cx="50" cy="82" rx="40" ry="3" fill="#14202B" opacity=".14"/>'+body(j,g)+'</svg>';
  }
  function std(o){
    var b={h:[50,12],n:[50,21],p:[50,46],a:[[[52,33],[53,44]],[[48,33],[47,44]]],l:[[[51,62],[50,77],[57,79]],[[49,62],[46,77],[53,79]]]};
    for(var k in o) b[k]=o[k];
    return b;
  }
  function db(x,y){return '<rect x="'+(x-7)+'" y="'+(y-4)+'" width="14" height="8" rx="3" fill="'+EQ+'"/>'}
  function dbv(x,y){return '<rect x="'+(x-4)+'" y="'+(y-7)+'" width="8" height="14" rx="3" fill="'+EQ+'"/>'}
  function rod(x,y){return '<rect x="'+(x-11)+'" y="'+(y-3)+'" width="22" height="6" rx="3" fill="'+EQ+'"/>'}
  function plate(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="6.5" fill="#14202B"/><circle cx="'+x+'" cy="'+y+'" r="2.2" fill="#fff"/>'}
  function kb(x,y){return '<circle cx="'+x+'" cy="'+(y+3)+'" r="5.6" fill="'+EQ+'"/><path d="M'+(x-3.2)+' '+(y+0.5)+'Q'+x+' '+(y-7)+' '+(x+3.2)+' '+(y+0.5)+'" stroke="'+EQ+'" stroke-width="2.2" fill="none" stroke-linecap="round"/>'}
  function ik(hip,foot,l1,l2,up){ /* knee position for a two-bone leg; up = bend direction */
    var dx=foot[0]-hip[0], dy=foot[1]-hip[1], d=Math.min(Math.sqrt(dx*dx+dy*dy),l1+l2-0.01);
    var a=(l1*l1-l2*l2+d*d)/(2*d), h=Math.sqrt(Math.max(0,l1*l1-a*a));
    var ux=dx/Math.sqrt(dx*dx+dy*dy), uy=dy/Math.sqrt(dx*dx+dy*dy);
    return [hip[0]+ux*a+(-uy)*h*up, hip[1]+uy*a+ux*h*up];
  }
  var BENCH = '<rect x="6" y="65" width="70" height="6" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/><path d="M14 71V82M68 71V82" stroke="#B8C4D4" stroke-width="3"/>';
  var CHAIR = '<rect x="8" y="58" width="38" height="6" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/><path d="M14 64V82M40 64V82" stroke="#B8C4D4" stroke-width="3"/>';
  var PBAR = '<path d="M26 4H74" stroke="#14202B" stroke-width="3" stroke-linecap="round"/><path d="M30 4V-12M70 4V-12" stroke="#B8C4D4" stroke-width="3"/>';
  var BOX = '<rect x="46" y="66" width="36" height="14" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/>';
  var WALL = '<rect x="22" y="-8" width="6" height="90" fill="#E3E9F2" stroke="#B8C4D4"/>';
  var TABLE = '<rect x="26" y="40" width="62" height="5" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/><path d="M30 45V82M84 45V82" stroke="#B8C4D4" stroke-width="3"/>';
  var SEAT = '<rect x="24" y="68" width="30" height="5" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/><path d="M39 73V82" stroke="#B8C4D4" stroke-width="3"/>';
  var CABLE = '<rect x="86" y="-12" width="10" height="94" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/>';
  var BIKE = '<circle cx="50" cy="66" r="3" fill="#B8C4D4"/><path d="M50 66L40 44M40 44H34M40 44L66 44L76 38M66 44L58 66M50 66H66" stroke="#9AA9BD" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="30" y="41" width="12" height="4" rx="2" fill="#586774"/><path d="M72 38H80" stroke="#586774" stroke-width="3" stroke-linecap="round"/><path d="M26 80H80" stroke="#B8C4D4" stroke-width="3"/>';
  var CYCP = [0,90,180,270].map(function(deg){
    var hip=[42,46], r=Math.PI*deg/180, c=[52,68];
    var fn=[c[0]+9*Math.cos(r), c[1]+9*Math.sin(r)], ff=[c[0]-9*Math.cos(r), c[1]-9*Math.sin(r)];
    var kn=ik(hip,[fn[0]-2,fn[1]-3],16,15,-1), kf=ik(hip,[ff[0]-2,ff[1]-3],16,15,-1);
    return {pre:BIKE,h:[58,18],n:[53,28],p:hip,a:[[[64,34],[73,39]],[[63,35],[72,40]]],l:[[kn,[fn[0]-2,fn[1]-3],[fn[0]+5,fn[1]-2]],[kf,[ff[0]-2,ff[1]-3],[ff[0]+5,ff[1]-2]]]};
  });
  var BURP1={h:[62,40],n:[56,46],p:[44,62],a:[[[60,60],[66,77]],[[58,60],[64,77]]],l:[[[58,66],[52,77],[59,79]],[[56,67],[50,77],[57,79]]]};
  var PLK={h:[78,48],n:[70,52],p:[45,64],a:[[[71,65],[72,78]],[[69,65],[70,78]]],l:[[[31,70],[16,77],[11,79]],[[31,71],[18,77],[13,79]]]};
  var PL = {
    squat:[
      std({a:[[[58,27],[66,23]],[[56,28],[64,25]]]}),
      {h:[61,32],n:[56,40],p:[44,60],a:[[[66,42],[75,40]],[[64,44],[73,42]]],l:[[[60,64],[52,77],[59,79]],[[58,64],[48,77],[55,79]]]}],
    pushup:[
      {h:[78,48],n:[70,52],p:[45,64],a:[[[71,65],[72,78]],[[69,65],[70,78]]],l:[[[31,70],[16,77],[11,79]],[[31,71],[18,77],[13,79]]]},
      {h:[79,69],n:[70,70],p:[47,73],a:[[[58,72],[72,78]],[[56,72],[70,78]]],l:[[[32,75],[16,77],[11,79]],[[32,76],[18,77],[13,79]]]}],
    row:[
      {h:[67,38],n:[58,42],p:[34,50],a:[[[59,53],[59,64]],[[57,53],[57,64]]],l:[[[48,60],[46,77],[53,79]],[[46,60],[43,77],[50,79]]],eq:db(59,66)},
      {h:[67,38],n:[58,42],p:[34,50],a:[[[46,47],[55,52]],[[44,47],[53,52]]],l:[[[48,60],[46,77],[53,79]],[[46,60],[43,77],[50,79]]],eq:db(55,54)}],
    plank:[
      {h:[82,55],n:[74,58],p:[46,67],a:[[[74,76],[90,77]],[[72,76],[88,77]]],l:[[[30,72],[14,77],[9,79]],[[30,73],[16,77],[11,79]]]}],
    walk:[
      std({l:[[[58,62],[62,77],[69,79]],[[46,62],[38,75],[34,74]]],a:[[[46,32],[43,42]],[[56,30],[60,38]]]}),
      std({l:[[[46,62],[38,75],[34,74]],[[58,62],[62,77],[69,79]]],a:[[[56,30],[60,38]],[[46,32],[43,42]]]})],
    run:[
      {h:[59,13],n:[55,22],p:[48,46],a:[[[45,32],[43,23]],[[63,31],[69,24]]],l:[[[64,50],[60,66],[67,67]],[[40,58],[28,62],[24,58]]]},
      {h:[59,13],n:[55,22],p:[48,46],a:[[[63,31],[69,24]],[[45,32],[43,23]]],l:[[[40,58],[28,62],[24,58]],[[64,50],[60,66],[67,67]]]}],
    lunge:[
      std({a:[[[41,31],[47,40]],[[43,31],[49,40]]]}),
      {h:[54,27],n:[54,36],p:[54,60],a:[[[45,45],[52,53]],[[47,45],[54,53]]],l:[[[70,62],[70,77],[77,79]],[[45,72],[32,76],[27,79]]]}],
    bridge:[
      {h:[15,76],n:[24,77],p:[50,77],a:[[[36,78],[46,78]],[[35,78],[45,78]]],l:[[[62,64],[74,78],[81,79]],[[60,65],[72,78],[79,79]]]},
      {h:[19,78],n:[26,74],p:[47,59],a:[[[37,77],[47,78]],[[36,77],[46,78]]],l:[[[62,64],[74,78],[81,79]],[[60,65],[72,78],[79,79]]]}],
    legraise:[
      {h:[15,76],n:[24,77],p:[50,77],a:[[[36,78],[46,78]],[[35,78],[44,78]]],l:[[[66,73],[82,71],[86,71]],[[66,74],[82,72],[86,72]]]},
      {h:[15,76],n:[24,77],p:[50,77],a:[[[36,78],[46,78]],[[35,78],[44,78]]],l:[[[50,61],[50,45],[55,45]],[[52,61],[52,45],[57,45]]]}],
    climber:[
      {h:[78,48],n:[70,52],p:[45,64],a:[[[71,65],[72,78]],[[69,65],[70,78]]],l:[[[31,70],[16,77],[11,79]],[[60,60],[54,72],[50,73]]]},
      {h:[78,48],n:[70,52],p:[45,64],a:[[[71,65],[72,78]],[[69,65],[70,78]]],l:[[[60,60],[54,72],[50,73]],[[31,71],[18,77],[13,79]]]}],
    ohpress:[
      std({a:[[[58,30],[55,20]],[[56,31],[53,21]]],eq:db(55,18)}),
      std({a:[[[52,11],[52,1]],[[48,11],[49,1]]],eq:rod(51,-2)})],
    curl:[
      std({a:[[[51,33],[53,46]],[[49,33],[47,46]]],eq:db(53,48)}),
      std({a:[[[51,34],[60,24]],[[49,34],[44,46]]],eq:db(60,22)})],
    dips:[
      {pre:CHAIR,h:[44,29],n:[44,38],p:[52,62],a:[[[43,48],[42,58]],[[45,48],[44,58]]],l:[[[68,66],[82,77],[89,79]],[[67,68],[80,77],[87,79]]]},
      {pre:CHAIR,h:[45,43],n:[44,52],p:[52,72],a:[[[33,50],[42,58]],[[35,52],[44,58]]],l:[[[68,70],[82,77],[89,79]],[[67,72],[80,77],[87,79]]]}],
    bench:[
      {pre:BENCH,h:[14,57],n:[24,60],p:[52,60],a:[[[26,48],[27,36]],[[24,48],[25,36]]],l:[[[66,56],[68,77],[75,79]],[[64,57],[66,77],[73,79]]],eq:'<circle cx="27" cy="34" r="6" fill="'+EQ+'"/>'},
      {pre:BENCH,h:[14,57],n:[24,60],p:[52,60],a:[[[34,56],[27,50]],[[32,57],[25,50]]],l:[[[66,56],[68,77],[75,79]],[[64,57],[66,77],[73,79]]],eq:'<circle cx="27" cy="48" r="6" fill="'+EQ+'"/>'}],
    pushdown:[
      std({h:[44,12],n:[44,21],p:[44,46],a:[[[45,33],[57,32]],[[43,33],[55,32]]],l:[[[45,62],[44,77],[51,79]],[[43,62],[40,77],[47,79]]],
        eq:'<path d="M68-8L57 32" stroke="'+EQ+'" stroke-width="1.5"/><circle cx="68" cy="-8" r="3.5" fill="'+EQ+'"/><rect x="52" y="30" width="10" height="4" rx="2" fill="'+EQ+'"/>'}),
      std({h:[44,12],n:[44,21],p:[44,46],a:[[[45,33],[52,50]],[[43,33],[50,50]]],l:[[[45,62],[44,77],[51,79]],[[43,62],[40,77],[47,79]]],
        eq:'<path d="M68-8L52 50" stroke="'+EQ+'" stroke-width="1.5"/><circle cx="68" cy="-8" r="3.5" fill="'+EQ+'"/><rect x="47" y="48" width="10" height="4" rx="2" fill="'+EQ+'"/>'})],
    pullup:[
      {pre:PBAR,h:[50,16],n:[50,26],p:[50,50],a:[[[49,15],[50,4]],[[51,15],[50,4]]],l:[[[51,66],[44,77],[38,77]],[[50,66],[46,75],[40,75]]]},
      {pre:PBAR,h:[50,-1],n:[50,10],p:[50,34],a:[[[43,18],[50,4]],[[57,18],[50,4]]],l:[[[51,50],[44,62],[38,62]],[[50,50],[46,60],[40,60]]]}],
    rdl:[
      std({a:[[[51,33],[53,45]],[[49,33],[47,45]]],eq:rod(52,45)}),
      {h:[67,38],n:[59,41],p:[36,50],a:[[[59,53],[60,64]],[[57,53],[58,64]]],l:[[[48,62],[46,77],[53,79]],[[47,62],[43,77],[50,79]]],eq:rod(60,65)}],
    calf:[
      std({a:[[[51,33],[52,44]],[[49,33],[48,44]]]}),
      {h:[50,4],n:[50,13],p:[50,38],a:[[[51,25],[52,36]],[[49,25],[48,36]]],l:[[[51,54],[50,70],[57,79]],[[49,54],[46,70],[53,79]]]}],
    yoga:[
      std({a:[[[51,11],[50,-1]],[[49,11],[50,-1]]]}),
      {h:[77,59],n:[68,56],p:[50,38],a:[[[76,68],[84,78]],[[74,68],[82,78]]],l:[[[39,58],[28,77],[34,79]],[[41,58],[32,77],[38,79]]]}],
    stretch:[
      std({a:[[[51,11],[50,-1]],[[49,11],[50,-1]]]}),
      {h:[68,68],n:[60,60],p:[44,46],a:[[[60,70],[56,78]],[[58,70],[54,78]]],l:[[[45,62],[44,77],[51,79]],[[43,62],[40,77],[47,79]]]}],
    skip:[
      std({a:[[[44,33],[40,40]],[[56,33],[60,40]]],eq:'<path d="M40 40Q50 124 60 40" fill="none" stroke="'+EQ+'" stroke-width="2"/>'}),
      {h:[50,2],n:[50,11],p:[50,36],a:[[[44,23],[40,30]],[[56,23],[60,30]]],l:[[[51,52],[50,66],[57,68]],[[49,52],[46,66],[53,68]]],eq:'<path d="M40 30Q50 -44 60 30" fill="none" stroke="'+EQ+'" stroke-width="2"/>'}],
    /* ----- added ----- */
    jacks:[
      std({a:[[[52,33],[53,44]],[[48,33],[47,44]]]}),
      {h:[50,8],n:[50,17],p:[50,42],a:[[[54,8],[56,-3]],[[46,8],[44,-3]]],l:[[[60,57],[67,70],[74,72]],[[40,57],[33,70],[40,72]]]}],
    highknees:[
      {h:[51,12],n:[51,21],p:[50,46],a:[[[44,33],[52,27]],[[58,33],[60,42]]],l:[[[64,50],[62,64],[69,65]],[[49,62],[48,77],[55,79]]]},
      {h:[51,12],n:[51,21],p:[50,46],a:[[[58,33],[60,42]],[[44,33],[52,27]]],l:[[[49,62],[48,77],[55,79]],[[64,50],[62,64],[69,65]]]}],
    burpee:[
      std(),
      BURP1,
      PLK,
      BURP1,
      {h:[50,2],n:[50,11],p:[50,36],a:[[[53,2],[53,-8]],[[47,2],[47,-8]]],l:[[[51,52],[50,66],[57,68]],[[49,52],[46,66],[53,68]]]}],
    wallsit:[
      {pre:WALL,h:[36,12],n:[35,22],p:[34,52],a:[[[37,36],[46,46]],[[36,36],[45,45]]],l:[[[54,52],[54,77],[61,79]],[[52,53],[52,77],[59,79]]]}],
    superman:[
      {h:[78,77],n:[67,77],p:[42,77],a:[[[78,78],[91,78]],[[77,78],[90,78]]],l:[[[28,78],[14,78],[8,79]],[[28,78],[14,78],[8,79]]]},
      {h:[80,68],n:[68,73],p:[42,76],a:[[[79,69],[92,62]],[[78,70],[91,63]]],l:[[[28,73],[14,68],[8,65]],[[28,74],[14,69],[8,66]]]}],
    crunch:[
      {h:[15,76],n:[24,77],p:[50,77],a:[[[22,70],[14,72]],[[20,70],[12,72]]],l:[[[62,64],[74,78],[81,79]],[[60,65],[72,78],[79,79]]]},
      {h:[27,57],n:[33,65],p:[50,77],a:[[[26,60],[20,58]],[[24,60],[18,58]]],l:[[[62,64],[74,78],[81,79]],[[60,65],[72,78],[79,79]]]}],
    stepup:[
      {pre:BOX,h:[50,12],n:[50,21],p:[48,46],a:[[[46,33],[44,42]],[[52,33],[54,42]]],l:[[[60,54],[58,64],[65,65]],[[47,62],[46,77],[53,79]]]},
      {pre:BOX,h:[60,-2],n:[60,7],p:[60,32],a:[[[56,19],[54,28]],[[62,19],[64,28]]],l:[[[62,48],[60,64],[67,66]],[[68,44],[66,56],[72,57]]]}],
    birddog:[
      {h:[72,52],n:[62,55],p:[36,56],a:[[[62,67],[63,78]],[[60,67],[61,78]]],l:[[[38,70],[24,77],[18,78]],[[36,71],[22,77],[16,78]]]},
      {h:[72,52],n:[62,55],p:[36,56],a:[[[74,55],[88,54]],[[60,67],[61,78]]],l:[[[38,70],[24,77],[18,78]],[[22,57],[9,57],[3,58]]]}],
    latpull:[
      {pre:SEAT+CABLE,h:[43,27],n:[42,37],p:[40,64],a:[[[48,22],[54,6]],[[47,22],[53,6]]],l:[[[58,64],[60,79],[67,80]],[[56,65],[58,79],[65,80]]],eq:rod(54,5)+'<path d="M54 -12V2" stroke="'+EQ+'" stroke-width="1.5"/>'},
      {pre:SEAT+CABLE,h:[43,27],n:[42,37],p:[40,64],a:[[[38,46],[53,38]],[[37,47],[52,39]]],l:[[[58,64],[60,79],[67,80]],[[56,65],[58,79],[65,80]]],eq:rod(53,37)+'<path d="M54 -12L53 34" stroke="'+EQ+'" stroke-width="1.5"/>'}],
    frontraise:[
      std({a:[[[51,33],[53,45]],[[49,33],[47,45]]],eq:db(53,47)}),
      std({a:[[[61,24],[73,22]],[[59,25],[71,23]]],eq:db(73,22)})],
    cablerow:[
      {pre:CABLE+'<rect x="20" y="70" width="40" height="5" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/>',h:[37,28],n:[37,38],p:[34,66],a:[[[52,44],[64,52]],[[51,45],[63,53]]],l:[[[54,62],[70,66],[76,63]],[[54,63],[70,67],[76,64]]],eq:'<rect x="62" y="48" width="4" height="9" rx="2" fill="'+EQ+'"/><path d="M66 52H86" stroke="'+EQ+'" stroke-width="1.5"/>'},
      {pre:CABLE+'<rect x="20" y="70" width="40" height="5" rx="2" fill="#E3E9F2" stroke="#B8C4D4"/>',h:[35,28],n:[35,38],p:[34,66],a:[[[26,52],[44,54]],[[25,53],[43,55]]],l:[[[54,62],[70,66],[76,63]],[[54,63],[70,67],[76,64]]],eq:'<rect x="42" y="50" width="4" height="9" rx="2" fill="'+EQ+'"/><path d="M46 54H86" stroke="'+EQ+'" stroke-width="1.5"/>'}],
    cycle:CYCP,
    deadlift:[
      {h:[64,42],n:[56,46],p:[36,58],a:[[[57,60],[58,72]],[[55,60],[56,72]]],l:[[[52,64],[46,77],[53,79]],[[50,65],[44,77],[51,79]]],eq:plate(58,73)},
      std({a:[[[51,33],[53,45]],[[49,33],[47,45]]],eq:plate(53,48)})],
    hangraise:[
      {pre:PBAR,h:[50,16],n:[50,26],p:[50,50],a:[[[49,15],[50,4]],[[51,15],[50,4]]],l:[[[50,66],[50,80],[57,81]],[[49,66],[49,80],[56,81]]]},
      {pre:PBAR,h:[46,16],n:[47,26],p:[48,50],a:[[[47,15],[50,4]],[[49,15],[50,4]]],l:[[[64,52],[80,52],[85,52]],[[64,53],[80,53],[85,53]]]}],
    kbswing:[
      {h:[62,34],n:[56,40],p:[38,52],a:[[[58,52],[56,62]],[[56,53],[54,63]]],l:[[[50,62],[46,77],[53,79]],[[48,63],[44,77],[51,79]]],eq:kb(55,64)},
      std({a:[[[62,26],[74,26]],[[60,27],[72,27]]],eq:kb(75,27)})],
    goblet:[
      std({a:[[[52,32],[55,29]],[[50,32],[54,30]]],eq:dbv(56,29)}),
      {h:[61,32],n:[56,40],p:[44,60],a:[[[60,48],[64,40]],[[58,49],[63,41]]],l:[[[60,64],[52,77],[59,79]],[[58,64],[48,77],[55,79]]],eq:dbv(66,39)}],
    invrow:[
      {pre:TABLE,h:[22,68],n:[30,66],p:[54,71],a:[[[34,56],[36,46]],[[32,56],[34,46]]],l:[[[66,75],[76,78],[82,79]],[[66,76],[76,79],[82,80]]]},
      {pre:TABLE,h:[26,55],n:[33,56],p:[54,66],a:[[[40,57],[37,46]],[[38,58],[35,46]]],l:[[[66,73],[76,78],[82,79]],[[66,74],[76,79],[82,80]]]}]
  };
  /* stills for a card: every pose when there are two, otherwise first and middle */
  function stillIdx(id){var n=PL[EXS[id].fig].length; return n<=2 ? (n===1?[0]:[0,1]) : [0,Math.floor(n/2)]}
  var FIGC = {};
  function figs(id,g){
    var key = id+'|'+g;
    if(!FIGC[key]) FIGC[key] = stillIdx(id).map(function(i){return frame(PL[EXS[id].fig][i],g)});
    return FIGC[key];
  }
  function gOf(){return (S && S.gender==='female') ? 'f' : 'm'}
  /* Real exercise photos: [start, top] */
  var EPH = {"m": {"assistedpullupmachine": ["assets/img/e82679cb6f4e.webp", "assets/img/356ba0079a22.webp"], "bandassistedpullup": ["assets/img/65bfdc2d6883.webp", "assets/img/932bd012adea.webp"], "weightedpullups": ["assets/img/9c6d25c052f7.webp", "assets/img/4972800da209.webp"], "vbarpullup": ["assets/img/d7420ab2c96a.webp", "assets/img/befb769bd040.webp"], "onearmchinup": ["assets/img/25014e4736d3.webp", "assets/img/d3cb77af044d.webp"], "inclinepushup": ["assets/img/8398d1080f2d.webp", "assets/img/8425dfce5f60.webp"], "kneepushup": ["assets/img/586c09959ca9.webp", "assets/img/3d040c9224d3.webp"], "pushup": ["assets/img/83a3f3b3ed03.webp", "assets/img/b220d32f86ad.webp"], "declinepushup": ["assets/img/1eacd760ccd1.webp", "assets/img/78d4b9807a2f.webp"], "resistancebandchestpress": ["assets/img/2e2f9a17c4e8.webp", "assets/img/1bc61a4859d3.webp"], "svendpress": ["assets/img/c2f4d271cb48.webp", "assets/img/f41b78202918.webp"], "bench": ["assets/img/398fea5a0f06.webp", "assets/img/e2953b99c135.webp"], "machinechestpress": ["assets/img/dbc9ba6b25a4.webp", "assets/img/a56c0460de85.webp"], "pecdeckfly": ["assets/img/145c96d3307a.webp", "assets/img/9b1d8190fefa.webp"], "dumbbellfloorpress": ["assets/img/bdf7cae00ae4.webp", "assets/img/7a029414c84b.webp"], "resistancebandchestfly": ["assets/img/3b290121f8c0.webp", "assets/img/95f98dca47a2.webp"], "bentkneeinvertedrow": ["assets/img/4e463236cdf1.webp", "assets/img/7fade7cc445f.webp"], "invrow": ["assets/img/41fbb7234b17.webp", "assets/img/1357e62ca2c8.webp"], "superman": ["assets/img/d1fb0cde62a7.webp", "assets/img/6fc6436a3e1b.webp"], "bandpullapart": ["assets/img/08dadf1bb712.webp", "assets/img/ec2fd514c269.webp"], "chestsupporteddumbbellrow": ["assets/img/29466a18ac28.webp", "assets/img/e1da4182deef.webp"], "dumbbellreversefly": ["assets/img/deb5616fadf1.webp", "assets/img/8d1060cb996b.webp"], "row": ["assets/img/a1db7706c943.webp", "assets/img/8a198423062a.webp"], "resistancebandpulldown": ["assets/img/7f8ed1c6e5f3.webp", "assets/img/342c5a1ef0ac.webp"], "closegriplatpulldown": ["assets/img/2b70b981e496.webp", "assets/img/ed4d59ce2fbd.webp"], "latpull": ["assets/img/ff0199d76b32.webp", "assets/img/40ce555ccf14.webp"], "reversegriplatpulldown": ["assets/img/8cae20f80913.webp", "assets/img/55bca55789e4.webp"], "cablerow": ["assets/img/9cf53f858e7b.webp", "assets/img/af58744eb384.webp"], "seatedmachinerow": ["assets/img/28559b05d296.webp", "assets/img/85f592290dd6.webp"], "widegripcablerow": ["assets/img/5e24fa4a26ca.webp", "assets/img/7abaaae38f6e.webp"], "widegriplatpulldown": ["assets/img/6647277c58e6.webp", "assets/img/2c44394f4877.webp"], "dumbbelllateralraise": ["assets/img/133480fcf2db.webp", "assets/img/c89856bc3680.webp"], "frontraise": ["assets/img/f36ecbd55bfb.webp", "assets/img/28b499c22f17.webp"], "resistancebandlateralraise": ["assets/img/db08d7871a0d.webp", "assets/img/1c47161278d0.webp"], "resistancebandoverheadpress": ["assets/img/924ead3090a9.webp", "assets/img/593bd214e214.webp"], "seateddumbbellshoulderpress": ["assets/img/4b9e873b8c9b.webp", "assets/img/8a57019a95a6.webp"], "ohpress": ["assets/img/6a3c545271ff.webp", "assets/img/e959ec6d134a.webp"], "cablefacepull": ["assets/img/04761cfdca7e.webp", "assets/img/f18dab6496cb.webp"], "machineshoulderpress": ["assets/img/09f930b80e22.webp", "assets/img/92b66fa7e91f.webp"], "reversepecdeck": ["assets/img/72e325c23c9e.webp", "assets/img/c2de347b92ff.webp"], "backpackcurl": ["assets/img/375da753a4cf.webp", "assets/img/5d67924c8716.webp"], "alternatingdumbbellcurl": ["assets/img/435556417122.webp", "assets/img/9e7134e45266.webp"], "curl": ["assets/img/ae5a93ae082e.webp", "assets/img/50f63e179ac6.webp"], "concentrationcurl": ["assets/img/fa6317eb0930.webp", "assets/img/636ba4bf91e8.webp"], "crossbodyhammercurl": ["assets/img/244eabc85a2d.webp", "assets/img/ca4a19fdd36c.webp"], "hammercurl": ["assets/img/4805ac535cf0.webp", "assets/img/7cc5478ddf48.webp"], "resistancebandcurl": ["assets/img/0db031daa180.webp", "assets/img/41e5a4e701c9.webp"], "reversecurl": ["assets/img/0b7800b975e2.webp", "assets/img/dc8e286b82b3.webp"], "cablecurl": ["assets/img/5a106e89b22f.webp", "assets/img/e01bd38996b9.webp"], "cableropehammercurl": ["assets/img/a8346c8eb70b.webp", "assets/img/1cb49e375989.webp"], "machinepreachercurl": ["assets/img/ede225d3ca6f.webp", "assets/img/07ba1f7c8b79.webp"], "benchdip": ["assets/img/e304b11c4b4c.webp", "assets/img/3127616574a8.webp"], "dips": ["assets/img/06866ef19fd5.webp", "assets/img/6f2c50387ab2.webp"], "tricepspushuponknees": ["assets/img/5a7038be8063.webp", "assets/img/c941feadff60.webp"], "dumbbellkickback": ["assets/img/89fbae94e2d0.webp", "assets/img/87a1f0f4975a.webp"], "overheaddumbbelltricepsextension": ["assets/img/7efec54392db.webp", "assets/img/664bb818a4ab.webp"], "resistancebandoverheadextension": ["assets/img/b068fbebc713.webp", "assets/img/348c5096012c.webp"], "resistancebandpushdown": ["assets/img/2cf4afcba277.webp", "assets/img/f3d310363de5.webp"], "assisteddipmachine": ["assets/img/ba8136332a7f.webp", "assets/img/c75db130c10d.webp"], "cableropepushdown": ["assets/img/f6cb42c7580a.webp", "assets/img/2eafeac59b78.webp"], "straightbarpushdown": ["assets/img/be05a5533840.webp", "assets/img/f35add5e5811.webp"], "pushdown": ["assets/img/b579a4dc4786.webp", "assets/img/dc50e0fe68aa.webp"], "bicyclecrunch": ["assets/img/456969183dfd.webp", "assets/img/31f779ef16c6.webp"], "birddog": ["assets/img/85ac3213a9ad.webp", "assets/img/2ef8528a3d12.webp"], "legraise": ["assets/img/8a91359d9603.webp", "assets/img/0059c9c47d37.webp"], "climber": ["assets/img/15ea1686eeaa.webp", "assets/img/77ce221c9dbb.webp"], "plank": ["assets/img/c5b74dca1203.webp", "assets/img/49508b7ad0b0.webp"], "russiantwist": ["assets/img/6062a37ff514.webp", "assets/img/a75c643a69c3.webp"], "scissorkicks": ["assets/img/6e173848844f.webp", "assets/img/2a5443907088.webp"], "crunch": ["assets/img/5f92a26d1c18.webp", "assets/img/e5defa5bb160.webp"], "deadbug": ["assets/img/18a05a336575.webp", "assets/img/f0f8644c21fc.webp"], "flutterkicks": ["assets/img/a1142d15c17b.webp", "assets/img/db414467e5e0.webp"], "heeltap": ["assets/img/5f20d23a6a23.webp", "assets/img/fb696781672d.webp"], "longarmcrunch": ["assets/img/7ccebeae7281.webp", "assets/img/ff1c91b2ae85.webp"], "sideplank": ["assets/img/aa08fae0401d.webp", "assets/img/a30b2551af79.webp"], "toetouchcrunch": ["assets/img/dcc718821a0f.webp", "assets/img/cb0a6e1bede3.webp"], "dumbbellsidebend": ["assets/img/b2a5485b216d.webp", "assets/img/d35ce16e9104.webp"], "pallofpress": ["assets/img/09648a429db7.webp", "assets/img/a82b88244507.webp"], "captainschairkneeraise": ["assets/img/f76a5707c72e.webp", "assets/img/11729e1337a8.webp"], "machineabcrunch": ["assets/img/3d35c4847364.webp", "assets/img/7e5593661e1e.webp"], "clamshell": ["assets/img/a6a73fb24b11.webp", "assets/img/8a55e21659a9.webp"], "donkeykick": ["assets/img/029efba7810d.webp", "assets/img/709f7412b41f.webp"], "firehydrant": ["assets/img/d85bd274c4db.webp", "assets/img/94251b613582.webp"], "frogpump": ["assets/img/bc0f90911fa3.webp", "assets/img/d154620b1708.webp"], "bridge": ["assets/img/9beef982e27b.webp", "assets/img/5b9215fcd6d6.webp"], "hipthrustonasofa": ["assets/img/44c312832718.webp", "assets/img/b0899c672b72.webp"], "quadrupedleglift": ["assets/img/b55b773a89d6.webp", "assets/img/e512588b5e5e.webp"], "sidelyinglegraise": ["assets/img/2127e345a8ec.webp", "assets/img/098c32374f33.webp"], "sumosquat": ["assets/img/eded6c7c6cd2.webp", "assets/img/9ef4e36468bc.webp"], "bandedglutebridge": ["assets/img/4ffffc76c981.webp", "assets/img/fb61fd8ce59b.webp"], "bandedlateralwalk": ["assets/img/91fdfc3e0867.webp", "assets/img/9eaa620b33bd.webp"], "dumbbellsumosquat": ["assets/img/fc176f8d53fb.webp", "assets/img/2a2008de5c97.webp"], "cablepullthrough": ["assets/img/a87ddd279fdb.webp", "assets/img/e524fc48b06a.webp"], "glutekickbackmachine": ["assets/img/e34da9f9f79e.webp", "assets/img/e5de12487e9d.webp"], "hipabductionmachine": ["assets/img/2c94c36fafec.webp", "assets/img/04f737da3a27.webp"], "boxsquat": ["assets/img/847a7113826c.webp", "assets/img/a0f37828da74.webp"], "laterallunge": ["assets/img/a87c65a0ce81.webp", "assets/img/c33c212b0f35.webp"], "lateralstepup": ["assets/img/7614077941f7.webp", "assets/img/a58fb461c022.webp"], "lunge": ["assets/img/3bb1319fc8bb.webp", "assets/img/3de6c4716814.webp"], "reverselunge": ["assets/img/6c529b7c6e85.webp", "assets/img/86777eaf827f.webp"], "splitsquat": ["assets/img/b587e15978e1.webp", "assets/img/5ad598fd8eb8.webp"], "squat": ["assets/img/34d7f6fc8822.webp", "assets/img/4d1b7552ab00.webp"], "stepup": ["assets/img/7e29cffd6cd5.webp", "assets/img/4632b9e6c6e1.webp"], "wallsit": ["assets/img/04cf3bfae4a0.webp", "assets/img/e71773b8334d.webp"], "goblet": ["assets/img/18cdb9eb014a.webp", "assets/img/0ff14067cae2.webp"], "legextensionmachine": ["assets/img/52d143c5dabe.webp", "assets/img/a4c5d31efc47.webp"], "legpress": ["assets/img/b24c6c9fecc5.webp", "assets/img/05f4819bc917.webp"], "goodmorning": ["assets/img/25ce082faff0.webp", "assets/img/794b798c3c83.webp"], "dumbbelldeadlift": ["assets/img/273535064875.webp", "assets/img/44259b4380e0.webp"], "rdl": ["assets/img/06c62deb33ae.webp", "assets/img/5a85b1494480.webp"], "lyinglegcurl": ["assets/img/31497c818d79.webp", "assets/img/050cadc888c1.webp"], "seatedlegcurl": ["assets/img/f7b02351846c.webp", "assets/img/a5fc96acf4e4.webp"], "calf": ["assets/img/e56563328d4b.webp", "assets/img/ff8a96f3c0e8.webp"], "calfraiseonastep": ["assets/img/6a56c2160719.webp", "assets/img/f6ba64699b20.webp"], "walk": ["assets/img/b167b28c91c5.webp", "assets/img/6ec710d57223.webp"], "buttkicks": ["assets/img/d2a4a32dac2a.webp", "assets/img/701651351f83.webp"], "dancecardio": ["assets/img/0a6483e45f7c.webp", "assets/img/42dc80f51b2b.webp"], "halfburpee": ["assets/img/b4306f53923c.webp", "assets/img/f4af3ae07a15.webp"], "highknees": ["assets/img/c7ab8f08dff2.webp", "assets/img/5aeb4eadec96.webp"], "tibialisraise": ["assets/img/c364eb6b7e59.webp", "assets/img/6023e153f50e.webp"], "dumbbellcalfraise": ["assets/img/fb00c86c9ed9.webp", "assets/img/a01f28937171.webp"], "seatedcalfraise": ["assets/img/da5febf567c7.webp", "assets/img/df213d8a4418.webp"], "legpresscalfraise": ["assets/img/affa9b3b025b.webp", "assets/img/356c39854dbb.webp"], "standingcalfraisemachine": ["assets/img/fb2a9a32725a.webp", "assets/img/338ffc94285b.webp"], "powerwalk": ["assets/img/d7a35c911c46.webp", "assets/img/16ee9359ce62.webp"], "shadowboxing": ["assets/img/908f36bcfea9.webp", "assets/img/948a58d25936.webp"], "skip": ["assets/img/f0fec41d40f0.webp", "assets/img/f25aa3f14214.webp"], "stairclimbingathome": ["assets/img/189d1fcf059e.webp", "assets/img/d09ce8135bd1.webp"], "ellipticaltrainer": ["assets/img/3d95210fdc99.webp", "assets/img/f9b8f3a4269c.webp"], "inclinetreadmillwalk": ["assets/img/fa3cca2a90cd.webp", "assets/img/e6ecb7b5ab36.webp"], "cycle": ["assets/img/eebb20e2bd84.webp", "assets/img/1f1d9c2ef3c9.webp"], "treadmillwalk": ["assets/img/2b53178b49bc.webp", "assets/img/dc6be40d4e22.webp"], "anklecircles": ["assets/img/65000f4fcc9d.webp", "assets/img/57428f5470c8.webp"], "butterflystretch": ["assets/img/2071a0899236.webp", "assets/img/a34b6c4d9b49.webp"], "calfstretch": ["assets/img/f930ee1cb55e.webp", "assets/img/d19dbfabb652.webp"], "catcow": ["assets/img/0be7fd729e5c.webp", "assets/img/d175557a287a.webp"], "childspose": ["assets/img/0831eea6ff9d.webp", "assets/img/0d845b08053f.webp"], "cobrapose": ["assets/img/cf0416259ff3.webp", "assets/img/114fec0f6535.webp"], "crossbodyshoulderstretch": ["assets/img/8045bd9f5d23.webp", "assets/img/26361578e111.webp"], "doorwaycheststretch": ["assets/img/1876d7aab753.webp", "assets/img/abc48947f850.webp"], "downwarddog": ["assets/img/92a093ab8cf2.webp", "assets/img/74c4a367ff4d.webp"], "figurefourstretch": ["assets/img/16fbf6cb61e7.webp", "assets/img/747817087bac.webp"], "hipcircles": ["assets/img/5332e3ffc91e.webp", "assets/img/bce4959ddbd3.webp"], "hipflexorstretch": ["assets/img/fb9b27ce30c8.webp", "assets/img/ef900e84d3de.webp"], "lyingspinaltwist": ["assets/img/025644e6ffc5.webp", "assets/img/7b27119d21de.webp"], "necksidestretch": ["assets/img/9c73bd5c3c64.webp", "assets/img/5169f7c9084c.webp"], "seatedforwardfold": ["assets/img/8478f6dca869.webp", "assets/img/9193e27a49c9.webp"], "standinghamstringstretch": ["assets/img/9122550187fb.webp", "assets/img/741ddd23bdee.webp"], "standingquadstretch": ["assets/img/fdf5ef6a8b93.webp", "assets/img/609af5b8fb21.webp"], "yoga": ["assets/img/22fff00735e7.webp", "assets/img/14abebab138f.webp"], "thoracicrotation": ["assets/img/31ed2558e342.webp", "assets/img/56f027f3eee8.webp"], "trianglepose": ["assets/img/a75f8df3346c.webp", "assets/img/c6c5689e6a2b.webp"], "tricepsstretch": ["assets/img/0889594aa954.webp", "assets/img/d5aa91b8a66f.webp"], "warriorii": ["assets/img/ba3352eddc8a.webp", "assets/img/50b4da2b83d6.webp"], "worldsgreateststretch": ["assets/img/b53a1d433fbb.webp", "assets/img/25cf7d8cea89.webp"], "foamrollerquads": ["assets/img/5efc91f4ec18.webp", "assets/img/57a290f98186.webp"], "hindupushup": ["assets/img/dd20a3b47e5f.webp", "assets/img/89c9124779cb.webp"], "staggeredhandpushup": ["assets/img/5cc120ccb096.webp", "assets/img/fcd18cdffa58.webp"], "widepushup": ["assets/img/dc65b3697ab4.webp", "assets/img/bec86053d843.webp"], "dumbbellbenchpress": ["assets/img/30da6e56a78d.webp", "assets/img/9652b506097c.webp"], "dumbbellfly": ["assets/img/432aa0c17fca.webp", "assets/img/3b2daed7f96b.webp"], "dumbbellpullover": ["assets/img/ac46f38dbe16.webp", "assets/img/e5c63a0867ac.webp"], "inclinedumbbellfly": ["assets/img/22db6f71027f.webp", "assets/img/bd64630f91d0.webp"], "inclinedumbbellpress": ["assets/img/dfed812f74f0.webp", "assets/img/ab6ad30d5316.webp"], "cablecrossover": ["assets/img/b22c5074b544.webp", "assets/img/7a790178040c.webp"], "lowtohighcablefly": ["assets/img/a707c08abd51.webp", "assets/img/1a1c8df7c945.webp"], "smithmachinebenchpress": ["assets/img/c670667eeef9.webp", "assets/img/ca67ae542e6f.webp"], "underhandinvertedrow": ["assets/img/ba2af6f58c04.webp", "assets/img/2bbf7ac5b5cd.webp"], "bentoverdumbbellrow": ["assets/img/a5fd2d0a9528.webp", "assets/img/e21f41b2fce8.webp"], "negativepullup": ["assets/img/5d47d6f7562d.webp", "assets/img/51808905fc54.webp"], "singlearmcablerow": ["assets/img/2f21bc2f1431.webp", "assets/img/c7908acca4c6.webp"], "straightarmpulldown": ["assets/img/420b7f8a6d4d.webp", "assets/img/14ff6bac13ff.webp"], "tbarrow": ["assets/img/a0054f6baa19.webp", "assets/img/8bc12380b3bc.webp"], "pikepushup": ["assets/img/095f3bf0d666.webp", "assets/img/91811793e943.webp"], "plankshouldertap": ["assets/img/39f5d205aedd.webp", "assets/img/fe2e02919451.webp"], "arnoldpress": ["assets/img/d588739c9f00.webp", "assets/img/604a5a66c0b7.webp"], "dumbbelluprightrow": ["assets/img/7a6e6bf3dfc4.webp", "assets/img/c1594257b10d.webp"], "kettlebelloverheadpress": ["assets/img/6ce6c1aa99c6.webp", "assets/img/ff3354398e99.webp"], "cablelateralraise": ["assets/img/23d0d36b4830.webp", "assets/img/41b48646db4c.webp"], "chinup": ["assets/img/6c42c197ab28.webp", "assets/img/aa5bb547449c.webp"], "landminepress": ["assets/img/56f47290c695.webp", "assets/img/f31866e79d5f.webp"], "smithmachineshoulderpress": ["assets/img/7b866d2f3fda.webp", "assets/img/b03ae856b166.webp"], "dragcurl": ["assets/img/3192f0801b6e.webp", "assets/img/6f7ae260e5fc.webp"], "dumbbellpreachercurl": ["assets/img/74ea55e15e6c.webp", "assets/img/e8134e27e388.webp"], "inclinedumbbellcurl": ["assets/img/36ca64760d8c.webp", "assets/img/f224f9d27844.webp"], "zottmancurl": ["assets/img/6450d3cbface.webp", "assets/img/db254fc8196f.webp"], "barbellcurl": ["assets/img/a4244691aab2.webp", "assets/img/5fa8c3dd9eb0.webp"], "ezbarcurl": ["assets/img/0cba9060ed8b.webp", "assets/img/f9b7666fca6f.webp"], "benchdipwithfeetraised": ["assets/img/9c4b6076debf.webp", "assets/img/e5de15538eae.webp"]}, "f": {}};
  function ephOf(id){ var g = fg(), o = g==='f' ? 'm' : 'f'; return (EPH[g]&&EPH[g][id]) || (EPH[o]&&EPH[o][id]) || null; }
  function exPics(id){ var P = ephOf(id); return P ? P.map(function(u,i){return '<img class="eph" src="'+u+'" alt="'+(i?'End position':'Start position')+'" loading="lazy" decoding="async">'}) : figs(id,fg()); }

