# jsonp-request
A simple/light module for making jsonp requests.

### API

#### jsonpRequest(options, data, callback)

options can be a url string, or an object of the form:

`
{ 
    url: <string>,
    timeout: <number>,
    callbackKey: <string>
}
`

data is an object 

callback is a node-style (err, data) callback