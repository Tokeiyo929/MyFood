const records = [];
const ingredients = [];
const availableIngredients = [];
const categories = [];
const availableCategories = [];
const expandedCategoryParents = new Set();
const flavorLevels = {};
let settings;
let currentPreference;
let draggingFlavor;

const FLAVOR_WHEEL = {size: 240, center: 120, radius: 83, labelRadius: 99, handleRadius: 7};

const $ = selector => document.querySelector(selector);
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[char]));
const preferences = () => Object.values(settings.preferences).sort((a, b) => a.level - b.level);
const preferenceAt = level => preferences().find(item => item.level === level);
const formatFlavorName = (name, level) => {
    const {low_threshold, high_threshold} = settings.flavor_scale;
    return level < low_threshold ? `不${name}` : level > high_threshold ? `太${name}` : name;
};

function renderOptions() {
    settings.flavors.forEach(flavor => { flavorLevels[flavor] = settings.flavor_scale.default_level; });
    renderFlavorWheel();
    const preferenceLevels = preferences();
    const min = preferenceLevels[0].level;
    const max = preferenceLevels[preferenceLevels.length - 1].level;
    const step = preferenceLevels[1].level - min;
    $('#preference').innerHTML = `<span id="preferenceFace" aria-hidden="true"></span><input id="preferenceSlider" type="range" min="${min}" max="${max}" step="${step}" value="${settings.preferences.good.level}" aria-label="偏好程度" /><span id="preferenceLabel"></span>`;
    updatePreference(settings.preferences.good.value);
    updatePreferenceSlider();
}

function renderFlavorWheel() {
    const wheel = FLAVOR_WHEEL;
    const scale = settings.flavor_scale;
    const points = settings.flavors.map((value, index) => {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / settings.flavors.length;
        return {value, angle, x: wheel.center + Math.cos(angle) * wheel.radius, y: wheel.center + Math.sin(angle) * wheel.radius};
    });
    const pointString = levels => points.map(point => {
        const distance = wheel.radius * levels[point.value] / scale.max_level;
        return `${wheel.center + Math.cos(point.angle) * distance},${wheel.center + Math.sin(point.angle) * distance}`;
    }).join(' ');
    const outline = points.map(point => `${point.x},${point.y}`).join(' ');
    $('#flavors').innerHTML = `<svg class="flavor-radar" viewBox="0 0 ${wheel.size} ${wheel.size}" role="img" aria-label="五维味道转盘"><polygon class="flavor-grid" points="${outline}" />${points.map(point => `<line class="flavor-axis-line" x1="${wheel.center}" y1="${wheel.center}" x2="${point.x}" y2="${point.y}" /><text x="${wheel.center + Math.cos(point.angle) * wheel.labelRadius}" y="${wheel.center + Math.sin(point.angle) * wheel.labelRadius}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(formatFlavorName(point.value, flavorLevels[point.value]))}</text>`).join('')}<polygon class="flavor-value" points="${pointString(flavorLevels)}" />${points.map(point => { const x = wheel.center + Math.cos(point.angle) * wheel.radius * flavorLevels[point.value] / scale.max_level; const y = wheel.center + Math.sin(point.angle) * wheel.radius * flavorLevels[point.value] / scale.max_level; return `<line class="flavor-slider-hit" data-flavor="${escapeHtml(point.value)}" x1="${wheel.center}" y1="${wheel.center}" x2="${point.x}" y2="${point.y}" /><circle class="flavor-handle" cx="${x}" cy="${y}" r="${wheel.handleRadius}" />`; }).join('')}</svg><button type="button" class="flavor-reset" id="resetFlavors" aria-label="重置味道默认值" title="重置默认"><span aria-hidden="true">↻</span></button>`;
    $('#flavors').querySelectorAll('.flavor-slider-hit').forEach(handle => handle.addEventListener('pointerdown', startFlavorDrag));
    $('#resetFlavors').addEventListener('click', () => {
        settings.flavors.forEach(flavor => { flavorLevels[flavor] = settings.flavor_scale.default_level; });
        renderFlavorWheel();
    });
}

