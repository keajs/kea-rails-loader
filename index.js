function camelize (str) {
  return str.replace(/_/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
  }).replace(/\s+/g, '')
}

function fetchLineWithEngine (endpoint, engine, data) {
  if (engine === '$' || engine === 'jQuery') {
    return 'return ' + engine + '.ajax({method: "post", url: "' + endpoint + '", data: ' + data + '})'
  } else if (engine === 'fetch') {
    return 'return fetch("' + endpoint + '", {method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify(' + data + ')}).then(function(response) { return response.json() })'
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
    args.engine = 'fetch'
  }
  if (!args.camelize) {
    args.camelize = 'true'
  }
  if (!args.endpoint) {
    args.endpoint = '/_kea.json'
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
        fetchLineWithEngine(args.endpoint, args.engine, '{endpoint: "' + className + '", method: "' + method + '", params: params}') +
      '}'
    )
  }

  return 'module.exports = {' + exportable.join(',') + '}'
}
