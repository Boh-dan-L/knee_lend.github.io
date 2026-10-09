/* FAQ accordion */
(() => {
  const root = document.querySelector('[data-faq]');
  if (!root) return;

  const closeItem = (item) => {
    const button = item.querySelector('.bs-faq__q');
    const panel = item.querySelector('.bs-faq__a');
    if (!button || !panel) return;

    button.setAttribute('aria-expanded', 'false');
    panel.style.height = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.height = '0px';
    });
  };

  const openItem = (item) => {
    const button = item.querySelector('.bs-faq__q');
    const panel = item.querySelector('.bs-faq__a');
    if (!button || !panel) return;

    button.setAttribute('aria-expanded', 'true');
    panel.style.height = `${panel.scrollHeight}px`;
  };

  root.querySelectorAll('.bs-faq__item').forEach((item) => {
    const panel = item.querySelector('.bs-faq__a');
    if (panel) panel.style.height = '0px';
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('.bs-faq__q');
    if (!button) return;

    const currentItem = button.closest('.bs-faq__item');
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    root.querySelectorAll('.bs-faq__item').forEach((item) => {
      if (item !== currentItem) closeItem(item);
    });

    if (isOpen) closeItem(currentItem);
    else openItem(currentItem);
  });

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      root.querySelectorAll('.bs-faq__item').forEach((item) => {
        const button = item.querySelector('.bs-faq__q');
        const panel = item.querySelector('.bs-faq__a');
        if (button?.getAttribute('aria-expanded') === 'true' && panel) {
          panel.style.height = `${panel.scrollHeight}px`;
        }
      });
    });
  });
})();

/* Smooth in-page navigation */
(() => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-scroll-to]');
    if (!link) return;

    const selector = link.getAttribute('data-scroll-to');
    if (!selector || !selector.startsWith('#')) return;

    const target = document.querySelector(selector);
    if (!target) return;

    event.preventDefault();

    const header = document.querySelector('.lp-header');
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const extraOffset = selector === '#pricing-pro' ? 24 : 12;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset;

    window.scrollTo({ top, behavior: 'smooth' });

    if (selector === '#pricing-pro') {
      target.classList.remove('lp-pricing-card--pulse');
      requestAnimationFrame(() => target.classList.add('lp-pricing-card--pulse'));
      window.setTimeout(() => target.classList.remove('lp-pricing-card--pulse'), 2400);
    }
  });
})();




/* V10: subtle one-time reveal for persuasion blocks */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const nodes = [...document.querySelectorAll('[data-reveal]')];
  if (!nodes.length || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('v10-reveal-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  nodes.forEach((node) => observer.observe(node));
})();

/* Details modal: keyboard, backdrop, focus restoration and scroll lock. */
(() => {
  const modal = document.getElementById('personal-modal');
  if (!modal) return;
  let trigger, oldOverflow;
  document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => {
    trigger = button; oldOverflow = document.body.style.overflow;
    modal.showModal(); document.body.style.overflow = 'hidden';
    modal.querySelector('[data-close-dialog]').focus();
  }));
  modal.querySelector('[data-close-dialog]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => { if (event.target === modal) { const r=modal.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) modal.close(); } });
  modal.addEventListener('close', () => { document.body.style.overflow=oldOverflow; trigger?.focus(); });
})();

/* Quiz V14 — персональні підказки, а не діагностика.
   Усі відповіді існують лише в пам'яті сторінки: без analytics, cookies, localStorage або запитів на сервер. */
