module.exports = function (source) {
  this.cacheable && this.cacheable()

  var className = ''
  var methods = []
  var lines = source.split("\n")
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (line.match(/^class /)) {
      className = line.split('class ')[1].split('<')[0].trim()
    }

    if (line.match(/^ +def /)) {
      methods.push(line.replace(/^ +def /, ''))
    }

    if (line.match(/^ *private *$/) || line.match(/^ *protected *$/)) {
      break
    }
  }

  var exportable = []

  for (var j = 0; j < methods.length; j++) {
    var method = methods[j]
    var params = []

    var matched = method.match(/(.*)\(([^\)]+)\)/)

    if (matched) {
      method = matched[1]
      params = matched[2].split(',').map(a => a.split(/[:=]/)[0].trim())
    }

    exportable.push(
      method + ': function(params) { ' +
        'return $.ajax({method: "post", url: "/_kea", data: ' + '{endpoint: "' + className + '", method: "' + method + '", params: params}}) ' +
      '}'
    )
  }

  return 'module.exports = {' + exportable.join(',') + '}'
}
