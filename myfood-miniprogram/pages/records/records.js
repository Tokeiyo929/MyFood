const api = require('../../utils/api');

Page({
  data: {
    settings: null,
    dishName: '',
    brandName: '',
    price: '',
    ingredientSearch: '',
    ingredientSuggestions: [],
    ingredientAmount: '',
    ingredients: [],
    records: [],
    recordSearch: '',
    page: 1,
    hasMore: true,
    loading: false,
  },

  onLoad() {
    this.loadConfig();
    this.loadRecords(true);
  },

  onShow() {
    if (this.data.settings) this.loadRecords(true);
  },

  async loadConfig() {
    try {
      const config = await api.getConfig();
      this.setData({ settings: config });
    } catch (e) {
      wx.showToast({ title: '配置加载失败', icon: 'none' });
    }
  },

  async loadRecords(reset) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const page = reset ? 1 : this.data.page + 1;
    try {
      const result = await api.getFoods(page, 20, this.data.recordSearch);
      const records = reset ? result.items : this.data.records.concat(result.items);
      this.setData({ records, page, hasMore: records.length < result.total });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onDishName(e) { this.setData({ dishName: e.detail.value }); },
  onBrandName(e) { this.setData({ brandName: e.detail.value }); },
  onPrice(e) { this.setData({ price: e.detail.value }); },
  onIngredientAmount(e) { this.setData({ ingredientAmount: e.detail.value }); },
  onRecordSearch(e) {
    this.setData({ recordSearch: e.detail.value });
    this.loadRecords(true);
  },

  async onIngredientSearch(e) {
    const q = e.detail.value.trim();
    this.setData({ ingredientSearch: q });
    if (!q) { this.setData({ ingredientSuggestions: [] }); return; }
    try {
      const result = await api.searchIngredients(q, 50);
      this.setData({ ingredientSuggestions: result.items });
    } catch (err) {
      this.setData({ ingredientSuggestions: [] });
    }
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

  ingredientLabel(item) {
    if (!item.amount) return item.name;
    return item.name + '(' + item.amount + '%)';
  },

  async submit() {
    if (!this.data.ingredients.length) {
      wx.showToast({ title: '请添加原料', icon: 'none' });
      return;
    }
    const record = {
      name: this.data.dishName,
      brand_name: this.data.brandName,
      price: this.data.price === '' ? null : Number(this.data.price),
      categories: [],
      ingredients: this.data.ingredients,
      flavors: [],
      preference: '偏好吃',
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
      this.setData({ dishName: '', brandName: '', price: '', ingredients: [] });
      this.loadRecords(true);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  },

  loadMore() {
    this.loadRecords(false);
  },
});