(() => {
  const root = document.getElementById('knee-quiz');
  if (!root) return;

  const questions = [
    {
      id: 'symptoms', type: 'multi', max: 3,
      title: 'У яких ситуаціях ви відчуваєте дискомфорт?',
      subtitle: 'Можна обрати до 3 варіантів — симптоми іноді поєднуються.',
      options: [
        {id:'front', text:'Спереду або навколо колінної чашечки', detail:'Під час сходів, присідань чи вставання зі стільця'},
        {id:'tendon', text:'Нижче колінної чашечки', detail:'Під час бігу, стрибків чи силових вправ'},
        {id:'outer', text:'Із зовнішнього боку коліна', detail:'Під час бігу, ходьби чи тривалого навантаження'},
        {id:'stiff', text:'Скутість або біль під час ходьби', detail:'Особливо після відпочинку чи тривалої прогулянки'},
        {id:'load', text:'Біль або припухлість після активності', detail:'Після тренування, присідань чи активного дня'},
        {id:'after', text:'Повертаюся до руху після травми чи операції', detail:'Потрібно зрозуміти послідовність відновлення'},
        {id:'unclear', text:'Складно виділити одну ситуацію', detail:'Дискомфорт змінюється або має інший характер', exclusive:true}
      ]
    },
    {
      id:'diagnoses', type:'multi', max: 4,
      title:'Чи є у вас встановлений діагноз?',
      subtitle:'Оберіть усе, що вже підтверджено фахівцем або зазначено у висновку. Можна обрати кілька.',
      options:[
        {id:'oa', text:'Артроз колінного суглоба'},
        {id:'meniscus', text:'Ушкодження або зміни меніска'},
        {id:'pf', text:'Пателофеморальний больовий синдром'},
        {id:'pt', text:'Тендинопатія сухожилля надколінка'},
        {id:'itb', text:'Синдром клубово-великогомілкового тракту (ITB)'},
        {id:'acl', text:'Травма зв’язок або ПХЗ'},
        {id:'none', text:'Немає встановленого діагнозу або інший стан', exclusive:true}
      ]
    },
    {
      id:'tried', type:'single', title:'Що ви вже пробували?',
      subtitle:'Це допоможе підібрати акцент у рекомендації.',
      options:[
        {id:'care',text:'Медикаменти, ін’єкції або фізпроцедури'},
        {id:'internet',text:'Окремі вправи з YouTube чи соцмереж'},
        {id:'rest',text:'Відпочинок і тимчасове зменшення активності'},
        {id:'new',text:'Поки шукаю зрозумілу програму'}
      ]
    },
    {
      id:'safety', type:'single', title:'Чи є зараз щось із переліченого?',
      subtitle:'Це важливо, щоб не радити самостійний старт, коли потрібна оцінка фахівця.',
      options:[
        {id:'injury',text:'Свіжа травма, значний набряк, блокування або не можу спертися на ногу'},
        {id:'postop',text:'Після операції ще не дозволили навантажувати коліно'},
        {id:'urgent',text:'Коліно гаряче або червоне, є температура чи різке погіршення'},
        {id:'no',text:'Нічого з переліченого'},
        {id:'unsure',text:'Не впевнений / не впевнена'}
      ]
    },
    {
      id:'format', type:'single', title:'Який формат підтримки вам ближчий?',
      subtitle:'Повна програма доступна в обох варіантах.',
      options:[
        {id:'self',text:'Хочу займатися самостійно',detail:'Готові заняття, тести, бонуси та PDF'},
        {id:'personal',text:'Хочу персональний розбір із автором',detail:'Щоб уточнити старт і врахувати мою історію'},
        {id:'unsure',text:'Поки не визначився / не визначила',detail:'Підкажіть, який варіант розглянути'}
      ]
    }
  ];

  const bonusCatalog = {
    oa: {name:'Артроз колінного суглоба', description:'Додатковий розбір особливостей навантаження при артрозі.'},
    pf: {name:'Біль навколо колінної чашечки', description:'Пояснення щодо типових ситуацій із болем спереду коліна та особливостей вправ.'},
    pt: {name:'Сухожилля надколінка', description:'Матеріал про навантаження при проблемах сухожилля надколінка.'},
    itb: {name:'Зовнішня зона коліна', description:'Розбір болю із зовнішнього боку коліна, зокрема під час бігу.'},
    meniscus: {name:'Травми та зміни меніска', description:'Важливі особливості повернення до навантажень при проблемах меніска.'},
    acl: {name:'Відновлення після травм зв’язок', description:'Додаткові пояснення щодо етапності після травм зв’язок.'}
  };
  const diagnosisToBonus = {oa:'oa',meniscus:'meniscus',pf:'pf',pt:'pt',itb:'itb',acl:'acl'};
  const symptomToBonus = {front:'pf',tendon:'pt',outer:'itb'};
  const guidance = {
    front:'Під час сходів і присідань приділяйте увагу контрольованим рухам і поступовому розвитку сили.',
    tendon:'Після стрибків, бігу та силових вправ важливо дозувати навантаження і відстежувати реакцію коліна.',
    outer:'За дискомфорту із зовнішнього боку корисно поступово нарощувати навантаження, не орієнтуючись лише на відсутність болю під час заняття.',
    stiff:'Починайте з посильних вправ на рухливість і силу та поступово збільшуйте тривалість ходьби.',
    load:'Враховуйте реакцію коліна не лише під час заняття, а й після нього та наступного дня.',
    after:'Після травми або операції дотримуйтеся індивідуальних обмежень вашого лікаря чи фізичного терапевта.',
    unclear:'Почніть з оцінки переносимості простих рухів і не форсуйте прогресію за наявності незрозумілих симптомів.'
  };
  const triedGuidance = {
    care:'Полегшення симптомів після лікування не завжди означає готовність до колишнього навантаження.',
    internet:'Окремі вправи варто поєднати в послідовність із зрозумілим дозуванням і критеріями прогресії.',
    rest:'Після періоду відпочинку навантаження краще повертати поступово.',
    new:'Готова послідовність допоможе не витрачати час на самостійний пошук і компонування вправ.'
  };

  let step = -1;
  const answers = {};
  const sticky = document.querySelector('.lp-sticky-cta');
  if(sticky && 'IntersectionObserver' in window){
    new IntersectionObserver(([entry]) => {
      sticky.classList.toggle('is-hidden-for-quiz', entry.isIntersecting && step >= 0);
    }, {threshold:0}).observe(root);
  }
  function alignQuizTop(){
    // Довгі списки не повинні залишати наступний крок за межами екрана.
    const header = document.querySelector('.lp-header');
    const offset=(header?.getBoundingClientRect().height || 0)+18;
    const top=Math.max(0,root.getBoundingClientRect().top+window.scrollY-offset);
    window.scrollTo({top,behavior:'auto'});
    if(sticky && step>=0)sticky.classList.add('is-hidden-for-quiz');
  }
  const el = (tag,className,text) => {
    const node = document.createElement(tag);
    if(className) node.className=className;
    if(text !== undefined) node.textContent=text;
    return node;
  };
  const nodeButton = (label,className,handler) => {
    const node=el('button',className,label);node.type='button';node.addEventListener('click',handler);return node;
  };
  const selected=(id)=> answers[id] || [];
  const chosen=(id)=> selected(id)[0];
  const optionLabel = (qid,id) => questions.find(q=>q.id===qid)?.options.find(o=>o.id===id)?.text || '';
  const focusHeading=()=>root.querySelector('[data-quiz-title]')?.focus({preventScroll:true});
  function resetRoot(){root.replaceChildren();root.classList.remove('knee-quiz--intro');root.classList.remove('knee-quiz--result');}
  function start(){step=0;render();}
  function render(){
    if(step===questions.length){renderResult();return;}
    resetRoot();
    const q=questions[step];
    const top=el('div','kq-top');
    top.append(el('span','kq-overline','КРОК '+(step+1)+' ІЗ '+questions.length),el('span','kq-count',Math.round(100*(step+1)/questions.length)+'%'));
    root.append(top);
    const track=el('div','kq-progress');track.setAttribute('role','progressbar');track.setAttribute('aria-label','Прогрес тесту');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','5');track.setAttribute('aria-valuenow',String(step+1));
    const fill=el('div','kq-progress__fill');fill.style.width=((step+1)/questions.length*100)+'%';track.append(fill);root.append(track);
    const title=el('h3','kq-question',q.title);title.tabIndex=-1;title.dataset.quizTitle='true';root.append(title);
    root.append(el('p','kq-subtitle',q.subtitle));
    const options=el('div','kq-options');
    if(q.type==='multi')options.setAttribute('aria-label','Можна обрати декілька відповідей');
    q.options.forEach(opt=>{
      const active=selected(q.id).includes(opt.id);
      const btn=el('button','kq-option'+(active?' is-selected':''));btn.type='button';
      const mark=el('span','kq-option__mark');mark.setAttribute('aria-hidden','true');mark.textContent=active?'✓':'';
      const body=el('span','kq-option__body');body.append(el('span','kq-option__title',opt.text));if(opt.detail)body.append(el('span','kq-option__detail',opt.detail));
      btn.append(mark,body);
      if(q.type==='multi')btn.setAttribute('aria-pressed',String(active));
      btn.addEventListener('click',()=>{
        if(q.type==='single'){answers[q.id]=[opt.id];step++;render();return;}
        const current=[...selected(q.id)];
        if(active){answers[q.id]=current.filter(id=>id!==opt.id);}
        else if(opt.exclusive){answers[q.id]=[opt.id];}
        else {
          const nonExclusive=current.filter(id=>!q.options.find(o=>o.id===id)?.exclusive);
          if(nonExclusive.length>=q.max){
            const msg=root.querySelector('.kq-limit');if(msg){msg.textContent='Можна обрати не більше '+q.max+' варіантів.';msg.hidden=false;}return;
          }
          answers[q.id]=[...nonExclusive,opt.id];
        }
        // Оновлення без втрати фокуса на вибраному варіанті.
        options.querySelectorAll('.kq-option').forEach((b,i)=>{
          const picked=selected(q.id).includes(q.options[i].id);
          b.classList.toggle('is-selected',picked);b.setAttribute('aria-pressed',String(picked));b.querySelector('.kq-option__mark').textContent=picked?'✓':'';
        });
        const next=root.querySelector('.kq-next');if(next)next.disabled=selected(q.id).length===0;
        const msg=root.querySelector('.kq-limit');if(msg)msg.hidden=true;
      });
      options.append(btn);
    });
    root.append(options);
    const limit=el('p','kq-limit','');limit.hidden=true;limit.setAttribute('role','status');root.append(limit);
    const navigation=el('div','kq-nav');
    if(step>0)navigation.append(nodeButton('← Назад','kq-back',()=>{step--;render();}));
    if(q.type==='multi'){
      const next=nodeButton(step===questions.length-1?'Показати результат →':'Продовжити →','kq-next',()=>{if(!selected(q.id).length)return;step++;render();});
      next.disabled=selected(q.id).length===0;
      navigation.append(next);
    }else navigation.append(el('span','kq-tap-hint','Оберіть відповідь, щоб продовжити'));
    root.append(navigation);
    root.append(el('p','kq-privacy','Ваші відповіді не зберігаються та нікуди не передаються.'));
    focusHeading();alignQuizTop();
  }

  function card(parent,className,headingText){const wrap=el('section',className);if(headingText)wrap.append(el('h4','kq-result__section-title',headingText));parent.append(wrap);return wrap;}
  function bulletList(parent,items){const ul=el('ul','kq-result__bullet-list');items.forEach(text=>ul.append(el('li','',text)));parent.append(ul);}
  function renderResult(){
    resetRoot();root.classList.add('knee-quiz--result');
    const safe=chosen('safety')==='no';
    const sympt=selected('symptoms'), dx=selected('diagnoses').filter(v=>v!=='none');
    const hasAfter=sympt.includes('after')||dx.some(v=>v==='meniscus'||v==='acl');
    const pro=chosen('format')==='personal'||(chosen('format')==='unsure'&&hasAfter);
    const hero=el('header','kq-result__hero'+(!safe?' kq-result__hero--caution':''));
    hero.append(el('span','kq-result__eyebrow',safe?'ВАШ ПЕРСОНАЛЬНИЙ ОРІЄНТИР':'ВАЖЛИВО ПЕРЕД ПОЧАТКОМ'));
    const title=el('h3','kq-result__title',safe?(pro?'Варто розглянути курс із персональним розбором':'Вам може підійти готова програма занять'):'Спочатку уточніть безпечний рівень навантаження');title.tabIndex=-1;title.dataset.quizTitle='true';hero.append(title);
    hero.append(el('p','kq-result__lead',safe?'На основі ваших відповідей ми виділили важливі акценти, підібрали тематичні бонуси та формат занять.':'За вашою відповіддю самостійний старт зараз краще відкласти до оцінки фахівця. Це допоможе уникнути недоречного навантаження.'));
    root.append(hero);

    const summary=card(root,'kq-result__summary','Що ми врахували');
    const chips=el('div','kq-result__chips');
    sympt.forEach(id=>chips.append(el('span','kq-chip',optionLabel('symptoms',id))));
    dx.forEach(id=>chips.append(el('span','kq-chip kq-chip--diagnosis',optionLabel('diagnoses',id))));
    if(!dx.length)chips.append(el('span','kq-chip kq-chip--muted','Діагноз не зазначений'));
    summary.append(chips);

    if(safe){
      const grid=el('div','kq-result__grid');root.append(grid);
      const recommendations=card(grid,'kq-result__card','На що звернути увагу');
      const items=sympt.filter(v=>guidance[v]).slice(0,3).map(v=>guidance[v]);
      if(!items.length)items.push('Орієнтуйтеся на посильний старт і реакцію коліна після навантаження.');
      if(chosen('tried')&&triedGuidance[chosen('tried')])items.push(triedGuidance[chosen('tried')]);
      bulletList(recommendations,items);
      const path=card(grid,'kq-result__card','Як рухатися у програмі');
      const steps=el('ol','kq-result__steps');
      [
        ['01','Оберіть посильний старт','Почніть із відповідного етапу та дотримуйтеся дозування.'],
        ['02','Оцінюйте реакцію коліна','Слідкуйте за симптомами під час і після занять.'],
        ['03','Переходьте далі за критеріями','Використовуйте тести та не форсуйте складніші вправи.']
      ].forEach(([num,h,desc])=>{const li=el('li');li.append(el('span','kq-result__step-num',num));const content=el('span');content.append(el('strong','',h),el('small','',desc));li.append(content);steps.append(li);});path.append(steps);

      const mapped=[];
      const add=(id,origin)=>{if(!mapped.some(m=>m.id===id))mapped.push({id,origin});};
      dx.forEach(id=>{if(diagnosisToBonus[id])add(diagnosisToBonus[id],'За вказаним вами діагнозом');});
      sympt.forEach(id=>{if(symptomToBonus[id])add(symptomToBonus[id],'За описом симптомів');});
      const bonuses=card(root,'kq-result__bonus','Тематичні бонуси, на які варто звернути увагу');
      bonuses.append(el('p','kq-result__small-lead','Ці матеріали вже входять у вартість курсу. Вони доповнюють основну програму, а не замінюють її.'));
      if(mapped.length){
        const bonusList=el('div','kq-result__bonus-list');
        mapped.slice(0,6).forEach((item,i)=>{
          const b=el('article','kq-result__bonus-item');
          b.append(el('span','kq-result__bonus-number',String(i+1).padStart(2,'0')));
          const body=el('div');body.append(el('span','kq-result__bonus-source',item.origin),el('strong','',bonusCatalog[item.id].name),el('p','',bonusCatalog[item.id].description));b.append(body);bonusList.append(b);
        });
        bonuses.append(bonusList);
      }else{
        bonuses.append(el('p','kq-result__empty-bonus','За вашими відповідями не варто прив’язувати матеріал до конкретного діагнозу. Почніть з основної програми; у курсі також доступні 6 бонусних відео про поширені проблеми коліна.'));
      }
      const offer=card(root,'kq-result__offer');
      const meta=el('div','kq-result__offer-text');
      meta.append(el('span','kq-result__offer-kicker','ФОРМАТ, ЯКИЙ ВАРТО РОЗГЛЯНУТИ'));
      meta.append(el('h4','',pro?'Курс + індивідуальні рекомендації':'Готова програма для самостійних занять'));
      meta.append(el('p','',pro?'Повний курс і персональний розбір історії, документів та рухових тестів, рекомендації для старту й повторний зв’язок через 2 тижні.':'Повна програма вправ, тести для переходу між етапами, 6 тематичних бонусних відео та PDF-матеріали.'));
      offer.append(meta);
      const actions=el('div','kq-result__offer-actions');
      actions.append(el('strong','kq-result__price',pro?'1090 грн':'590 грн'));
      const primary=el('a','lp-button lp-button--primary kq-result__cta',pro?'Переглянути формат за 1090 грн →':'Переглянути курс за 590 грн →');
      primary.href=pro?'#pricing-pro':'#pricing';primary.dataset.scrollTo=primary.getAttribute('href');actions.append(primary);
      const alt=el('a','kq-result__alt-link',pro?'Або самостійний формат за 590 грн':'Або курс із персональним розбором');
      alt.href=pro?'#pricing':'#pricing-pro';alt.dataset.scrollTo=alt.getAttribute('href');actions.append(alt);offer.append(actions);
    }else{
      const caution=card(root,'kq-result__caution','Що робити зараз');
      const concern=chosen('safety');
      let cautionItems=[];
      if(concern==='urgent') cautionItems=['За почервоніння, вираженого тепла, температури чи різкого погіршення варто отримати невідкладну медичну оцінку.','До з’ясування причини не намагайтеся проходити комплекс через біль.'];
      else if(concern==='postop') cautionItems=['Уточніть у вашого хірурга або фізичного терапевта, які рухи й навантаження вже дозволені.','Після отримання дозволу можна обирати етап і формат занять.'];
      else if(concern==='injury') cautionItems=['Після свіжої травми, блокування коліна, значного набряку або неможливості спертися на ногу потрібна очна оцінка фахівця.','Поверніться до вибору програми, коли буде зрозуміло, яке навантаження дозволене.'];
      else cautionItems=['Якщо ви сумніваєтесь щодо дозволених навантажень, уточніть це в лікаря або фізичного терапевта.','Коли протипоказання з’ясовані, можна повернутися до вибору формату курсу.'];
      bulletList(caution,cautionItems);
    }
    const footer=el('footer','kq-result__footer');
    const disclaimer=el('p','kq-result__disclaimer','Це підказки для вибору формату й матеріалів курсу, а не встановлення діагнозу чи індивідуальний медичний висновок. Для точної діагностики зверніться до лікаря.');
    footer.append(disclaimer,nodeButton('↻ Пройти тест ще раз','kq-result__restart',()=>{Object.keys(answers).forEach(key=>delete answers[key]);start();}));
    root.append(footer);focusHeading();alignQuizTop();
  }
  const intro=document.getElementById('quiz-start');
  if(intro)intro.addEventListener('click',start);
})();
