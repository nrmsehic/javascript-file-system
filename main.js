var fs = (() => {
  var pathname = window.location.pathname
  var dirname = pathname.substring(0, pathname.lastIndexOf('/'))


  var implode = (array, delimeter) => {
    if(delimeter !== undefined) {
      var arrStr = ""

      for(var i = 0; i < array.length; i++) {
        arrStr += array[i]

        if(i < array.length-1) arrStr += delimeter
      }

      return arrStr
    }

    var arrStr = ""

    for(var i = 0; i < array.length; i++) {
      arrStr += array[i]

      if(i < array.length -1) arrStr += ","
    }

    return arrStr
  }


  var encode = (object) => {
    //string representation of object
    var strRep = ""

    //get keys and values of object and store them in two variables
    var keys = Object.keys(object)
    var values = Object.values(object)


    //loop through all the keys and values and append them to the string

    for(var i = 0; i < keys.length; i++) {
      strRep += implode([keys[i], values[i]], '=')
      if(i < keys.length -1) strRep += "&"
    }

    return strRep
  }





  var httpPost = (url, data, cb) => {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.onreadystatechange = () => {
      if(xhr.readyState == 4 && xhr.status == 200) {
        typeof cb == 'function' ? cb.call(null, xhr.responseText): null
      }
    }

    if(typeof data == 'object') {
      xhr.send(encode(data))
    } else {
      xhr.send(data)
    }
  }

  var httpGet = (url, parameters, cb) => {
    var xhr = new XMLHttpRequest()
    var urlParams = implode([url, typeof parameters == 'object' ? encode(parameters) : parameters], '?')
    xhr.open('GET', urlParams, true)
    xhr.setRequestHeader('content-type',this)
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
        fullpath = implode([dirname, implode([params],'.')],'/')
      } else {
        fullpath = implode([dirname, implode([params[0],'txt'],'.')],'/')
      }


      httpGet(fullpath, {open:true}, (response) => {
        console.log(response)
      })
    },
    view: (filename) => {
      var params = filename.split('.')
      var fullpath;

      if(params.length == 2) {
        //contains file extension
        fullpath = implode([dirname, implode([params],'.')],'/')
      } else {
        fullpath = implode([dirname, implode([params[0], 'html'],'.')],'/')
      }

      httpGet(fullpath, {open: true}, (response) => {
        document.innerHTML = response
      })
    }
  }


})()
