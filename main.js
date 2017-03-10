var jfs = (() => {


  var getDirectory = (pathname) => {
    return pathname.substring(0, pathname.lastIndexOf('/'))
  }

  var config = {
    http: {
      post: {
        contentType: 'application/x-www-form-urlencoded',
        responseType: 'text'
      },
      get: {
        contentType: 'text/plain',
        responseType: 'text'
      }
    },
    path: {
      pathname: window.location.pathname,
      dirname: getDirectory(window.location.pathname)
    },
    resource: {
      implode: (array, delimeter) => {
        if(delimeter !== undefined) {
          var arrstr = ""

          for(var i = 0; i < array.length; i++) {
            arrstr += array[i]
            arrstr += i < array.length-1 ? delimeter: ""
          }

          return arrstr
        }

        var arrstr = ""

        for(var i = 0; i < array.length; i++) {
          arrstr += array[i]
          arrstr += i < array.length-1 ? "," : ""
        }

        return arrstr

      },
      encode: (object) => {
        var strrep = ""
        var keys = Object.keys(object)
        var values = Object.values(object)

        for(var i = 0; i < keys.length; i++) {
          strrep += keys[i] + "=" + values[i]
          strrep += i < keys.length-1 ? "&":""
        }

        return strrep
      },
      grabFunction: (FieldName) => {

        return {
          source: (bulk) => {
            return bulk.substring(bulk.indexOf(FieldName), bulk.indexOf('}', bulk.indexOf(FieldName))+1)
          }
        }

      }
    },
    server: {
      hostname: 'localhost',
      port: 8000,
      virtualhost: false,
      projectname: 'javascript-file-system'
    }
  }

  var httpPost = (url, data, cb) => {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', config.http.post.contentType)
    xhr.onreadystatechange = () => {
      if(xhr.readyState == 4 && xhr.status == 200) {
        typeof cb == 'function' ? cb.call(null, xhr.responseText): null
      }
    }

    if(typeof data == 'object') {
      xhr.send(config.resource.encode(data))
    } else {
      xhr.send(data)
    }
  }

  var httpGet = (url, parameters, cb) => {
    var xhr = new XMLHttpRequest()
    var urlParams = config.resource.implode([url, typeof parameters == 'object' ? config.resource.encode(parameters) : parameters], '?')
    xhr.open('GET', urlParams, true)
    xhr.setRequestHeader('content-type', config.http.get.contentType)
    xhr.onreadystatechange = () => {
      if(xhr.readyState == 4 && xhr.status == 200) {
        typeof cb == 'function' ? cb.call(null, xhr.responseText) : null
      }
    }

    xhr.send(null)
  }

  return {

    //requires current directory
    read: (filename) => {
      var params = filename.split('.')
      var fullpath;

      if(params.length == 2) {
        fullpath = config.resource.implode([config.path.dirname, filename], '/')
      } else {
        fullpath = config.resource.implode([config.path.dirname, config.resource.implode([params[0],'txt'],'.')],'/')
      }

      config.http.get.contentType = 'text/plain'
      httpGet(fullpath, {open:true}, (response) => {
        console.log(response)
      })


    },
    view: (filename) => {
      var params = filename.split('.')
      var fullpath;

      if(params.length == 2) {
        //contains file extension
        fullpath = config.resource.implode([config.path.dirname, filename], '/')
      } else {
        fullpath = config.resource.implode([config.path.dirname, config.resource.implode([params[0], 'html'],'.')],'/')
      }
      config.http.get.contentType = 'text/html'
      httpGet(fullpath, {open: true}, (response) => {
        document.innerHTML = response
      })
    },
    import: (filename) => {
      var params = filename.split('.')
      var fullpath;

      var scriptTag = document.createElement('script')

      if(params.length == 2) {
        fullpath = config.resource.implode([config.path.dirname, filename], '/')
      } else {
        fullpath = config.resource.implode([config.path.dirname, config.resource.implode([params[0], 'js'],'.')],'/')
      }

      config.http.get.contentType = 'text/javascript'
      httpGet(fullpath, {}, (response) => {
        scriptTag.innerHTML = response
        document.head.prepend(scriptTag)
      })

    },
    executeJS: (params) => {
      var args = params.split('/')
      var functionName = args.pop()
      var filename = config.resource.implode([args.join('/'), 'js'], '.')
      var fullpath = config.resource.implode([config.path.dirname, filename],'/')

      config.http.get.contentType = 'text/javascript'
      httpGet(fullpath, {}, (response) => {
        const exec = config.resource.grabFunction(functionName).source(response)
      })

    }
  }


})()
