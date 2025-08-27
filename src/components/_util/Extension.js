/**
 * 【Array】删除
 * ------------------------------------------
 * @param condition {Any} 查找条件
 * @param isFirstObj {Boolean} 是否只删除第一条数据
 */
Array.prototype.remove = function (condition, isFirstObj) {
    let _removeList = [];

    for (let i = 0; i < this.length; i++) {
        if (typeof condition === "function") {
            if (condition(this[i], i)) {
                _removeList = _removeList.concat(this.splice(i, 1));
                i--;
            }
        }
        else if (this[i] == condition || (Number.isNaN(this[i]) && Number.isNaN(condition))) {
            _removeList = _removeList.concat(this.splice(i, 1));
            i--;
        }

        if (isFirstObj && _removeList.length === 1) {
            break;
        }
    }

    return isFirstObj ? (_removeList.length > 0 ? _removeList[0] : null) : _removeList;
};