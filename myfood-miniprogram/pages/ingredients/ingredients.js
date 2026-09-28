const api = require('../../utils/api');

const PAGE_SIZE = 200;

Page({
  data: {
    newName: '',
    search: '',
    ingredients: [],
    total: 0,
    loading: false,
  },

  onShow() {
    this.loadIngredients(true);
  },

  async loadIngredients(reset) {
    this.setData({ loading: true });
    try {
      const result = await api.searchIngredients(this.data.search, PAGE_SIZE);
      this.setData({ ingredients: result.items, total: result.total });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onNewName(e) { this.setData({ newName: e.detail }); },
  onSearch(e) { this.setData({ search: e.detail }); this.loadIngredients(true); },

  async addIngredient() {
    const name = (this.data.newName || '').trim();
    if (!name) { wx.showToast({ title: '请输入原料名', icon: 'none' }); return; }
    try {
      await api.addIngredient(name);
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.setData({ newName: '' });
      this.loadIngredients(true);
    } catch (e) {
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  },
});
