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

/* Quiz answers stay only in memory; never send them to analytics or payment. */
(() => {
  const root=document.getElementById('knee-quiz'); if(!root) return;
  const questions=[
    ['Що найбільше заважає у звичній активності?', ['Сходи або присідання','Тривала ходьба чи перші кроки','Дискомфорт після тренування або активного дня','Повернення до активності після травми чи операції']],
    ['Що ви вже пробували?', ['Медикаменти або фізпроцедури','Окремі вправи з інтернету','Відпочинок і зменшення навантаження','Поки шукаю зрозумілий план']],
    ['Чи є підтверджений фахівцем стан, про який хочете дізнатися більше?', ['Артроз','Травма або операція на меніску','Пателофеморальний біль','Проблема сухожилля надколінка','Травма зв’язок / ПХЗ','Немає діагнозу або інший стан']],
    ['Чи є зараз обставини, які потребують оцінки фахівця перед вправами?', ['Свіжа травма, значний набряк, блокування або неможливість спертися на ногу','Після операції ще не отримав/-ла дозволу на навантаження','Жодного з переліченого','Не впевнений/-а']],
    ['Який формат вам ближчий?', ['Готовий план для самостійних занять','Хочу розібрати стартову ситуацію з автором','Поки не визначився/-лася']]
  ];
  let step=0,answers=[];
  function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
  function paragraph(text){const p=document.createElement('p');p.textContent=text;root.append(p);}
  function heading(text){const h=document.createElement('h3');h.tabIndex=-1;h.textContent=text;root.append(h);h.focus({preventScroll:true});}
  function result(){root.replaceChildren();
    if(answers[3]!==2){heading('Спочатку уточніть, яке навантаження вам дозволене');paragraph('За вашою відповіддю безпеку самостійного старту варто обговорити з лікарем або фізичним терапевтом. Квіз не може оцінити стан коліна чи визначити діагноз.');}
    else {heading(answers[4]===1?'Вам може бути корисний формат із персональним розбором':'У програмі є готовий шлях для самостійних занять');
      paragraph(['Для вашого запиту важливі поступова сила й контроль під час сходів і присідань.','Для вашого запиту важливі посильний старт і поступове збільшення витривалості.','Для вашого запиту важливі дозування та контроль реакції після навантаження.','Після травми або операції орієнтуйтеся на дозволи та обмеження вашого фахівця.'][answers[0]]);
      paragraph(['Якщо лікування полегшує симптоми, але повернення до активності складне, у курсі є послідовна робота над силою й витривалістю.','Замість пошуку окремих відео ви отримуєте дозування, етапи й критерії прогресії.','Повернення після відпочинку у програмі побудоване від посильного навантаження до складнішого.','Вправи, дозування та послідовність уже зібрані в одному плані.'][answers[1]]);
      const bonus=['артроз','травми та зміни меніска','біль навколо колінної чашечки','сухожилля надколінка','відновлення після травм зв’язок'];
      paragraph(answers[2]<5?'До курсу входить тематичне бонусне відео про '+bonus[answers[2]]+' та додаткові матеріали, що допомагають орієнтуватися у проходженні програми.':'У курсі також є 6 тематичних бонусних відео. Вибір теми за локалізацією болю не встановлює діагноз.');
      paragraph('Обидва формати містять повну програму. 590 грн — самостійно; 1090 грн — із розбором історії, відео тестів та рекомендаціями автора.');
      const a=document.createElement('a');a.className='lp-button lp-button--primary';a.href=answers[4]===1?'#pricing-pro':'#pricing';a.dataset.scrollTo=a.getAttribute('href');a.textContent='Переглянути формати';root.append(a);
    }
    const restart=button('Пройти ще раз',()=>{answers=[];step=0;render();});restart.className='knee-more';restart.style.color='var(--theme-text)';root.append(restart);
  }
  function render(){root.replaceChildren();paragraph('Запитання '+(step+1)+' із '+questions.length);const progress=document.createElement('progress');progress.max=questions.length;progress.value=step+1;progress.setAttribute('aria-label','Прогрес квізу');root.append(progress);heading(questions[step][0]);const options=document.createElement('div');options.className='knee-quiz-options';questions[step][1].forEach((label,i)=>options.append(button(label,()=>{answers[step]=i;step++;step===questions.length?result():render();})));root.append(options);const nav=document.createElement('div');nav.className='knee-quiz-nav';if(step>0)nav.append(button('Назад',()=>{step--;render();}));root.append(nav);paragraph('Відповіді використовуються лише для цього результату й не зберігаються.');}
  document.getElementById('quiz-start').addEventListener('click',render);
})();
