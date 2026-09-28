const api = require('../../utils/api');

Page({
  data: {
    groups: [],          // [{parent, items: [...]}]
    expandedParent: null,
    modal: null,         // {name, foods}
    loading: false,
  },

  onLoad() { this.loadCategories(); },

  async loadCategories() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const result = await api.getCategories();
      const items = result.items || [];
      const map = {};
      items.forEach(item => {
        const parent = item.parentcategories || '未分类';
        (map[parent] = map[parent] || []).push(item);
      });
      const groups = Object.keys(map).map(parent => ({ parent, items: map[parent] }));
      this.setData({ groups });
    } catch (e) {} finally { this.setData({ loading: false }); }
  },

  toggleGroup(e) {
    const parent = e.currentTarget.dataset.parent;
    this.setData({ expandedParent: this.data.expandedParent === parent ? null : parent });
  },

  async openCategory(e) {
    const name = e.currentTarget.dataset.name;
    const parent = e.currentTarget.dataset.parent;
    try {
      // 查询该类别下的食物
      const result = await api.getFoodsByCategory(parent, 200);
      const foods = (result.items || []).filter(f => (f.categories || []).includes(name) || (f.categories || []).includes(parent));
      this.setData({ modal: { name, foods } });
    } catch (err) {
      this.setData({ modal: { name, foods: [] } });
    }
  },

  closeModal() { this.setData({ modal: null }); },
});
