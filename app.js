const WORDS = [
  {en:"hello",ru:"привет",cat:"Basics",example:"Hello! How are you? — Привет! Как дела?"},
  {en:"goodbye",ru:"до свидания",cat:"Basics",example:"Goodbye, see you tomorrow. — До свидания, до завтра."},
  {en:"please",ru:"пожалуйста",cat:"Basics",example:"Water, please. — Воды, пожалуйста."},
  {en:"thank you",ru:"спасибо",cat:"Basics",example:"Thank you for your help. — Спасибо за помощь."},
  {en:"friend",ru:"друг",cat:"Basics",example:"She is my friend. — Она моя подруга."},
  {en:"name",ru:"имя",cat:"Basics",example:"My name is Anna. — Меня зовут Анна."},
  {en:"happy",ru:"счастливый",cat:"Basics",example:"I am happy today. — Я сегодня счастлива."},
  {en:"learn",ru:"учить, изучать",cat:"Basics",example:"I learn English every day. — Я изучаю английский каждый день."},
  {en:"family",ru:"семья",cat:"Family",example:"My family is big. — Моя семья большая."},
  {en:"mother",ru:"мама",cat:"Family",example:"My mother is kind. — Моя мама добрая."},
  {en:"father",ru:"папа",cat:"Family",example:"My father likes books. — Мой папа любит книги."},
  {en:"sister",ru:"сестра",cat:"Family",example:"I have a sister. — У меня есть сестра."},
  {en:"brother",ru:"брат",cat:"Family",example:"My brother is at home. — Мой брат дома."},
  {en:"home",ru:"дом",cat:"Home",example:"I am at home. — Я дома."},
  {en:"room",ru:"комната",cat:"Home",example:"My room is small. — Моя комната маленькая."},
  {en:"table",ru:"стол",cat:"Home",example:"The book is on the table. — Книга на столе."},
  {en:"window",ru:"окно",cat:"Home",example:"Open the window, please. — Открой окно, пожалуйста."},
  {en:"book",ru:"книга",cat:"Study",example:"This is an interesting book. — Это интересная книга."},
  {en:"school",ru:"школа",cat:"Study",example:"I go to school. — Я хожу в школу."},
  {en:"question",ru:"вопрос",cat:"Study",example:"I have a question. — У меня есть вопрос."}
];
const CATEGORY_RU = {Basics:"Основы",Family:"Семья",Home:"Дом",Study:"Учёба"};
const STORAGE_KEY = "foreign-learning-progress-v1";
let state = loadState();
let currentCard = 0;
let cardFlipped = false;
let quiz = {items:[],index:0,score:0,answered:false};

function loadState(){
  try { return Object.assign({known:[],correct:0,tests:0}, JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")); }
  catch { return {known:[],correct:0,tests:0}; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); renderStats(); }
function renderStats(){
  document.getElementById("learned-count").textContent = state.known.length;
  document.getElementById("correct-count").textContent = state.correct;
  document.getElementById("total-count").textContent = WORDS.length;
}
function showView(name){
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("hidden",el.id!==`view-${name}`));
  document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.view===name));
  const titles={home:"Добро пожаловать!",words:"Словарь",cards:"Карточки слов",quiz:"Мини-тест"};
  document.getElementById("page-title").textContent=titles[name]||"foreign";
  if(name==="words") renderWords();
  if(name==="cards") renderCard();
  if(name==="quiz" && !quiz.items.length) startQuiz();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.go)));

