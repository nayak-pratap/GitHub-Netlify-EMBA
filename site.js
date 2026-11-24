(function(){
  var root=document.documentElement, header=document.getElementById('siteHeader');
  function $(s,c){ return (c||document).querySelector(s); }
  function $$(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }

  /* Theme: follows the system until the reader chooses */
  var themeBtn=$('#themeToggle');
  function current(){ return root.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'); }
  function label(){ if(themeBtn){ var n=current()==='dark'?'light':'dark'; themeBtn.setAttribute('aria-label','Switch to '+n+' theme'); themeBtn.title='Switch to '+n+' theme'; } }
  if(themeBtn){ themeBtn.addEventListener('click',function(){ var n=current()==='dark'?'light':'dark'; root.setAttribute('data-theme',n); try{ localStorage.setItem('emba-theme',n); }catch(e){} label(); }); label(); }

  /* Mobile menu */
  var menuBtn=$('#menuToggle'), nav=$('.top-nav');
  if(menuBtn&&nav){
    menuBtn.addEventListener('click',function(){ var o=nav.classList.toggle('is-open'); menuBtn.setAttribute('aria-expanded',o); });
    nav.addEventListener('click',function(e){ if(e.target.closest('a')){ nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded','false'); } });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&nav.classList.contains('is-open')){ nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded','false'); menuBtn.focus(); } });
  }

  /* Header shadow, reading progress, back to top */
  var bar=$('.progress'), top=$('.to-top'), ticking=false;
  function onScroll(){
    var y=window.scrollY, h=document.documentElement.scrollHeight-window.innerHeight;
    if(header) header.classList.toggle('is-scrolled', y>4);
    if(bar) bar.style.width=(h>0?Math.min(100,y/h*100):0)+'%';
    if(top) top.classList.toggle('is-visible', y>700);
    ticking=false;
  }
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(onScroll); } },{passive:true});
  onScroll();
  if(top) top.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });

  /* Active nav item */
  var links=$$('.top-nav a[href*="#"]'), isHome=document.body.classList.contains('page-home');
  function mark(hash){ links.forEach(function(a){ if(a.getAttribute('href').split('#')[1]===hash) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); }); }
  if(!isHome){ var p=location.pathname; mark(/\/(assignments|extras)\//.test(p)?'assignments':'log'); }
  else if('IntersectionObserver' in window){
    var ids=links.map(function(a){ return a.getAttribute('href').split('#')[1]; });
    var seen={};
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ seen[e.target.id]=e.isIntersecting; });
      var act=ids.filter(function(i){ return seen[i]; })[0]; mark(act||'');
    },{rootMargin:'-30% 0px -55% 0px'});
    ids.forEach(function(i){ var el=document.getElementById(i); if(el) io.observe(el); });
  }

  /* On this page: built from the headings already in the article */
  var toc=$('#toc');
  if(toc){
    var heads=$('.fw-block') ? $$('.content .fw-title') : $$('.session-body > .mini-h');
    if(heads.length>=3){
      var t=document.createElement('p'); t.className='toc-title'; t.textContent='On this page'; toc.appendChild(t);
      var map=[];
      heads.forEach(function(h,i){
        var target=h.closest('.fw-block')||h, text='';
        h.childNodes.forEach(function(n){ if(!(n.nodeType===1&&n.classList.contains('fw-no'))) text+=n.textContent; });
        if(!target.id) target.id='sec-'+(i+1);
        var a=document.createElement('a'); a.href='#'+target.id; a.textContent=text.trim(); toc.appendChild(a); map.push([target,a]);
      });
      var spy=function(){
        var act=map[0];
        map.forEach(function(m){ if(m[0].getBoundingClientRect().top<150) act=m; });
        map.forEach(function(m){ m[1].classList.toggle('is-active', m===act); });
      };
      window.addEventListener('scroll',spy,{passive:true}); spy();
    }
  }

  /* Journal filter on the home page */
  var list=$('#log .journal-list');
  if(list){
    var cards=$$('.journal-card',list);
    if(cards.length>=4){
      var box=document.createElement('div'); box.className='journal-tools';
      box.innerHTML='<label for="journalFilter">Find a session</label><input id="journalFilter" type="search" placeholder="Search by topic, case or date" autocomplete="off">';
      var empty=document.createElement('p'); empty.className='journal-empty'; empty.hidden=true; empty.setAttribute('role','status');
      empty.textContent='No sessions match. Clear the search to see them all.';
      list.parentNode.insertBefore(box,list); list.parentNode.insertBefore(empty,list.nextSibling);
      $('#journalFilter').addEventListener('input',function(){
        var q=this.value.trim().toLowerCase(), n=0;
        cards.forEach(function(c){ var ok=!q||c.textContent.toLowerCase().indexOf(q)>-1; c.hidden=!ok; if(ok) n++; });
        empty.hidden=n>0;
      });
    }
  }
})();