function startFlavorDrag(event) {
    event.preventDefault();
    draggingFlavor = event.currentTarget.dataset.flavor;
    event.currentTarget.setPointerCapture(event.pointerId);
}

window.addEventListener('pointermove', event => {
    if (!draggingFlavor) return;
    event.preventDefault();
    const wheel = FLAVOR_WHEEL;
    const scale = settings.flavor_scale;
    const svg = $('#flavors svg');
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left) * wheel.size / rect.width - wheel.center;
    const y = (event.clientY - rect.top) * wheel.size / rect.height - wheel.center;
    const index = settings.flavors.indexOf(draggingFlavor);
    const angle = -Math.PI / 2 + index * Math.PI * 2 / settings.flavors.length;
    const level = Math.max(scale.min_level, Math.min(scale.max_level, Math.round((x * Math.cos(angle) + y * Math.sin(angle)) / wheel.radius * scale.max_level)));
    flavorLevels[draggingFlavor] = level;
    renderFlavorWheel();
});
window.addEventListener('pointerup', () => { draggingFlavor = null; });

function updatePreference(value) {
    const preference = preferences().find(item => item.value === value);
    currentPreference = preference.value;
    $('#preferenceFace').textContent = preference.face;
    $('#preferenceLabel').textContent = preference.label;
    const bad = preference.value === settings.preferences.bad.value;
    const excellent = preference.value === settings.preferences.excellent.value;
    $('#dislikeReasonField').hidden = !bad;
    $('#dislikeReason').required = bad;
    $('#goodReasonField').hidden = !excellent;
    $('#goodReason').required = excellent;
    if (!bad) $('#dislikeReason').value = '';
    if (!excellent) $('#goodReason').value = '';
}

function updatePreferenceSlider() {
    const slider = $('#preferenceSlider');
    const preferenceLevels = preferences();
    const min = preferenceLevels[0].level;
    const max = preferenceLevels[preferenceLevels.length - 1].level;
    slider.style.setProperty('--preference-progress', `${(slider.value - min) / (max - min) * 100}%`);
}

function renderIngredients() {
    $('#ingredientChips').innerHTML = ingredients.slice().reverse().map((item, index) =>
        `<span class="chip">${escapeHtml(item)}<button type="button" data-index="${ingredients.length - 1 - index}" aria-label="删除${escapeHtml(item)}">×</button></span>`
    ).join('');
}

function renderIngredientSuggestions() {
    const query = $('#ingredientInput').value.trim().toLowerCase();
    $('#ingredientSuggestions').innerHTML = query
        ? availableIngredients.filter(item => !ingredients.includes(item.name) && item.name.toLowerCase().includes(query)).map(item =>
            `<button type="button" class="quick-ingredient" data-ingredient="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>`
        ).join('')
        : '';
}

function renderCategories() {
    $('#tagChips').innerHTML = categories.slice().reverse().map((item, index) =>
        `<span class="chip">${escapeHtml(item)}<button type="button" data-category-index="${categories.length - 1 - index}" aria-label="删除${escapeHtml(item)}">×</button></span>`
    ).join('');
}

function renderCategorySuggestions() {
    const query = $('#tagInput').value.trim().toLowerCase();
    $('#tagSuggestions').innerHTML = query
        ? availableCategories.filter(item => !categories.includes(item.name) && item.name.toLowerCase().includes(query)).map(item =>
            `<button type="button" class="quick-ingredient" data-category="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>`
        ).join('')
        : '';
}

function addCategory(value) {
    value = value.trim();
    if (!value || categories.includes(value)) return;
    categories.unshift(value);
    renderCategories();
    renderCategorySuggestions();
}