function renderWords(){
  const q=(document.getElementById("word-search").value||"").trim().toLowerCase();
  const cat=document.getElementById("category-filter").value;
  const list=WORDS.filter(w=>(cat==="all"||w.cat===cat)&&`${w.en} ${w.ru} ${w.example}`.toLowerCase().includes(q));
  const target=document.getElementById("word-list");
  if(!list.length){target.innerHTML='<div class="empty-state">Ничего не найдено. Попробуй другой запрос.</div>';return;}
  target.innerHTML=list.map(w=>{
    const known=state.known.includes(w.en);
    return `<article class="word-item"><span class="word-letter">${escapeHTML(w.en[0].toUpperCase())}</span><div class="word-main"><strong>${escapeHTML(w.en)}</strong><p>${escapeHTML(w.ru)}</p><small>${escapeHTML(w.example)}</small></div><button class="known-btn ${known?"known":""}" data-known="${escapeHTML(w.en)}">${known?"✓ Знаю":"Знаю слово"}</button></article>`;
  }).join("");
  target.querySelectorAll("[data-known]").forEach(btn=>btn.addEventListener("click",()=>{
    const word=btn.dataset.known;
    state.known=state.known.includes(word)?state.known.filter(x=>x!==word):[...state.known,word];
    saveState();renderWords();
  }));
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
document.getElementById("word-search").addEventListener("input",renderWords);
document.getElementById("category-filter").addEventListener("change",renderWords);

function renderCard(){
  const w=WORDS[currentCard%WORDS.length];
  document.getElementById("card-counter").textContent=`КАРТОЧКА ${currentCard+1} / ${WORDS.length}`;
  document.getElementById("card-category").textContent=CATEGORY_RU[w.cat].toUpperCase();
  document.getElementById("card-word").textContent=cardFlipped?w.ru:w.en;
  document.getElementById("card-hint").textContent=cardFlipped?"Нажми, чтобы вернуться к слову":"Нажми, чтобы увидеть перевод";
  document.getElementById("card-example").textContent=cardFlipped?w.example:"";
  document.getElementById("flip-card").textContent=cardFlipped?"Показать слово":"Показать перевод";
  const known=state.known.includes(w.en);
  document.getElementById("card-known").textContent=known?"✓ Слово уже отмечено":"✓ Я знаю это слово";
}
function flipCard(){cardFlipped=!cardFlipped;renderCard();}
document.getElementById("flashcard").addEventListener("click",flipCard);
document.getElementById("flashcard").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flipCard();}});
document.getElementById("flip-card").addEventListener("click",flipCard);
document.getElementById("prev-card").addEventListener("click",()=>{currentCard=(currentCard-1+WORDS.length)%WORDS.length;cardFlipped=false;renderCard();});
document.getElementById("next-card").addEventListener("click",()=>{currentCard=(currentCard+1)%WORDS.length;cardFlipped=false;renderCard();});
document.getElementById("card-known").addEventListener("click",()=>{
  const word=WORDS[currentCard].en;
  state.known=state.known.includes(word)?state.known.filter(x=>x!==word):[...state.known,word];
  saveState();renderCard();
});

function startQuiz(){
  const shuffled=[...WORDS].sort(()=>Math.random()-.5).slice(0,10);
  quiz={items:shuffled,index:0,score:0,answered:false};
  document.getElementById("quiz-panel").classList.remove("hidden");
  document.getElementById("quiz-result").classList.add("hidden");
  renderQuestion();
}
function renderQuestion(){
  const w=quiz.items[quiz.index];
  quiz.answered=false;
  document.getElementById("quiz-progress").textContent=`Вопрос ${quiz.index+1} из ${quiz.items.length}`;
  document.getElementById("quiz-progress-bar").style.width=`${(quiz.index/quiz.items.length)*100}%`;
  document.getElementById("quiz-word").textContent=w.en;
  document.getElementById("quiz-feedback").textContent="";
  document.getElementById("quiz-next").disabled=true;
  document.getElementById("quiz-next").textContent=quiz.index===quiz.items.length-1?"Посмотреть результат":"Следующий вопрос →";
  const wrong=WORDS.filter(x=>x.en!==w.en).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.ru);
  const answers=[w.ru,...wrong].sort(()=>Math.random()-.5);
  const grid=document.getElementById("answer-grid");
  grid.innerHTML=answers.map(a=>`<button class="answer-option">${escapeHTML(a)}</button>`).join("");
  grid.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>chooseAnswer(btn,w)));
}
function chooseAnswer(btn,w){
  if(quiz.answered)return;
  quiz.answered=true;
  const correct=btn.textContent===w.ru;
  if(correct){quiz.score++;state.correct++;document.getElementById("quiz-feedback").textContent="Верно! Отличная работа.";btn.classList.add("correct");}
  else{document.getElementById("quiz-feedback").textContent=`Почти! Правильный ответ: ${w.ru}`;btn.classList.add("incorrect");}
  document.querySelectorAll(".answer-option").forEach(option=>{option.disabled=true;if(option.textContent===w.ru)option.classList.add("correct");});
  document.getElementById("quiz-next").disabled=false;
  document.getElementById("quiz-progress-bar").style.width=`${((quiz.index+1)/quiz.items.length)*100}%`;
  saveState();
}
document.getElementById("quiz-next").addEventListener("click",()=>{
  if(!quiz.answered)return;
  if(quiz.index<quiz.items.length-1){quiz.index++;renderQuestion();}
  else{
    state.tests++;saveState();
    document.getElementById("quiz-panel").classList.add("hidden");
    document.getElementById("quiz-result").classList.remove("hidden");
    document.getElementById("result-title").textContent=quiz.score>=8?"Отличная работа!":quiz.score>=5?"Хорошее начало!":"Продолжай тренироваться!";
    document.getElementById("result-summary").textContent=`Ты ответила правильно на ${quiz.score} из ${quiz.items.length} вопросов. Повтори карточки и попробуй ещё раз.`;
  }
});
document.getElementById("restart-quiz").addEventListener("click",startQuiz);

const dateLabel=document.getElementById("today-label");
dateLabel.textContent=new Intl.DateTimeFormat("ru-RU",{weekday:"long",day:"numeric",month:"long"}).format(new Date()).toUpperCase();
renderStats();
