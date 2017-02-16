import {storage} from './storage';

export class Title {
  constructor (selector, val='New Pattern') {
    this._el = document.querySelector(selector);
    if (!this._el) throw new Error('Could not find title element based on provided selector ' + selector);

    this.value = val;
    this._el.contentEditable = true;

    this._el.addEventListener('keydown', function (ev) {
      if (ev.keyCode === 13 || ev.keyCode === 10) {
        ev.preventDefault();
        this._el.blur();
        storage.saveTitle(this._el.textContent);
      }
    }.bind(this));
  }

  set value (val) {
    this._val = val;
    this._el.textContent = val;
  }

  get value () {
    return this._val;
  }
};
