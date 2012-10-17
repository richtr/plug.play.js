/*
 * Network Service Discovery getNetworkServices test environment.
 *
 * WARNING: This script will break navigator.getNetworkServices and XMLHttpRequest on pages
 * where this script is run in order to give us a testable environment !!!!
 *
 * Do not use this script other than as a test harness for Plug.Play!
 *
 */

!(function( global, undefined ) {

  // Replace navigator.getNetworkServices

  var NetworkService = global.NetworkService = function( opts ) {
    var uid = opts.type + "#" + Math.floor(Math.random() * 1e16);

    this.name = uid;
    this.id = uid;
    this.type = opts.type;
    this.url = opts.url;

    return this;
  };

  global.navigator.getNetworkServices = function( serviceType, callback ) {

    var mockNetworkServices = [];
    
    mockNetworkServices.push( new NetworkService({
      type: 'upnp:responseCheck',
      url: 'test001'
    }) );
    
    mockNetworkServices.push( new NetworkService({
      type: 'upnp:requestCheck',
      url: 'test002'
    }) );

    // Pass mockNetworkServices back to callee
    callback.apply(undefined, [ mockNetworkServices ]);

  };

  // Service response template

  var responseTemplate = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
   "<s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" " +
     "xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
     "\t<s:Body>\n" +
       "\t\t<u:{ACTION_NAME}Response xmlns:u=\"{ACTION_TYPE}\">\n" +
         "{ACTION_VARS}" +
       "\t\t</u:{ACTION_NAME}Response>\n" +
     "\t</s:Body>\n" +
   "</s:Envelope>\n";

  // Replace window.XMLHttpRequest

  global.XMLHttpRequest.prototype.open = function(method, url) {
    this.url = url;
  };

  global.XMLHttpRequest.prototype.setRequestHeader = function() {};
  
  global.XMLHttpRequest.prototype.send = function( postData ) {

    var responseData, responseDataParams = '';

    function returnObj( responseStr ) {

      this.readyState = 4;
      this.status = 200;
      this.responseText = responseStr;
      this.responseXML = ( new window.DOMParser() ).parseFromString( responseStr , "text/xml");

    };

    // Test switching
    switch( this.url ) {
      case 'test001': // response parameter checking
        responseData = {
          "I1": "-127",
          "I2": "-32767",
          "I4": "-2147483647",
          "Ui1": "254",
          "Ui2": "65534",
          "Ui4": "4294967294",
          "Int": expandExponential("1.79e+308"),
          "R4": expandExponential("1.1600000535724016e-38"),
          "R8": expandExponential("-1.78e+308"),
          "Number": expandExponential("-1.78e+308"),
          "Fixed_14_4": "99999999999999.9999",
          "Float": expandExponential("1.78e+308"),
          "Boolean": "false",
          "Char": "a",
          "String": "aString",
          "Date": "2012-10-15",
          "DateTime": "2012-10-15T11:45:00.500Z",
          "DateTime_tz": "2012-10-15T11:45:00.500+0200",
          "Time": "11:45:00.500",
          "Time_tz": "11:45:00.500+0200",
          "Bin_base64": "SGVyZSBpcyBhIHN0cmluZyBvZiB0ZXh0",
          "Bin_hex": "48657265206973206120737472696e67206f662074657874",
          "Uri": "http://en.wikipedia.org/wiki/URI?foo=bar&baz=quux#Examples_of_URI_references",
          "Uuid": "550e8400-e29b-41d4-a716-446655440000"
        };
        // Build the XML response document
        var svcMsg = responseTemplate.replace(/\{ACTION_NAME\}/g, this.url);
        for( var prop in responseData ) {
          responseDataParams += "\t\t\t<" + prop + ">    " + encodeXML(trim(responseData[ prop ] + "")) + "  </" + prop + ">\n";
        }
        responseData = svcMsg.replace(/\{ACTION_VARS\}/g, responseDataParams);
        break;
      case 'test002': // request parameter checking
        responseData = postData.replace(new RegExp(this.url, "g"), this.url + "Response");
        break;
      default:
        responseData = postData;
        break;
    }

    // Invoke onreadystatechange function
    this.onreadystatechange.call( new returnObj( responseData ) );

  };

// Helper functions

  function expandExponential( str ){
      return str.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function(x, s, n, f, c){
          var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
          c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
          z = (new Array(c + 1)).join("0"), r = n + f;
          return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
      });
  };

  // STRING FUNCTIONS

  var trim = function( str ) {
    if(String.prototype.trim) {
      return str.trim();
    } else {
      return str.replace(/^\s+|\s+$/g, "");
    }
  };

  var encodeXML = function ( str ) {
    return str.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;');
  };

  var decodeXML = function ( str ) {
    return str.replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
  };

})( this );