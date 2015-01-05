// A polyfill for endsWith that should be in another file
if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, 'endsWith', {
    value: function (searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }
  });
}

Object.defineProperty(String.prototype, 'strip', {
  value: function(){
    var subjectString = this.toString();
    return subjectString.replace(/^\s+/,"").replace(/\s+$/, "")
  }
})
