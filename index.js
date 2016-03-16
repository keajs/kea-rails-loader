function camelize (str) {
  return str.replace('_', ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
  }).replace(/\s+/g, '')
}

function fetchLineWithEngine (engine, data) {
  if (engine === '$' || engine === 'jQuery') {
    return 'return ' + engine + '.ajax({method: "post", url: "/_kea", data: ' + data + '})'
  }
}

module.exports = function (source) {
  // should be ached
  this.cacheable && this.cacheable()

  // parse arguments
  var args = {}
  this.query.substr(1).split('&').forEach(function (item) {
    var s = item.split('=')
    args[s[0]] = decodeURIComponent(s[1])
  })

  // defaults
  if (!args.engine) {
    args.engine = '$'
  }
  if (!args.camelize) {
    args.camelize = 'true'
  }

  // fetch methods
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

  // create exportable js
  var exportable = []
  for (var j = 0; j < methods.length; j++) {
    var method = methods[j]

    var matched = method.match(/(.*)\(([^\)]+)\)/)
    if (matched) {
      method = matched[1]
    }

    exportable.push(
      (args.camelize === 'true' ? camelize(method) : method) + ': function (params) { ' +
        fetchLineWithEngine(args.engine, '{endpoint: "' + className + '", method: "' + method + '", params: params}') +
      '}'
    )
  }

  return 'module.exports = {' + exportable.join(',') + '}'
}
