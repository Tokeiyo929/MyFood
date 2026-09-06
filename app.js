const records = [];
const ingredients = [];
const availableIngredients = [];
const tags = [];
const availableTags = [];
const flavorOrder = [];
const flavorLevels = {};
let settings;
let currentPreference = '';

const $ = selector => document.querySelector(selector);
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[char]));
const flavorName = value => typeof value === 'string' ? value : value.name;
const formatFlavorName = (name, level) => level < 33 ? `不${name}` : level > 66 ? `太${name}` : name;
const flavorDisplayName = value => typeof value === 'string' ? value : formatFlavorName(value.name, value.level);
const flavorAxisName = value => formatFlavorName(value, flavorLevels[value] ?? 50);

function renderOptions() {
    settings.flavors.forEach(value => { flavorLevels[value] = 50; });
    renderFlavorWheel();
    const preferences = Object.values(settings.preferences);
    const orderedPreferences = preferences.slice().reverse();
    $('#preference').innerHTML = `<div class="preference-status"><span id="preferenceFace" aria-hidden="true">🙂</span><span id="preferenceLabel">偏好吃</span></div><input id="preferenceSlider" type="range" min="0" max="100" step="50" value="50" aria-label="偏好程度" />`;
    $('#preference').dataset.values = orderedPreferences.map(item => item.value).join('|');
    updatePreference(orderedPreferences[1].value);
    updatePreferenceSlider();
}

function renderFlavorWheel() {
    const center = 110;
    const radius = 76;
    const points = settings.flavors.map((value, index) => {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
        return {value, angle, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius};
    });
    const pointString = values => points.map(point => {
        const level = values[point.value] ?? 50;
        const distance = radius * level / 100;
        return `${center + Math.cos(point.angle) * distance},${center + Math.sin(point.angle) * distance}`;
    }).join(' ');
    const outline = points.map(point => `${point.x},${point.y}`).join(' ');
    $('#flavors').innerHTML = `<svg class="flavor-radar" viewBox="0 0 220 220" role="img" aria-label="五维味道转盘"><polygon class="flavor-grid" points="${outline}" />${points.map(point => `<line class="flavor-axis-line" x1="${center}" y1="${center}" x2="${point.x}" y2="${point.y}" /><text x="${center + Math.cos(point.angle) * 98}" y="${center + Math.sin(point.angle) * 98}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(flavorAxisName(point.value))}</text>`).join('')}<polygon class="flavor-value" points="${pointString(flavorLevels)}" />${points.map(point => `<circle class="flavor-handle" data-flavor="${escapeHtml(point.value)}" cx="${center + Math.cos(point.angle) * radius * (flavorLevels[point.value] ?? 50) / 100}" cy="${center + Math.sin(point.angle) * radius * (flavorLevels[point.value] ?? 50) / 100}" r="7" />`).join('')}</svg><button type="button" class="flavor-reset" id="resetFlavors" aria-label="重置味道默认值" title="重置默认"><span aria-hidden="true">↻</span></button>`;
    $('#flavors').querySelectorAll('.flavor-handle').forEach(handle => handle.addEventListener('pointerdown', startFlavorDrag));
    $('#resetFlavors').addEventListener('click', () => { settings.flavors.forEach(value => { flavorLevels[value] = 50; }); renderFlavorWheel(); });
}

let draggingFlavor;
function startFlavorDrag(event) { draggingFlavor = event.currentTarget.dataset.flavor; event.currentTarget.setPointerCapture?.(event.pointerId); }
window.addEventListener('pointermove', event => {
    if (!draggingFlavor) return;
    const svg = $('#flavors svg');
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left) * 220 / rect.width - 110;
    const y = (event.clientY - rect.top) * 220 / rect.height - 110;
    const index = settings.flavors.indexOf(draggingFlavor);
    const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
    const level = Math.max(0, Math.min(100, Math.round((x * Math.cos(angle) + y * Math.sin(angle)) / 76 * 100)));
    flavorLevels[draggingFlavor] = level;
    renderFlavorWheel();
});
window.addEventListener('pointerup', () => { draggingFlavor = null; });