function renderCatalogs() {
    const groupedCategories = availableCategories.reduce((groups, item) => {
        (groups[item.parentcategories] ||= []).push(item);
        return groups;
    }, {});
    $('#allTags').innerHTML = Object.entries(groupedCategories).map(([parent, items]) => `<section class="catalog-group${expandedCategoryParents.has(parent) ? ' expanded' : ''}"><h2 class="catalog-group-title" data-parent-category="${escapeHtml(parent)}" tabindex="0" role="button" aria-expanded="${expandedCategoryParents.has(parent)}">${escapeHtml(parent)}</h2><div class="catalog-group-items">${items.map(item => `<span class="catalog-item">${escapeHtml(item.name)}</span>`).join('')}</div></section>`).join('');
    const query = $('#catalogIngredientInput').value.trim().toLowerCase();
    $('#allIngredients').innerHTML = availableIngredients.filter(item => !query || item.name.toLowerCase().includes(query)).map(item => `<span class="catalog-item">${escapeHtml(item.name)}</span>`).join('');
}

async function addCatalogIngredient() {
    const input = $('#catalogIngredientInput');
    const name = input.value.trim();
    if (!name) return;
    const result = await (await fetch('/api/ingredients', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name}),
    })).json();
    if (!availableIngredients.some(item => item.id === result.id)) availableIngredients.push(result);
    input.value = '';
    renderCatalogs();
    renderIngredientSuggestions();
    input.focus();
}

function switchView(viewId) {
    document.querySelectorAll('.app-view').forEach(view => { view.hidden = view.id !== viewId; });
    document.querySelectorAll('.tabs-bar button').forEach(button => button.classList.toggle('active', button.dataset.view === viewId));
    if (viewId === 'recordsView') window.scrollTo(0, 0);
}

function renderRecords() {
    const {good, bad, excellent} = settings.preferences;
    const defaultLevel = settings.flavor_scale.default_level;
    $('#emptyState').hidden = records.length > 0;
    $('#records').innerHTML = records.map(record => {
        const visibleFlavors = record.flavors.filter(flavor => flavor.level !== defaultLevel);
        return `<article class="record ${record.preference === excellent.value ? 'preference-excellent-card' : record.preference === bad.value ? 'preference-bad-card' : 'preference-good-card'}" data-id="${record.id}">
        <div class="record-content">
            <div class="record-image-box">${record.image_path ? `<img class="record-image" src="${record.image_path}" alt="${escapeHtml(record.name)}" />` : ''}</div>
            <div class="record-info">
                <div class="record-top">
                    <div class="record-title"><span class="record-name">${escapeHtml(record.name)}</span></div>
                    <div class="record-side"><div class="record-summary">
                        ${record.brand_name ? `<span class="record-brand">${escapeHtml(record.brand_name)}</span>` : ''}
                        ${visibleFlavors.length ? `<div class="record-tags">${visibleFlavors.map(flavor => `<span class="record-tag">${escapeHtml(formatFlavorName(flavor.name, flavor.level))}</span>`).join('')}</div>` : ''}
                        ${record.categories.length ? `<div class="record-user-tags">${record.categories.map(value => `<span class="record-tag">${escapeHtml(value)}</span>`).join('')}</div>` : ''}
                    </div></div>
                    <div class="repurchase-actions">
                        <button class="repurchase-choice" data-value="${good.value}" type="button">${good.label}</button>
                        <button class="repurchase-choice" data-value="${bad.value}" type="button">${bad.label}</button>
                    </div>
                    <div class="record-meta">${record.ingredients.map(escapeHtml).join('、')}</div>
                </div>
            </div>
        </div>
    </article>`;
    }).join('');

    document.querySelectorAll('.record').forEach(card => {
        const record = records.find(item => String(item.id) === card.dataset.id);
        if (record.preference === bad.value) {
            card.querySelector('.repurchase-actions').innerHTML = `<div class="dislike-reason-display">难吃理由：${escapeHtml(record.dislike_reason)}</div>`;
            return;
        }
        if (record.preference === excellent.value) {
            card.querySelector('.repurchase-actions').innerHTML = `<div class="good-reason-display">好吃理由：${escapeHtml(record.good_reason)}</div>`;
            return;
        }
        card.querySelector(`.repurchase-choice[data-value="${good.value}"]`).textContent = '复购仍然好吃';
        card.querySelector('.repurchase-actions').insertAdjacentHTML('beforeend', `<span class="repurchase-count">已复购 ${record.repurchase_count} 次</span>`);
    });
}

