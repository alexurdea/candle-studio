export const storage = {
  getTitle: function () {
    return localStorage.getItem('title');
  },

  saveTitle: function (title) {
    localStorage.setItem('title', title);
  },

  getData: function () {
    return JSON.parse(localStorage.getItem('data'));
  },

  saveData: function (data) {
    localStorage.setItem('data', JSON.stringify(data));
  }
};
