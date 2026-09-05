const records = [];
const ingredients = [];
const availableIngredients = [];
const tags = [];
const availableTags = [];
const flavorOrder = [];
let settings;

const $ = selector => document.querySelector(selector);
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[char]));

function renderOptions() {
    $('#flavors').innerHTML = settings.flavors.map(value =>
        `<button class="choice" type="button" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`
    ).join('');
    $('#preference').innerHTML = Object.values(settings.preferences).map(({ value, label }) =>
        `<button type="button" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`
    ).join('');
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

function renderRecords() {
    const { good, bad } = settings.preferences;
    $('#emptyState').hidden = records.length > 0;
    $('#records').innerHTML = records.map(record => `<article class="record ${record.preference === good.value ? 'preference-good-card' : record.preference === bad.value ? 'preference-bad-card' : ''}" data-id="${record.id}">
        <div class="record-content">
            <div class="record-image-box">${record.image_path ? `<img class="record-image" src="${record.image_path}" alt="${escapeHtml(record.name)}" />` : ''}</div>
            <div class="record-info">
                <div class="record-top">
                    <div class="record-title"><span class="record-name">${escapeHtml(record.name)}</span></div>
                    <div class="record-side"><div class="record-summary">
                        ${record.brand_name ? `<span class="record-brand">${escapeHtml(record.brand_name)}</span>` : ''}
                        ${record.flavors.length ? `<div class="record-tags">${record.flavors.map(value => `<span class="record-tag">${escapeHtml(value)}</span>`).join('')}</div>` : ''}
                        ${record.tags.length ? `<div class="record-user-tags">${record.tags.map(value => `<span class="record-tag">${escapeHtml(value)}</span>`).join('')}</div>` : ''}
                    </div></div>
                    <div class="repurchase-actions">
                        <button class="repurchase-choice" data-value="${good.value}" type="button">${good.label}</button>
                        <button class="repurchase-choice" data-value="${bad.value}" type="button">${bad.label}</button>
                    </div>
                    <div class="record-meta">${record.ingredients.map(escapeHtml).join('、')}</div>
                </div>
            </div>
        </div>
    </article>`).join('');

    document.querySelectorAll('.record').forEach(card => {
        const record = records.find(item => String(item.id) === card.dataset.id);
        if (record.preference === bad.value) {
            card.querySelector('.repurchase-actions').innerHTML =
                `<div class="dislike-reason-display">难吃理由：${escapeHtml(record.dislike_reason)}</div>`;
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
$('#flavors').addEventListener('click', event => {
    const choice = event.target.closest('.choice');
    if (!choice) return;
    const index = flavorOrder.indexOf(choice.dataset.value);
    if (index >= 0) flavorOrder.splice(index, 1);
    else flavorOrder.push(choice.dataset.value);
    choice.classList.toggle('selected');
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
    const selectedPreference = $('#preference .selected');
    const record = {
        name: $('#dishName').value.trim(),
        brand_name: $('#brandName').value.trim(),
        tags: [...tags],
        ingredients: [...ingredients],
        flavors: [...flavorOrder],
        preference: selectedPreference ? selectedPreference.dataset.value : '',
        dislike_reason: $('#dislikeReason').value.trim(),
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
    document.querySelectorAll('.selected').forEach(item => item.classList.remove('selected'));
    $('#dislikeReasonField').hidden = true;
    $('#dislikeReason').required = false;
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
    const bad = button.dataset.value === settings.preferences.bad.value;
    $('#dislikeReasonField').hidden = !bad;
    $('#dislikeReason').required = bad;
    if (!bad) $('#dislikeReason').value = '';
});

async function loadTags() {
    const result = await (await fetch('/api/tags')).json();
    availableTags.push(...result.items);
    renderTagSuggestions();
}

async function loadIngredients() {
    const result = await (await fetch('/api/ingredients')).json();
    availableIngredients.push(...result.items);
    renderIngredientSuggestions();
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
