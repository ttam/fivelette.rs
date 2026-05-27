if (Array.prototype.hasOwnProperty('toUnique') === false) {
    Array.prototype.toUnique = function () {
        return [...new Set(this)];
    };
}