function updatePreference(value) {
    currentPreference = value;
    document.querySelectorAll('#preference button').forEach(button => button.classList.toggle('selected', button.dataset.value === value));
    const bad = value === settings.preferences.bad.value;
    const excellent = value === settings.preferences.excellent.value;
    $('#preferenceFace').textContent = excellent ? '😄' : value === settings.preferences.good.value ? '🙂' : '😞';
    $('#preferenceLabel').textContent = excellent ? settings.preferences.excellent.label : value === settings.preferences.good.value ? settings.preferences.good.label : settings.preferences.bad.label;
    $('#dislikeReasonField').hidden = !bad;
    $('#dislikeReason').required = bad;
    $('#goodReasonField').hidden = !excellent;
    $('#goodReason').required = excellent;
    if (!bad) $('#dislikeReason').value = '';
    if (!excellent) $('#goodReason').value = '';
}

function updatePreferenceSlider() {
    const slider = $('#preferenceSlider');
    slider.style.setProperty('--preference-progress', `${slider.value}%`);
}

function renderIngredients() {
    $('#ingredientChips').innerHTML = ingredients.slice().reverse().map((item, index) =>
        `<span class="chip">${escapeHtml(item)}<button type="button" data-index="${ingredients.length - 1 - index}" aria-label="删除${escapeHtml(item)}">×</button></span>`
    ).join('');
}

function renderIngredientSuggestions() {
    const query = $('#ingredientInput').value.trim().toLowerCase();
    $('#ingredientSuggestions').innerHTML = query
        ? availableIngredients
            .filter(item => !ingredients.includes(item.name) && item.name.toLowerCase().includes(query))
            .map(item => `<button type="button" class="quick-ingredient" data-ingredient="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>`)
            .join('')
        : '';
}

function renderTags() {
    $('#tagChips').innerHTML = tags.slice().reverse().map((item, index) =>
        `<span class="chip">${escapeHtml(item)}<button type="button" data-tag-index="${tags.length - 1 - index}" aria-label="删除${escapeHtml(item)}">×</button></span>`
    ).join('');
}

function renderTagSuggestions() {
    const query = $('#tagInput').value.trim().toLowerCase();
    $('#tagSuggestions').innerHTML = query
        ? availableTags
            .filter(item => !tags.includes(item.name) && item.name.toLowerCase().includes(query))
            .map(item => `<button type="button" class="quick-ingredient" data-tag="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>`)
            .join('')
        : '';
}

function addTag(value) {
    value = value.trim();
    if (!value || tags.includes(value)) return;
    tags.unshift(value);
    renderTags();
    renderTagSuggestions();
}

