function camelize (str) {
  return str.replace(/_/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
  }).replace(/\s+/g, '')
}

function fetchLineWithEngine (endpoint, engine, data) {
  if (engine === '$' || engine === 'jQuery') {
    return 'return ' + engine + '.ajax({method: "post", url: "' + endpoint + '", data: ' + data + '})'
  } else if (engine === 'fetch') {
    return 'var qs = document.querySelector("meta[name=csrf-token]"); ' +
            'return fetch("' + endpoint + '", ' +
            '{method: "post", ' +
              'headers: {' +
                '"Accept": "application/json", ' +
                '"Content-Type": "application/json", ' +
                '"X-CSRF-Token": qs && qs.content' +
              '}, ' +
              'body: JSON.stringify(' + data + ').replace(/[\\u007F-\\uFFFF]/g, function (c) { return "\\\\u" + ("0000" + c.charCodeAt(0).toString(16)).substr(-4); }), ' +
              'credentials: "same-origin"' +
            '}).then(function(response) { return response.json() })'
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

    if (line.match('# class: ') && !className) {
      className = line.split('# class: ')[1].split('<')[0].trim()
    }

    if (line.match(/^class /) && !className) {
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
