/* ============ 漫画日本語塾 · App ============ */
(function(){
'use strict';

const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- 进度 ---------- */
const KEY='mangaJpProg_v1';
let prog={grammar:[],patterns:[],vocab:[],giseigo:[]};
try{prog=Object.assign(prog,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
function save(){localStorage.setItem(KEY,JSON.stringify(prog));}
const has=(k,id)=>prog[k].includes(id);
function toggle(k,id){
  const i=prog[k].indexOf(id);
  if(i>=0)prog[k].splice(i,1);else prog[k].push(id);
  save();refresh();syncPush();toast(i>=0?'已取消标记':'✓ 已掌握，进度已保存');
}

/* ---------- 进度同步（通过局域网服务器，PC⇄手机） ---------- */
function syncPush(){
  clearTimeout(syncPush._t);
  syncPush._t=setTimeout(()=>{
    try{
      fetch('api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(prog)})
        .catch(()=>{});
    }catch(e){}
  },400);
}
function syncPull(){
  try{
    fetch('api/progress').then(r=>r.json()).then(server=>{
      if(!server||typeof server!=='object')return;
      ['grammar','patterns','vocab','giseigo'].forEach(k=>{
        const set=new Set([...(Array.isArray(server[k])?server[k]:[]),...(prog[k]||[])]);
        prog[k]=[...set];
      });
      save();refresh();
    }).catch(()=>{});
  }catch(e){}
}

/* ---------- 统计 ---------- */
const vocabTotal=()=>VOCAB.reduce((n,c)=>n+c.words.length,0);
const giseigoTotal=()=>GISEIGO.reduce((n,c)=>n+c.items.length,0);
const TOTAL=GRAMMAR.length+PATTERNS.length+vocabTotal()+giseigoTotal();
function refresh(){
  const doneCount=prog.grammar.length+prog.patterns.length+prog.vocab.length+prog.giseigo.length;
  const pct=Math.round(doneCount/TOTAL*100);
  $('#overallFill').style.width=pct+'%';
  $('#overallText').textContent=pct+'%';
  $('#grammarCount').textContent=GRAMMAR.length+' 项 · '+prog.grammar.length+' ✓';
  $('#patternsCount').textContent=PATTERNS.length+' 条 · '+prog.patterns.length+' ✓';
  $('#contraCount').textContent=CONTRA.length+' 组';
  $('#vocabCount').textContent=vocabTotal()+' 词 · '+prog.vocab.length+' ✓';
  $('#giseigoCount').textContent=giseigoTotal()+' 词 · '+prog.giseigo.length+' ✓';
  const hs=$('#heroStats');
  if(hs)hs.innerHTML=
    '<div class="stat">语法 <b>'+GRAMMAR.length+'</b> 项</div>'+
    '<div class="stat">句式 <b>'+PATTERNS.length+'</b> 条</div>'+
    '<div class="stat">单词 <b>'+vocabTotal()+'</b> 词</div>'+
    '<div class="stat">拟声词 <b>'+giseigoTotal()+'</b> 词</div>'+
    '<div class="stat">整体掌握 <b>'+pct+'%</b></div>';
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1600);
}

/* ---------- 标签页 ---------- */
$$('#tabs button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('#tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showTab(btn.dataset.tab);
  });
});
function showTab(name){
  $$('.panel').forEach(p=>p.classList.remove('active'));
  $('#home').classList.toggle('active',name==='home');
  const el=$('#'+name);
  if(el)el.classList.add('active');
  if(name==='reading')renderReading();
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>{
  $$('#tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===b.dataset.goto));
  showTab(b.dataset.goto);
}));

/* ---------- 首页：路线 + 五十音 ---------- */
const ROADMAP=[
  {no:'第1周',t:'打地基',d:'五十音 → LV1 语法(助词/て形/た形/ない形/判断句) → 先过“人称・学校・动作”三类单词。',g:'目标：能看懂 4 格漫画里约 60% 的句子'},
  {no:'第2周',t:'读日常',d:'LV2 语法(ている/てしまう/授受/条件/んだ) + 缩约表 + 口语感叹词。',g:'目标：看懂日常系对话的大意'},
  {no:'第3周',t:'上强度',d:'LV3(终助词/角色语/关西腔) + 拟声拟态词 + 副词接续。',g:'目标：少年漫战斗、吐槽、热血台词无压力'},
  {no:'第4周',t:'实战',d:'精读 12 段“实战阅读” → 做 30 题测验 → 开始啃第一部生肉。',g:'目标：脱离“每个词都查”的状态'}
];
$('#roadmap').innerHTML=ROADMAP.map(s=>
  '<div class="stage"><span class="stage-no">'+s.no+'</span><h4>'+s.t+'</h4><p>'+s.d+'</p><span class="goal">🎯 '+s.goal+'</span></div>'
).join('');

const HIRA=[
  [['a','あ'],['i','い'],['u','う'],['e','え'],['o','お']],
  [['ka','か'],['ki','き'],['ku','く'],['ke','け'],['ko','こ']],
  [['sa','さ'],['shi','し'],['su','す'],['se','せ'],['so','そ']],
  [['ta','た'],['chi','ち'],['tsu','つ'],['te','て'],['to','と']],
  [['na','な'],['ni','に'],['nu','ぬ'],['ne','ね'],['no','の']],
  [['ha','は'],['hi','ひ'],['fu','ふ'],['he','へ'],['ho','ほ']],
  [['ma','ま'],['mi','み'],['mu','む'],['me','め'],['mo','も']],
  [['ya','や'],['',''],['yu','ゆ'],['',''],['yo','よ']],
  [['ra','ら'],['ri','り'],['ru','る'],['re','れ'],['ro','ろ']],
  [['wa','わ'],['',''],['',''],['',''],['wo','を']],
  [['n','ん']]
];
const KATA=[
  [['a','ア'],['i','イ'],['u','ウ'],['e','エ'],['o','オ']],
  [['ka','カ'],['ki','キ'],['ku','ク'],['ke','ケ'],['ko','コ']],
  [['sa','サ'],['shi','シ'],['su','ス'],['se','セ'],['so','ソ']],
  [['ta','タ'],['chi','チ'],['tsu','ツ'],['te','テ'],['to','ト']],
  [['na','ナ'],['ni','ニ'],['nu','ヌ'],['ne','ネ'],['no','ノ']],
  [['ha','ハ'],['hi','ヒ'],['fu','フ'],['he','ヘ'],['ho','ホ']],
  [['ma','マ'],['mi','ミ'],['mu','ム'],['me','メ'],['mo','モ']],
  [['ya','ヤ'],['',''],['yu','ユ'],['',''],['yo','ヨ']],
  [['ra','ラ'],['ri','リ'],['ru','ル'],['re','レ'],['ro','ロ']],
  [['wa','ワ'],['',''],['',''],['',''],['wo','ヲ']],
  [['n','ン']]
];
function kanaTable(rows){
  return '<table>'+rows.map(r=>'<tr>'+r.map(c=>c[0]
    ?'<td><span class="k">'+c[1]+'</span><span class="r">'+c[0]+'</span></td>'
    :'<td></td>').join('')+'</tr>').join('')+'</table>';
}
$('#kanaHira').innerHTML=kanaTable(HIRA);
$('#kanaKata').innerHTML=kanaTable(KATA);

/* ---------- 语法 ---------- */
let gramFilter={lv:'all',cat:'all'};
const gramCats=['助词','动词・活用','接续・条件','授受・使役・被动','推测・样态','语气・终助词','惯用・复合','漫画特有・角色语','关西腔'];
function renderGrammarChips(){
  const lvs=[['all','全部'],['1','LV1 地基'],['2','LV2 高频'],['3','LV3 漫画特有']];
  const html=lvs.map(l=>'<button data-lv="'+l[0]+'" class="'+(gramFilter.lv===l[0]?'active':'')+'">'+l[1]+'</button>').join('')
    + gramCats.map(c=>'<button data-cat="'+c+'" class="'+(gramFilter.cat===c?'active':'')+'">'+c+'</button>').join('');
  $('#grammarChips').innerHTML=html;
  $$('#grammarChips button').forEach(b=>{
    b.addEventListener('click',()=>{
      if(b.dataset.lv)gramFilter.lv=b.dataset.lv;
      if(b.dataset.cat)gramFilter.cat=b.dataset.cat;
      renderGrammarChips();renderGrammar();
    });
  });
}
function renderGrammar(){
  const list=GRAMMAR.filter(g=>
    (gramFilter.lv==='all'||String(g.lv)===gramFilter.lv)&&
    (gramFilter.cat==='all'||g.cat===gramFilter.cat)
  );
  $('#grammarList').innerHTML=list.map(g=>{
    const done=has('grammar',g.id);
    return '<article class="card'+(done?' done':'')+'" id="gram-'+g.id+'">'+
      '<div class="g-head"><span class="g-pattern">'+esc(g.p)+'</span>'+
      '<span class="lv-tag lv'+g.lv+'">LV'+g.lv+'</span><span class="cat-tag">'+g.cat+'</span>'+
      '<button class="done-btn" data-kind="grammar" data-id="'+g.id+'">'+(done?'✓':'✓')+'</button></div>'+
      '<div class="g-meaning">'+esc(g.m)+'</div>'+
      '<div class="bubble">'+esc(g.ex)+'</div>'+
      '<div class="g-exzh">→ '+esc(g.exZh)+'</div>'+
      (g.note?'<div class="g-note">💡 '+esc(g.note)+'</div>':'')+
    '</article>';
  }).join('')||'<p class="hint">没有符合筛选条件的语法。</p>';
}

/* ---------- 句式 ---------- */
function renderPatterns(){
  $('#patternsList').innerHTML=PATTERNS.map((p,i)=>{
    const id='p'+i;
    const done=has('patterns',id);
    return '<article class="card p-card'+(done?' done':'')+'">'+
      '<div class="g-head"><span class="g-pattern">'+esc(p.p)+'</span>'+
      '<button class="done-btn" data-kind="patterns" data-id="'+id+'">✓</button></div>'+
      '<div class="g-meaning">'+esc(p.m)+'</div>'+
      '<div class="bubble">'+esc(p.ex)+'</div>'+
      '<div class="g-exzh">→ '+esc(p.exZh)+'</div>'+
    '</article>';
  }).join('');
}

/* ---------- 缩约 ---------- */
function renderContra(){
  $('#contraList').innerHTML=CONTRA.map(c=>
    '<div class="contra-card"><div class="contra-pair"><span>'+esc(c.casual)+'</span>'+
    '<span class="arrow">←</span><span class="formal">'+esc(c.formal)+'</span></div>'+
    '<div class="contra-m">'+esc(c.m)+'</div>'+
    '<div class="contra-ex">'+esc(c.ex)+'　→　'+esc(c.exZh)+'</div></div>'
  ).join('');
}

/* ---------- 单词 ---------- */
let vocabCat='all';
function renderVocabChips(){
  const html='<button data-cat="all" class="'+(vocabCat==='all'?'active':'')+'">全部</button>'+
    VOCAB.map(c=>'<button data-cat="'+c.cat+'" class="'+(vocabCat===c.cat?'active':'')+'">'+c.cat+'</button>').join('');
  $('#vocabChips').innerHTML=html;
  $$('#vocabChips button').forEach(b=>b.addEventListener('click',()=>{vocabCat=b.dataset.cat;renderVocabChips();renderVocab();}));
}
function renderVocab(){
  const cats=vocabCat==='all'?VOCAB:VOCAB.filter(c=>c.cat===vocabCat);
  $('#vocabGrid').innerHTML=cats.map(c=>{
    const catId='v-'+c.cat;
    const catDone=prog.vocab.filter(id=>id.startsWith(catId+':')).length;
    const cards=c.words.map(w=>{
      const id=catId+':'+w[0];
      const done=has('vocab',id);
      return '<div class="word-card'+(done?' done':'')+'">'+
        '<div class="w-ja">'+esc(w[0])+'</div><div class="w-ka">'+esc(w[1])+'</div><div class="w-zh">'+esc(w[2])+'</div>'+
        '<button class="done-btn" data-kind="vocab" data-id="'+id+'">✓</button></div>';
    }).join('');
    return '<div class="vocab-cat"><h3 class="section-title" style="margin-top:8px">'+c.cat+' <span class="count">'+catDone+'/'+c.words.length+'</span></h3><div class="word-grid">'+cards+'</div></div>';
  }).join('');
}

/* ---------- 拟声拟态 ---------- */
let giseigoCat='all';
function renderGiseigoChips(){
  const html='<button data-cat="all" class="'+(giseigoCat==='all'?'active':'')+'">全部</button>'+
    GISEIGO.map(c=>'<button data-cat="'+c.cat+'" class="'+(giseigoCat===c.cat?'active':'')+'">'+c.cat+'</button>').join('');
  $('#giseigoChips').innerHTML=html;
  $$('#giseigoChips button').forEach(b=>b.addEventListener('click',()=>{giseigoCat=b.dataset.cat;renderGiseigoChips();renderGiseigo();}));
}
function renderGiseigo(){
  const cats=giseigoCat==='all'?GISEIGO:GISEIGO.filter(c=>c.cat===giseigoCat);
  $('#giseigoGrid').innerHTML=cats.map(c=>{
    const catId='g-'+c.cat;
    const cards=c.items.map(w=>{
      const id=catId+':'+w[0];
      const done=has('giseigo',id);
      return '<div class="word-card'+(done?' done':'')+'">'+
        '<div class="w-ja">'+esc(w[0])+'</div><div class="w-zh">'+esc(w[1])+'</div>'+
        '<button class="done-btn" data-kind="giseigo" data-id="'+id+'">✓</button></div>';
    }).join('');
    return '<div class="vocab-cat"><h3 class="section-title" style="margin-top:8px">'+c.cat+'</h3><div class="word-grid">'+cards+'</div></div>';
  }).join('');
}

function bindDoneBtns(){
  // 事件委托：只绑定一次，避免重复渲染叠加监听器导致重复 toggle
  document.addEventListener('click',e=>{
    const b=e.target.closest('.done-btn');
    if(!b)return;
    e.stopPropagation();
    toggle(b.dataset.kind,b.dataset.id);
    const card=b.closest('.card,.word-card');
    if(card)card.classList.toggle('done');
  });
}

/* ---------- 实战阅读 ---------- */
function renderReading(){
  $('#readingList').innerHTML=READING.map((r,i)=>
    '<div class="reading-panel"><div class="rp-head"><span class="rp-num">'+(i+1)+'</span><span class="rp-tag">'+r.tag+'</span></div>'+
    '<div class="rp-body"><div class="rp-ja">'+r.parts.map(p=>'<span class="seg" title="'+esc(p[1]||p[0])+'">'+esc(p[0])+'</span>').join('')+'</div>'+
    '<div class="rp-tl">💬 '+esc(r.tl)+'</div>'+
    '<div class="rp-parts">'+r.parts.map(p=>'<div class="rp-part"><b>'+esc(p[0])+'</b>'+(p[1]?'<span class="r">'+esc(p[1])+'</span>':'')+'<span class="g">'+esc(p[2])+'</span></div>').join('')+'</div>'+
    '<div class="rp-points">'+r.points.map(pt=>'<span class="pt">'+esc(pt)+'</span>').join('')+'</div>'+
    '</div></div>'
  ).join('');
}

/* ---------- 测验 ---------- */
let quizOrder=[],quizIdx=0,quizScore=0,quizAnswered=false;
function startQuiz(){
  quizOrder=QUIZ.map((_,i)=>i).sort(()=>Math.random()-.5);
  quizIdx=0;quizScore=0;quizAnswered=false;
  renderQuizQ();
}
function renderQuizQ(){
  const box=$('#quizBox');
  if(quizIdx>=quizOrder.length){
    const pct=Math.round(quizScore/QUIZ.length*100);
    const v=pct>=90?'🏆 漫画语感已经很强了，可以开啃生肉！':pct>=70?'👍 不错，再扫一遍错题就稳了。':pct>=50?'🙂 及格线附近，建议重看“缩约”和“终助词”。':'📖 别灰心，语法→句式→拟声词再过一遍，重来一次。';
    box.innerHTML='<div class="quiz-result"><div class="score">'+quizScore+' / '+QUIZ.length+'</div><div class="verdict">'+v+'</div>'+
      '<button class="cta" id="quizRestart">再来一轮</button></div>';
    $('#quizRestart').addEventListener('click',startQuiz);
    return;
  }
  const q=QUIZ[quizOrder[quizIdx]];
  box.innerHTML='<div class="quiz-card">'+
    '<div class="quiz-progress">第 '+(quizIdx+1)+' / '+QUIZ.length+' 题 · 已对 '+quizScore+' 题</div>'+
    '<div class="quiz-q">'+esc(q.q)+'</div>'+
    '<div class="quiz-opts">'+q.opts.map((o,i)=>'<button class="quiz-opt" data-i="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(o)+'</button>').join('')+'</div>'+
    '<div class="quiz-exp hidden" id="quizExp"></div>'+
    '<div class="quiz-next hidden" id="quizNext"><button class="cta" id="quizNextBtn">下一题 →</button></div>'+
    '</div>';
  $$('.quiz-opt').forEach(b=>b.addEventListener('click',()=>{
    if(quizAnswered)return;
    quizAnswered=true;
    const pick=+b.dataset.i;
    const q2=QUIZ[quizOrder[quizIdx]];
    if(pick===q2.a)quizScore++;
    $$('.quiz-opt').forEach((x,i)=>{
      x.disabled=true;
      if(i===q2.a)x.classList.add('correct');
      else if(i===pick)x.classList.add('wrong');
    });
    $('#quizExp').textContent='💡 '+q2.exp;
    $('#quizExp').classList.remove('hidden');
    $('#quizNext').classList.remove('hidden');
    $('#quizNextBtn').addEventListener('click',()=>{quizIdx++;quizAnswered=false;renderQuizQ();});
  }));
}
$('#quizBox').innerHTML='<div class="quiz-start"><p class="hint" style="margin-bottom:16px">30 道题，混合助词 / 缩约 / 终助词 / 拟声词 / 词汇 / 授受 / 条件。</p><button class="cta" id="quizStart">开始测验 →</button></div>';
$('#quizStart').addEventListener('click',startQuiz);

/* ---------- 记忆卡片 ---------- */
let deck=[],deckIdx=0,deckSource='all',deckAgain=[],deckKnown=0,deckFlipped=false;
function buildDeck(src){
  deckSource=src;deckAgain=[];deckKnown=0;deckIdx=0;deckFlipped=false;
  deck=[];
  const push=(ja,ka,zh)=>{
    if(src==='all'||src==='vocab'||src==='giseigo')deck.push({ja,ka,zh,src:src==='giseigo'?'拟声':'单词'});
  };
  if(src!=='giseigo')VOCAB.forEach(c=>c.words.forEach(w=>push(w[0],w[1],w[2])));
  if(src!=='vocab')GISEIGO.forEach(c=>c.items.forEach(w=>push(w[0],'',w[1])));
  deck=deck.sort(()=>Math.random()-.5);
  renderFlash();
}
function renderFlash(){
  const box=$('#flashBox');
  box.innerHTML='<div class="flash-ctrl">'+
    '<span class="hint" style="margin-right:4px">词库：</span>'+
    '<button data-src="all" class="'+(deckSource==='all'?'active':'')+'">全部</button>'+
    '<button data-src="vocab" class="'+(deckSource==='vocab'?'active':'')+'">单词</button>'+
    '<button data-src="giseigo" class="'+(deckSource==='giseigo'?'active':'')+'">拟声词</button>'+
    '<button class="cta ghost" id="flashShuffle" style="margin-left:auto">重新洗牌</button></div>'+
    '<div id="flashStage"></div>';
  $$('.flash-ctrl [data-src]').forEach(b=>b.addEventListener('click',()=>buildDeck(b.dataset.src)));
  $('#flashShuffle').addEventListener('click',()=>buildDeck(deckSource));
  renderFlashStage();
}
function renderFlashStage(){
  const stage=$('#flashStage');
  if(!stage)return;
  if(deckIdx>=deck.length){
    if(deckAgain.length===0){
      stage.innerHTML='<div class="flash-done"><div style="font-size:40px">🎉</div><h3>全部记住了！</h3><p class="hint">共 '+deck.length+' 张卡片，'+(deckAgain.length===0?'无遗漏':'')+'。</p><div class="flash-btns" style="margin-top:16px"><button class="know" id="flashAgain">再来一轮</button></div></div>';
    }else{
      stage.innerHTML='<div class="flash-done"><h3>一轮结束</h3><p class="hint">有 '+deckAgain.length+' 张没记住，专门复习它们。</p><div class="flash-btns" style="margin-top:16px"><button class="know" id="flashAgain">复习没记住的</button><button class="again" id="flashReset">全部重来</button></div></div>';
    }
    const a=$('#flashAgain');if(a)a.addEventListener('click',()=>{deck=deckAgain.slice();deckAgain=[];deckIdx=0;deckKnown=0;deckFlipped=false;renderFlashStage();});
    const r=$('#flashReset');if(r)r.addEventListener('click',()=>buildDeck(deckSource));
    return;
  }
  const c=deck[deckIdx];
  stage.innerHTML='<div class="flash-counter">第 '+(deckIdx+1)+' / '+deck.length+' 张 · 已记住 '+deckKnown+' · 待复习 '+deckAgain.length+'</div>'+
    '<div class="flash-card" id="flashCard"><div class="flash-inner">'+
    '<div class="flash-face flash-front"><div class="f-ja">'+esc(c.ja)+'</div>'+(c.ka?'<div class="f-ka">'+esc(c.ka)+'</div>':'')+'<div class="hint" style="font-size:12px">'+c.src+' · 点击翻面</div></div>'+
    '<div class="flash-face flash-back"><div class="f-zh">'+esc(c.zh)+'</div></div>'+
    '</div></div>'+
    '<div class="flash-btns"><button class="again" id="fAgain">再学一次</button><button class="know" id="fKnow">记住了 ✓</button></div>';
  const card=$('#flashCard');
  card.addEventListener('click',()=>{deckFlipped=!deckFlipped;card.classList.toggle('flipped',deckFlipped);});
  $('#fAgain').addEventListener('click',e=>{e.stopPropagation();deckAgain.push(c);deckIdx++;deckFlipped=false;renderFlashStage();});
  $('#fKnow').addEventListener('click',e=>{e.stopPropagation();deckKnown++;deckIdx++;deckFlipped=false;renderFlashStage();});
}

/* ---------- 搜索 ---------- */
function searchLocal(q){
  q=q.trim().toLowerCase();
  const hits=[];
  GRAMMAR.forEach(g=>{
    const hay=(g.p+' '+g.m+' '+g.ex+' '+(g.note||'')).toLowerCase();
    if(hay.includes(q))hits.push({tag:'语法',cls:'ja',jp:g.p,zh:g.m.slice(0,40),go:'grammar',key:'gram-'+g.id});
  });
  PATTERNS.forEach((p,i)=>{
    if((p.p+' '+p.m).toLowerCase().includes(q))hits.push({tag:'句式',cls:'ja',jp:p.p,zh:p.m.slice(0,40),go:'patterns',key:'p'});
  });
  CONTRA.forEach(c=>{
    if((c.casual+' '+c.formal+' '+c.m).toLowerCase().includes(q))hits.push({tag:'缩约',cls:'ja',jp:c.casual,zh:c.formal+'：'+c.m.slice(0,30),go:'contra',key:''});
  });
  VOCAB.forEach(cat=>cat.words.forEach(w=>{
    if((w[0]+' '+w[1]+' '+w[2]).toLowerCase().includes(q))hits.push({tag:'单词',cls:'vo',jp:w[0],zh:w[1]+' '+w[2],go:'vocab',key:''});
  }));
  GISEIGO.forEach(cat=>cat.items.forEach(w=>{
    if((w[0]+' '+w[1]).toLowerCase().includes(q))hits.push({tag:'拟声',cls:'gi',jp:w[0],zh:w[1],go:'giseigo',key:''});
  }));
  return hits;
}
function srItemHtml(h){
  return '<div class="sr-item" data-go="'+h.go+'" data-key="'+h.key+'"><span class="sr-tag '+h.cls+'">'+h.tag+'</span><span class="sr-jp">'+esc(h.jp)+'</span><span>'+esc(h.zh)+'</span></div>';
}
function bindSrHits(container){
  $$(container+' .sr-item[data-go]').forEach(el=>el.addEventListener('click',()=>{
    const go=el.dataset.go,key=el.dataset.key;
    $$('#tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===go));
    showTab(go);
    $('#searchResults').classList.add('hidden');
    $('#searchInput').value='';
    if(key){
      const target=document.getElementById(key);
      if(target){target.scrollIntoView({behavior:'smooth',block:'center'});target.style.outline='3px solid var(--yellow)';setTimeout(()=>target.style.outline='',2000);}
    }
  }));
}
function doSearch(q,online){
  q=q.trim().toLowerCase();
  const box=$('#searchResults');
  if(!q){box.classList.add('hidden');box.innerHTML='';return;}
  const hits=searchLocal(q);
  const shown=hits.slice(0,40);
  const isJp=/[\u3040-\u30ff\u4e00-\u9fff]/.test(q);
  box.innerHTML=(shown.length
    ? shown.map(srItemHtml).join('')
    : '<div class="sr-item">没有找到「'+esc(q)+'」，换个词试试（支持日语/中文）。</div>')
    + (online&&isJp?'<div class="sr-online">🌐 在线读音・释义（内置汉字表 / Jisho）</div><div id="srOnline"></div>':'');
  box.classList.remove('hidden');
  bindSrHits('#searchResults');
  const so=$('#srOnline');
  if(so)renderOnline(q,so);
}
$('#searchBtn').addEventListener('click',()=>doSearch($('#searchInput').value,true));
$('#searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch(e.target.value,true);});
$('#searchInput').addEventListener('input',e=>doSearch(e.target.value,false));

/* ---------- 在线读音・释义（内置汉字表 + Jisho） ---------- */
async function fetchJisho(q){
  const api='https://jisho.org/api/v1/search/words?keyword='+encodeURIComponent(q);
  const tryFetch=async u=>{
    const ctl=new AbortController();
    const t=setTimeout(()=>ctl.abort(),7000);
    try{
      const r=await fetch(u,{signal:ctl.signal,headers:{Accept:'application/json'}});
      if(!r.ok)return null;
      const txt=await r.text();
      if(txt.trim().charAt(0)==='{')return JSON.parse(txt);
      return null;
    }catch(e){return null}finally{clearTimeout(t)}
  };
  const direct=await tryFetch(api);
  if(direct&&direct.data&&direct.data.length)return direct;
  const winner=await Promise.race([
    tryFetch('https://api.allorigins.win/raw?url='+encodeURIComponent(api)),
    tryFetch('https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(api))
  ]);
  return winner||null;
}
function jishoLink(q){
  return '<a class="lk-link" target="_blank" rel="noopener" href="https://jisho.org/search/'+encodeURIComponent(q)+'">打开 Jisho 网页版查「'+esc(q)+'」›</a>';
}
async function renderOnline(q,container){
  if(!container)return;
  const kanjiChars=[...new Set((q.match(/[\u4e00-\u9fff]/g)||[]))].slice(0,6);
  const known=[],unknown=[];
  kanjiChars.forEach(ch=>{
    const hit=KANJI.find(k=>k[0]===ch);
    if(hit)known.push(hit);else unknown.push(ch);
  });
  let out='';
  if(known.length){
    out+='<div class="lk-block"><h4>🔤 汉字读音（内置常用字表）</h4><div class="lk-kanji-grid">'+known.map(k=>
      '<div class="lk-kanji"><div class="lk-k">'+k[0]+'</div>'+
      '<div class="lk-read">音读：'+(k[1]==='—'?'—':k[1])+'<br>训读：'+(k[2]==='—'?'—':k[2])+'</div>'+
      '<div class="lk-m">'+k[3]+'</div></div>').join('')+'</div></div>';
  }
  if(unknown.length){
    out+='<div class="lk-none">「'+unknown.join('」「')+'」不在内置表里，看下面的在线词典。</div>';
  }
  out+='<div id="lkJisho"><span class="lk-none">📗 Jisho 词典查询中…</span></div>';
  container.innerHTML=out;
  const jishoBox=document.getElementById('lkJisho');
  const j=await fetchJisho(q);
  if(j&&j.data&&j.data.length){
    jishoBox.innerHTML='<div class="lk-block"><h4>📗 Jisho 词典（读音+释义）</h4>'+j.data.slice(0,3).map(e=>{
      const ja=(e.japanese&&e.japanese[0])||{};
      const s=(e.senses&&e.senses[0])||{};
      return '<div class="lk-jisho"><b>'+(ja.word||q)+'</b>'+(ja.reading?' <span class="r">['+ja.reading+']</span>':'')+
        '<div class="lk-pos">'+(s.parts_of_speech||[]).join('、')+'</div>'+
        '<div>'+(s.english_definitions||[]).slice(0,4).join('；')+'</div></div>';
    }).join('')+'</div>';
  }else{
    jishoBox.innerHTML='<div class="lk-none">在线词典暂时连不上，' + jishoLink(q) + '　手机也可装 MOJi辞書 App。</div>';
  }
}

/* ---------- 查词标签页 ---------- */
function doLookup(q){
  const box=$('#lkResult');
  q=q.trim();
  if(!q){box.innerHTML='';return;}
  const hits=searchLocal(q);
  let html='';
  if(hits.length){
    html+='<h3 class="lk-sec">📖 本地词库命中（'+hits.length+'）</h3>'+
      '<div style="background:#fff;border:2px solid var(--ink)">'+hits.slice(0,40).map(srItemHtml).join('')+'</div>';
  }else{
    html+='<h3 class="lk-sec">📖 本地词库</h3><div class="lk-none">本地词库未收录，看下面的在线结果。</div>';
  }
  html+='<h3 class="lk-sec">🌐 在线读音・释义（需联网）</h3><div id="lkOnline"></div>';
  box.innerHTML=html;
  bindSrHits('#lkResult');
  renderOnline(q,$('#lkOnline'));
}
$('#lkBtn').addEventListener('click',()=>doLookup($('#lkInput').value));
$('#lkInput').addEventListener('keydown',e=>{if(e.key==='Enter')doLookup(e.target.value);});
document.addEventListener('click',e=>{
  if(!e.target.closest('.searchbox')&&!e.target.closest('#searchResults'))$('#searchResults').classList.add('hidden');
});

/* ---------- init ---------- */
renderGrammarChips();renderGrammar();
renderPatterns();
renderContra();
renderVocabChips();renderVocab();
renderGiseigoChips();renderGiseigo();
renderReading();
refresh();
syncPull();
bindDoneBtns();
buildDeck('all');
// 切回标签页/隔段时间自动拉一次，PC⇄手机进度保持新鲜
window.addEventListener('focus',syncPull);
setInterval(syncPull,30000);
})();