function restoreRecordSide(card) {
    card.classList.remove('expanded');
}

let page = 1;
let hasMoreRecords = true;
let loadingRecords = false;

async function loadRecords(reset = true) {
    if (loadingRecords || (!reset && !hasMoreRecords)) return;
    loadingRecords = true;
    const nextPage = reset ? 1 : page + 1;
    const params = new URLSearchParams({page: nextPage, limit: settings.pagination.page_size, search: $('#recordSearch').value.trim()});
    const result = await (await fetch(`/api/foods?${params}`)).json();
    if (reset) records.length = 0;
    records.push(...result.items);
    page = nextPage;
    hasMoreRecords = records.length < result.total;
    renderRecords();
    loadingRecords = false;
}

$('#ingredientInput').addEventListener('input', renderIngredientSuggestions);
$('#ingredientSuggestions').addEventListener('click', event => {
    const button = event.target.closest('[data-ingredient]');
    if (!button || ingredients.includes(button.dataset.ingredient)) return;
    ingredients.unshift(button.dataset.ingredient);
    $('#ingredientInput').value = '';
    $('#formError').textContent = '';
    renderIngredients();
    renderIngredientSuggestions();
    $('#ingredientInput').focus();
});
$('#ingredientChips').addEventListener('click', event => {
    const index = event.target.dataset.index;
    if (index === undefined) return;
    ingredients.splice(Number(index), 1);
    renderIngredients();
    renderIngredientSuggestions();
});
$('#tagInput').addEventListener('input', renderCategorySuggestions);
$('#tagChips').addEventListener('click', event => {
    const index = event.target.dataset.categoryIndex;
    if (index === undefined) return;
    categories.splice(Number(index), 1);
    renderCategories();
    renderCategorySuggestions();
});
$('#tagSuggestions').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    addCategory(button.dataset.category);
    $('#tagInput').value = '';
    renderCategorySuggestions();
    $('#tagInput').focus();
});
document.querySelector('.tabs-bar').addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (button) switchView(button.dataset.view);
});
$('#addCatalogIngredient').addEventListener('click', addCatalogIngredient);
$('#catalogIngredientInput').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); addCatalogIngredient(); }
});
$('#catalogIngredientInput').addEventListener('input', renderCatalogs);
$('#allTags').addEventListener('click', event => {
    const header = event.target.closest('[data-parent-category]');
    if (!header) return;
    const parent = header.dataset.parentCategory;
    expandedCategoryParents.has(parent) ? expandedCategoryParents.delete(parent) : expandedCategoryParents.add(parent);
    renderCatalogs();
});
$('#preference').addEventListener('input', event => {
    if (event.target.id !== 'preferenceSlider') return;
    updatePreference(preferenceAt(Number(event.target.value)).value);
    updatePreferenceSlider();
});

document.addEventListener('click', async event => {
    if (event.target.closest('.reason-form')) return;
    const repurchase = event.target.closest('.repurchase-choice');
    if (repurchase) {
        const card = repurchase.closest('.record');
        await fetch(`/api/foods/${card.dataset.id}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({preference: repurchase.dataset.value})});
        await loadRecords();
        return;
    }
    const card = event.target.closest('.record');
    if (card) {
        const expanded = document.querySelector('.record.expanded');
        if (expanded && expanded !== card) restoreRecordSide(expanded);
        if (expanded === card) restoreRecordSide(card);
        else card.classList.add('expanded');
        return;
    }
    const expanded = document.querySelector('.record.expanded');
    if (expanded) restoreRecordSide(expanded);
});

document.addEventListener('click', event => {
    if (!settings) return;
    const button = event.target.closest(`.repurchase-choice[data-value="${settings.preferences.bad.value}"]`);
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const actions = button.closest('.repurchase-actions');
    actions.innerHTML = '<form class="reason-form"><input required placeholder="请输入难吃理由" /><button type="submit">确认</button></form>';
    actions.querySelector('input').focus();
}, true);

document.addEventListener('submit', async event => {
    const form = event.target.closest('.reason-form');
    if (!form) return;
    event.preventDefault();
    const card = form.closest('.record');
    const reason = form.querySelector('input').value.trim();
    if (!reason) return;
    await fetch(`/api/foods/${card.dataset.id}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({preference: settings.preferences.bad.value, dislike_reason: reason})});
    await loadRecords();
}, true);

