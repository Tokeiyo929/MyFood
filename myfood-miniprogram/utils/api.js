// API 基础地址：Render 部署的公网 HTTPS 地址
const BASE_URL = "https://myfood-4wg0.onrender.com";

function request(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + path,
      method,
      data,
      header: {
        "Content-Type": "application/json",
      },
      timeout: 20000,
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject(new Error("请求失败 HTTP " + res.statusCode));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "网络错误"));
      },
    });
  });
}

// 图片上传（wx.uploadFile 到 /api/upload）
function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + "/api/upload",
      filePath,
      name: "image",
      formData: {},
      timeout: 30000,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (res.statusCode === 200) resolve(data);
          else reject(new Error(data.error || "上传失败"));
        } catch (e) {
          reject(new Error("上传失败：无法解析响应"));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || "上传失败")),
    });
  });
}

// ---- 配置 ----
function getConfig() {
  return request("/api/config");
}

// ---- 食物记录 ----
function getFoods(page, limit, search) {
  let qs = `page=${page}&limit=${limit}`;
  if (search) qs += `&search=${encodeURIComponent(search)}`;
  return request(`/api/foods?${qs}`);
}
function getFoodsByCategory(parentName, limit) {
  return request(`/api/foods?category=${encodeURIComponent(parentName)}&limit=${limit}`);
}
function submitFood(record) {
  return request("/api/foods", "POST", record);
}
function updateFoodPreference(id, preference, reason) {
  return request(`/api/foods/${id}`, "PATCH", { preference, reason });
}

// ---- 原料 ----
function searchIngredients(search, limit) {
  let qs = search ? `?search=${encodeURIComponent(search)}&limit=${limit}` : ``;
  return request(`/api/ingredients${qs}`);
}
function addIngredient(name) {
  return request("/api/ingredients", "POST", { name });
}

// ---- 产品类别 ----
function getCategories() {
  return request("/api/categories");
}

module.exports = {
  BASE_URL,
  getConfig,
  getFoods,
  getFoodsByCategory,
  submitFood,
  updateFoodPreference,
  searchIngredients,
  addIngredient,
  getCategories,
  uploadImage,
};
