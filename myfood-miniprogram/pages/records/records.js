const api = require('../../utils/api');

Page({
  data: {
    settings: null,
    flavors: [],
    flavorLevels: {},
    preferenceOptions: [
      { value: '推荐吃', face: '😄' },
      { value: '偏好吃', face: '🙂' },
      { value: '偏难吃', face: '😞' },
    ],
    preference: '偏好吃',
    dishName: '',
    brandName: '',
    price: '',
    ingredientSearch: '',
    ingredientSuggestions: [],
    ingredientAmount: '',
    ingredients: [],
    categories: [],
    selectedCategory: '',
    records: [],
    recordSearch: '',
    page: 1,
    hasMore: true,
    loading: false,
  },

  onLoad() {
    this.loadConfig();
    this.loadCategories();
    this.loadRecords(true);
  },

  onShow() {
    if (this.data.settings) this.loadRecords(true);
  },

  async loadConfig() {
    try {
      const config = await api.getConfig();
      const flavorLevels = {};
      config.flavors.forEach(f => flavorLevels[f] = 50);
      this.setData({ settings: config, flavors: config.flavors, flavorLevels });
    } catch (e) {}
  },

  async loadCategories() {
    try {
      const result = await api.getCategories();
      this.setData({ categories: result.items });
    } catch (e) {}
  },

  async loadRecords(reset) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const page = reset ? 1 : this.data.page + 1;
    try {
      const result = await api.getFoods(page, 20, this.data.recordSearch);
      const records = reset ? result.items : this.data.records.concat(result.items);
      this.setData({ records, page, hasMore: records.length < result.total });
    } catch (e) {} finally { this.setData({ loading: false }); }
  },

  onDishName(e) { this.setData({ dishName: e.detail.value }); },
  onBrandName(e) { this.setData({ brandName: e.detail.value }); },
  onPrice(e) { this.setData({ price: e.detail.value }); },
  onIngredientAmount(e) { this.setData({ ingredientAmount: e.detail.value }); },
  onRecordSearch(e) { this.setData({ recordSearch: e.detail.value }); this.loadRecords(true); },
  onCategory(e) { this.setData({ selectedCategory: e.detail.value }); },
  onPreference(e) { this.setData({ preference: this.data.preferenceOptions[e.detail.value].value }); },
  onFlavor(e) {
    const f = e.currentTarget.dataset.flavor;
    const level = Number(e.detail.value);
    const flavorLevels = this.data.flavorLevels;
    flavorLevels[f] = level;
    this.setData({ flavorLevels });
  },

  async onIngredientSearch(e) {
    const q = e.detail.value.trim();
    this.setData({ ingredientSearch: q });
    if (!q) { this.setData({ ingredientSuggestions: [] }); return; }
    try {
      const result = await api.searchIngredients(q, 50);
      this.setData({ ingredientSuggestions: result.items });
    } catch (err) { this.setData({ ingredientSuggestions: [] }); }
  },

  pickIngredient(e) {
    const idx = e.currentTarget.dataset.idx;
    const item = this.data.ingredientSuggestions[idx];
    if (!item) return;
    const amount = this.data.ingredientAmount === '' ? null : Number(this.data.ingredientAmount) || null;
    const ingredients = this.data.ingredients.concat([{ name: item.name, amount }]);
    this.setData({ ingredients, ingredientSearch: '', ingredientSuggestions: [], ingredientAmount: '' });
  },

  removeIngredient(e) {
    const idx = e.currentTarget.dataset.idx;
    const ingredients = this.data.ingredients.slice();
    ingredients.splice(idx, 1);
    this.setData({ ingredients });
  },

  flavorLabel(name) {
    const lv = this.data.flavorLevels[name] || 50;
    if (lv < 25) return '不' + name;
    if (lv < 50) return '微' + name;
    if (lv < 75) return name;
    return '太' + name;
  },

  async submit() {
    if (!this.data.ingredients.length) {
      wx.showToast({ title: '请添加原料', icon: 'none' });
      return;
    }
    const flavors = this.data.flavors.filter(f => (this.data.flavorLevels[f] || 50) > 50)
      .map(f => ({ name: f, level: this.data.flavorLevels[f] }));
    const record = {
      name: this.data.dishName,
      brand_name: this.data.brandName,
      price: this.data.price === '' ? null : Number(this.data.price),
      categories: this.data.selectedCategory ? [this.data.selectedCategory] : [],
      ingredients: this.data.ingredients,
      flavors,
      preference: this.data.preference,
      reason: '',
      image_path: '',
      image_metadata: {},
      client_key: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10),
    };
    wx.showLoading({ title: '保存中' });
    try {
      await api.submitFood(record);
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.setData({ dishName: '', brandName: '', price: '', ingredients: [], selectedCategory: '' });
      this.loadRecords(true);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  },

  loadMore() { this.loadRecords(false); },
});