function renderCatalogs() {
    $('#allTags').innerHTML = availableTags.map(item => `<span class="catalog-item">${escapeHtml(item.name)}</span>`).join('');
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
    const { good, bad, excellent } = settings.preferences;
    $('#emptyState').hidden = records.length > 0;
    $('#records').innerHTML = records.map(record => {
        const visibleFlavors = record.flavors.filter(value => typeof value === 'string' || value.level !== 50);
        return `<article class="record ${record.preference === excellent.value ? 'preference-excellent-card' : record.preference === bad.value ? 'preference-bad-card' : 'preference-good-card'}" data-id="${record.id}">
        <div class="record-content">
            <div class="record-image-box">${record.image_path ? `<img class="record-image" src="${record.image_path}" alt="${escapeHtml(record.name)}" />` : ''}</div>
            <div class="record-info">
                <div class="record-top">
                    <div class="record-title"><span class="record-name">${escapeHtml(record.name)}</span></div>
                    <div class="record-side"><div class="record-summary">
                        ${record.brand_name ? `<span class="record-brand">${escapeHtml(record.brand_name)}</span>` : ''}
                        ${visibleFlavors.length ? `<div class="record-tags">${visibleFlavors.map(value => `<span class="record-tag">${escapeHtml(flavorDisplayName(value))}</span>`).join('')}</div>` : ''}
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
            card.querySelector('.repurchase-actions').innerHTML =
                `<div class="dislike-reason-display">难吃理由：${escapeHtml(record.dislike_reason)}</div>`;
            return;
        }
        if (record.preference === excellent.value) {
            card.querySelector('.repurchase-actions').innerHTML =
                `<div class="good-reason-display">好吃理由：${escapeHtml(record.good_reason)}</div>`;
            return;
        }
        card.querySelector(`.repurchase-choice[data-value="${good.value}"]`).textContent = '复购仍然好吃';
        card.querySelector('.repurchase-actions').insertAdjacentHTML(
            'beforeend', `<span class="repurchase-count">已复购 ${record.repurchase_count} 次</span>`
        );
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
    const params = new URLSearchParams({
        page: nextPage,
        limit: settings.pagination.page_size,
        search: $('#recordSearch').value.trim(),
    });
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
$('#tagInput').addEventListener('input', renderTagSuggestions);
$('#tagChips').addEventListener('click', event => {
    const index = event.target.dataset.tagIndex;
    if (index === undefined) return;
    tags.splice(Number(index), 1);
    renderTags();
    renderTagSuggestions();
});
$('#tagSuggestions').addEventListener('click', event => {
    const button = event.target.closest('[data-tag]');
    if (!button) return;
    addTag(button.dataset.tag);
    $('#tagInput').value = '';
    renderTagSuggestions();
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
$('#flavors').addEventListener('input', event => { const input = event.target.closest('[data-flavor]'); if (input) flavorLevels[input.dataset.flavor] = Number(input.value); });
$('#preference').addEventListener('input', event => {
    if (event.target.id !== 'preferenceSlider') return;
    const values = $('#preference').dataset.values.split('|');
    updatePreference(values[Math.round(Number(event.target.value) / 50)]);
    updatePreferenceSlider();
});

document.addEventListener('click', async event => {
    if (event.target.closest('.reason-form')) return;
    const repurchase = event.target.closest('.repurchase-choice');
    if (repurchase) {
        const card = repurchase.closest('.record');
        await fetch(`/api/foods/${card.dataset.id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({preference: repurchase.dataset.value}),
        });
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
    if (expanded) {
        restoreRecordSide(expanded);
        return;
    }
    const preference = event.target.closest('#preference button');
    if (preference) {
        document.querySelectorAll('#preference button').forEach(button => button.classList.remove('selected'));
        preference.classList.add('selected');
    }
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
    await fetch(`/api/foods/${card.dataset.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({preference: settings.preferences.bad.value, dislike_reason: reason}),
    });
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
    const scale = Math.min(1, settings.image.max_dimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', settings.image.quality));
}

$('#foodForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!ingredients.length) {
        $('#formError').textContent = '没有添加食材';
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
        categories: [...tags],
        ingredients: [...ingredients],
        flavors: Object.entries(flavorLevels).filter(([, level]) => level > 0).map(([name, level]) => ({name, level})),
        preference: currentPreference,
        dislike_reason: $('#dislikeReason').value.trim(),
        good_reason: $('#goodReason').value.trim(),
        image_path: imagePath,
    };
    await fetch('/api/foods', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(record),
    });
    await loadRecords();
    event.target.reset();
    $('#imagePreview').hidden = true;
    ingredients.length = 0;
    tags.length = 0;
    flavorOrder.length = 0;
    Object.keys(flavorLevels).forEach(value => { flavorLevels[value] = 50; });
    document.querySelectorAll('#flavors input[data-flavor]').forEach(input => { input.value = 50; });
    document.querySelectorAll('.selected').forEach(item => item.classList.remove('selected'));
    $('#dislikeReasonField').hidden = true;
    $('#dislikeReason').required = false;
    $('#goodReasonField').hidden = true;
    $('#goodReason').required = false;
    $('#preferenceSlider').value = 50;
    updatePreference(settings.preferences.good.value);
    updatePreferenceSlider();
    renderIngredients();
    renderTags();
    renderTagSuggestions();
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
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - settings.pagination.scroll_threshold) {
        loadRecords(false);
    }
});
$('#preference').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const values = $('#preference').dataset.values.split('|');
    $('#preferenceSlider').value = values.indexOf(button.dataset.value);
    updatePreference(button.dataset.value);
});

async function loadTags() {
    const result = await (await fetch('/api/categories')).json();
    availableTags.push(...result.items);
    renderTagSuggestions();
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
    renderTags();
    await loadRecords();
    await Promise.all([loadTags(), loadIngredients()]);
}

init();
