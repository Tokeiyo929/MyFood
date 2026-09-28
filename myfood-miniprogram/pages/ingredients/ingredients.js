const api = require('../../utils/api');

Page({
  data: {
    newName: '',
    ingredients: [],
    page: 1,
    total: 0,
  },

  onShow() {
    this.loadIngredients(true);
  },

  async loadIngredients(reset) {
    const page = reset ? 1 : this.data.page + 1;
    try {
      const result = await api.searchIngredients('', 100);
      this.setData({ ingredients: result.items, total: result.total, page });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onNewName(e) { this.setData({ newName: e.detail.value }); },

  async addIngredient() {
    const name = this.data.newName.trim();
    if (!name) return;
    try {
      await api.addIngredient(name);
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.setData({ newName: '' });
      this.loadIngredients(true);
    } catch (e) {
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  },

  loadMore() { this.loadIngredients(false); },
});
