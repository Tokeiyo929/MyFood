const STORAGE_KEY = 'myfood.records.v1';
const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const ingredients = [];

function makeChoiceField(title, hint, id, options) {
  return `<section class="field"><span>${title} <em>${hint}</em></span><div class="choice-grid" id="${id}">${options.split(',').map(option => `<button class="choice" type="button" data-value="${option}">${option}</button>`).join('')}</div></section>`;
}

// Expand the small declarative fields without a framework.
document.querySelectorAll('ChoiceField').forEach(node => node.outerHTML = makeChoiceField(node.getAttribute('title'), node.getAttribute('hint'), node.getAttribute('id'), node.getAttribute('options')));

const $ = selector => document.querySelector(selector);
const selected = id => [...document.querySelectorAll(`#${id} .selected`)].map(button => button.dataset.value);

function renderIngredients() {
  $('#ingredientChips').innerHTML = ingredients.map((item, index) => `<span class="chip">${escapeHtml(item)}<button type="button" data-index="${index}" aria-label="删除${escapeHtml(item)}">×</button></span>`).join('');
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); renderRecords(); }
function renderRecords() {
  $('#recordCount').textContent = records.length;
  $('#emptyState').hidden = records.length > 0;
  $('#records').innerHTML = records.slice().reverse().map(record => `<article class="record"><div class="record-top"><span class="record-name">${escapeHtml(record.name || '未命名食物')}</span><span class="${record.preference === '偏好吃' ? 'preference-good' : 'preference-bad'}">${record.preference || ''}</span></div><div class="record-meta">食材：${record.ingredients.map(escapeHtml).join('、')}</div><div class="record-tags">${[...record.aromatics,...record.seasonings,...record.flavors].map(value => `<span class="record-tag">${escapeHtml(value)}</span>`).join('')}</div></article>`).join('');
}

$('#addIngredient').addEventListener('click', () => { const input = $('#ingredientInput'); const value = input.value.trim(); if (!value || ingredients.includes(value)) return; ingredients.push(value); input.value = ''; renderIngredients(); input.focus(); });
$('#ingredientInput').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); $('#addIngredient').click(); } });
$('#ingredientChips').addEventListener('click', event => { const index = event.target.dataset.index; if (index !== undefined) { ingredients.splice(Number(index), 1); renderIngredients(); } });
document.addEventListener('click', event => { const button = event.target.closest('.choice'); if (button) button.classList.toggle('selected'); const preference = event.target.closest('#preference button'); if (preference) { document.querySelectorAll('#preference button').forEach(item => item.classList.remove('selected')); preference.classList.add('selected'); } });
$('#foodForm').addEventListener('submit', event => { event.preventDefault(); if (!ingredients.length) { $('#ingredientInput').focus(); return; } records.push({ name: $('#dishName').value.trim(), ingredients: [...ingredients], aromatics: selected('aromatics'), seasonings: selected('seasonings'), flavors: selected('flavors'), preference: $('#preference .selected')?.dataset.value || '' }); save(); event.target.reset(); ingredients.length = 0; document.querySelectorAll('.selected').forEach(item => item.classList.remove('selected')); renderIngredients(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); });
$('#clearButton').addEventListener('click', () => { if (!records.length || !confirm('确定清空全部记录吗？')) return; records.length = 0; save(); });
$('#historyButton').addEventListener('click', () => $('.recent-section').scrollIntoView({ behavior:'smooth' }));
renderIngredients(); renderRecords();