$('#imageInput').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    $('#imagePreview').src = URL.createObjectURL(file);
    $('#imagePreview').hidden = false;
});

async function compressImage(file) {
    const image = await new Promise((resolve, reject) => {
        const value = new Image();
        value.onload = () => resolve(value);
        value.onerror = reject;
        value.src = URL.createObjectURL(file);
    });
    const imageSettings = settings.image;
    const scale = Math.min(1, imageSettings.max_dimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', imageSettings.quality));
}

$('#foodForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!ingredients.length) {
        $('#formError').textContent = '没有添加原料';
        $('#ingredientInput').scrollIntoView({behavior: 'smooth', block: 'center'});
        return;
    }
    const saveButton = $('.save-fixed');
    saveButton.disabled = true;
    saveButton.textContent = '保存中';
    const file = $('#imageInput').files[0];
    let imagePath = '';
    if (file) {
        const form = new FormData();
        form.append('image', await compressImage(file), 'food.jpg');
        imagePath = (await (await fetch('/api/upload', {method: 'POST', body: form})).json()).path;
    }
    const record = {
        name: $('#dishName').value.trim(),
        brand_name: $('#brandName').value.trim(),
        categories: [...categories],
        ingredients: [...ingredients],
        flavors: Object.entries(flavorLevels).filter(([, level]) => level > settings.flavor_scale.min_level).map(([name, level]) => ({name, level})),
        preference: currentPreference,
        dislike_reason: $('#dislikeReason').value.trim(),
        good_reason: $('#goodReason').value.trim(),
        image_path: imagePath,
    };
    await fetch('/api/foods', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(record)});
    await loadRecords();
    event.target.reset();
    $('#imagePreview').hidden = true;
    ingredients.length = 0;
    categories.length = 0;
    settings.flavors.forEach(flavor => { flavorLevels[flavor] = settings.flavor_scale.default_level; });
    $('#dislikeReasonField').hidden = true;
    $('#dislikeReason').required = false;
    $('#goodReasonField').hidden = true;
    $('#goodReason').required = false;
    $('#preferenceSlider').value = settings.preferences.good.level;
    updatePreference(settings.preferences.good.value);
    updatePreferenceSlider();
    renderFlavorWheel();
    renderIngredients();
    renderCategories();
    renderCategorySuggestions();
    $('#formError').textContent = '';
    saveButton.disabled = false;
    saveButton.textContent = '保存记录';
});

$('#recordSearch').addEventListener('input', () => loadRecords(true));
$('#clearSearch').addEventListener('click', () => {
    $('#recordSearch').value = '';
    loadRecords(true);
    $('#recordSearch').focus();
});
window.addEventListener('scroll', () => {
    if (!settings) return;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - settings.pagination.scroll_threshold) loadRecords(false);
});

async function loadCategories() {
    const result = await (await fetch('/api/categories')).json();
    availableCategories.push(...result.items);
    renderCategorySuggestions();
    renderCatalogs();
}

async function loadIngredients() {
    const result = await (await fetch('/api/ingredients')).json();
    availableIngredients.push(...result.items);
    renderIngredientSuggestions();
    renderCatalogs();
}

async function init() {
    settings = await (await fetch('/api/config')).json();
    renderOptions();
    renderIngredients();
    renderIngredientSuggestions();
    renderCategories();
    await loadRecords();
    await Promise.all([loadCategories(), loadIngredients()]);
}

init();
