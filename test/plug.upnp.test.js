
(function( global, undefined ) {

  navigator.getNetworkServices('upnp:testService1', function( services ) {

    runTests( services );

  });

  function runTests( services ) {
    
    // Setup test services
    
    var requestTestService = new Plug.UPnP( services[1] );
    
    var responseTestService = new Plug.UPnP( services[0] );

    // API tests

    describe('Basic API tests', function() {
      
      it('Parameter formatting check 1', function() {
        
          var inputParamObj = Plug.UPnP.prototype.formatParameters({ Int: 0 });

          var outputParamObj = { 
            "request": { 
              "Int": { 
                "value": 0
              } 
            }, 
            "response": {} 
          };
          
          assert.deepEqual( inputParamObj, outputParamObj );
          
      });
      
      it('Parameter formatting check 2', function() {
        
          var inputParamObj = Plug.UPnP.prototype.formatParameters({ 
            Int: 1, 
            "Bool": { 
              type: 'boolean', 
              value: 'true' 
            } 
          });

          var outputParamObj = { 
            "request": { 
              "Int": { 
                "value": 1
              },
              "Bool": { 
                "value": 'true',
                "type": 'boolean'
              } 
            }, 
            "response": {} 
          };
          
          assert.deepEqual( inputParamObj, outputParamObj );
          
      });
      
      it('Parameter formatting check 3', function() {
        
          var inputParamObj = Plug.UPnP.prototype.formatParameters({ 
            Int: 1, 
            "request": { 
              "Bool": { 
                type: 'boolean', 
                value: 'true' 
              } 
            } 
          });

          var outputParamObj = { 
            "request": { 
              "Int": { 
                "value": 1
              },
              "Bool": { 
                "value": 'true',
                "type": 'boolean'
              } 
            }, 
            "response": {} 
          };
          
          assert.deepEqual( inputParamObj, outputParamObj );
          
      });
      
      it('Parameter formatting check 4', function() {
        
          var date = new Date();
        
          var inputParamObj = Plug.UPnP.prototype.formatParameters({ 
            "Date": {
              value: date, 
              allowedValueList: "" // should be converted to an empty array
            }, 
            request: { 
              "Bool": { 
                type: 'boolean', 
                value: true 
              }, 
              "Obj": { 
                type: 'quux', // unknown type should be removed by parser
                value: /.*/ 
              } 
            } 
          });

          var outputParamObj = { 
            "request": { 
              "Date": { 
                "value": date,
                "allowedValueList": []
              },
              "Bool": { 
                "value": true,
                "type": 'boolean'
              },
              "Obj": { 
                "value": /.*/
              }
            }, 
            "response": {} 
          };
          
          assert.deepEqual( inputParamObj, outputParamObj );
          
      });
      
      it('UPnP XML Request generation test 1', function() {
        
          var upnpXmlMsg = Plug.UPnP.prototype.createRequest("foo", "doAction", {});

          var upnpXmlMsg_expected = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
           "<s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" " +
             "xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
             "\t<s:Body>\n" +
               "\t\t<u:doAction xmlns:u=\"foo\">\n" +
               "\t\t</u:doAction>\n" +
             "\t</s:Body>\n" +
           "</s:Envelope>\n";
          
          assert.strictEqual( upnpXmlMsg, upnpXmlMsg_expected );
          
      });
      
      it('UPnP XML Request generation test 2', function() {
        
          var upnpXmlMsg = Plug.UPnP.prototype.createRequest("foo&<>bar", "do><&Action", {});

          var upnpXmlMsg_expected = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
           "<s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" " +
             "xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
             "\t<s:Body>\n" +
               "\t\t<u:do&gt;&lt;&amp;Action xmlns:u=\"foo&amp;&lt;&gt;bar\">\n" +
               "\t\t</u:do&gt;&lt;&amp;Action>\n" +
             "\t</s:Body>\n" +
           "</s:Envelope>\n";
          
          assert.strictEqual( upnpXmlMsg, upnpXmlMsg_expected );
          
      });
      
      it('UPnP XML Request generation test 2', function() {
        
          var upnpXmlMsg = Plug.UPnP.prototype.createRequest("foo&<>bar", "do><&Action", { Str1: "0", Str2: "1", Str3: "-1" });

          var upnpXmlMsg_expected = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
           "<s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" " +
             "xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
             "\t<s:Body>\n" +
               "\t\t<u:do&gt;&lt;&amp;Action xmlns:u=\"foo&amp;&lt;&gt;bar\">\n" +
                  "\t\t\t<Str1>0</Str1>\n" +
                  "\t\t\t<Str2>1</Str2>\n" +
                  "\t\t\t<Str3>-1</Str3>\n" +
               "\t\t</u:do&gt;&lt;&amp;Action>\n" +
             "\t</s:Body>\n" +
           "</s:Envelope>\n";
          
          assert.strictEqual( upnpXmlMsg, upnpXmlMsg_expected );
          
      });
      
    });
    
    // Type tests

    describe('UPnP Request Type Conversion Checking', function() {

      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, -127, "-127");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, -32767, "-32767");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, -2147483647, "-2147483647");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 254, "254");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, 65534, "65534");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, 4294967294, "4294967294");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, 1.79e+308, "179000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, 1.1600000535724016e-38, "0.000000000000000000000000000000000000011600000535724016");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, -1.78e+308, "-178000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
      requestCheckTest(requestTestService, 'Number', Plug.UPnP.prototype.types.number, -1.78e+308, "-178000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
      requestCheckTest(requestTestService, 'Fixed_14_4', Plug.UPnP.prototype.types.fixed_14_4, 99999999999999.9999, "100000000000000");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, 1.78e+308, "178000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, false, "0");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "aString", "a");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, "   aString ", "aString");
      requestCheckTest(requestTestService, 'Date', Plug.UPnP.prototype.types.date, new Date( parseDate("2012-10-15") ), new Date( parseDate("2012-10-15") ).getTime());
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, new Date( parseDate("2012-10-15T11:45:00.500Z") ), new Date( parseDate("2012-10-15T11:45:00.500Z") ).getTime());
      requestCheckTest(requestTestService, 'DateTime_tz', Plug.UPnP.prototype.types.dateTime_tz, new Date( parseDate("2012-10-15T11:45:00.500+0200") ), new Date( parseDate("2012-10-15T11:45:00.500+0200") ).getTime());
      requestCheckTest(requestTestService, 'Time', Plug.UPnP.prototype.types.time, new Date( parseDate("11:45:00Z") ), new Date( parseDate("11:45:00Z") ).getTime());
      requestCheckTest(requestTestService, 'Time_tz', Plug.UPnP.prototype.types.time_tz, new Date( parseDate("11:45:00.500+0200") ), new Date( parseDate("11:45:00.500+0200") ).getTime());
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, 'Here is a string of text', "SGVyZSBpcyBhIHN0cmluZyBvZiB0ZXh0");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, 'Here is a string of text', "48657265206973206120737472696e67206f662074657874");
      requestCheckTest(requestTestService, 'Uri', Plug.UPnP.prototype.types.uri, 'http://en.wikipedia.org/wiki/URI?foo=bar&baz=quux#Examples_of_URI_references', 'http://en.wikipedia.org/wiki/URI?foo=bar&baz=quux#Examples_of_URI_references');
      requestCheckTest(requestTestService, 'Uuid', Plug.UPnP.prototype.types.uuid, '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000');

    });

    describe('UPnP Response Type Conversion Checking', function() {

      responseCheckTest(responseTestService, 'I1', Plug.UPnP.prototype.types.i1, -127);
      responseCheckTest(responseTestService, 'I2', Plug.UPnP.prototype.types.i2, -32767);
      responseCheckTest(responseTestService, 'I4', Plug.UPnP.prototype.types.i4, -2147483647);
      responseCheckTest(responseTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 254);
      responseCheckTest(responseTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, 65534);
      responseCheckTest(responseTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, 4294967294);
      responseCheckTest(responseTestService, 'Int', Plug.UPnP.prototype.types.int, 1.79e+308);
      responseCheckTest(responseTestService, 'R4', Plug.UPnP.prototype.types.r4, 1.1600000535724016e-38);
      responseCheckTest(responseTestService, 'R8', Plug.UPnP.prototype.types.r8, -1.78e+308);
      responseCheckTest(responseTestService, 'Number', Plug.UPnP.prototype.types.number, -1.78e+308);
      responseCheckTest(responseTestService, 'Fixed_14_4', Plug.UPnP.prototype.types.fixed_14_4, 99999999999999.9999);
      responseCheckTest(responseTestService, 'Float', Plug.UPnP.prototype.types.float, 1.78e+308);
      responseCheckTest(responseTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, false);
      responseCheckTest(responseTestService, 'Char', Plug.UPnP.prototype.types.char, 'a');
      responseCheckTest(responseTestService, 'String', Plug.UPnP.prototype.types.string, 'aString');
      responseCheckTest(responseTestService, 'Date', Plug.UPnP.prototype.types.date, new Date( parseDate("2012-10-15") ).getTime() );
      responseCheckTest(responseTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, new Date( parseDate("2012-10-15T11:45:00.500Z") ).getTime() );
      responseCheckTest(responseTestService, 'DateTime_tz', Plug.UPnP.prototype.types.dateTime_tz, new Date( parseDate("2012-10-15T11:45:00.500+0200") ).getTime() );
      responseCheckTest(responseTestService, 'Time', Plug.UPnP.prototype.types.time, new Date( parseDate("11:45:00.500Z") ).getTime() );
      responseCheckTest(responseTestService, 'Time_tz', Plug.UPnP.prototype.types.time_tz, new Date( parseDate("11:45:00.500+0200") ).getTime() );
      responseCheckTest(responseTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, 'Here is a string of text');
      responseCheckTest(responseTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, 'Here is a string of text');
      responseCheckTest(responseTestService, 'Uri', Plug.UPnP.prototype.types.uri, 'http://en.wikipedia.org/wiki/URI?foo=bar&baz=quux#Examples_of_URI_references');
      responseCheckTest(responseTestService, 'Uuid', Plug.UPnP.prototype.types.uuid, '550e8400-e29b-41d4-a716-446655440000');

    });
    
    describe('UPnP Request Type Conversion: i1', function() {
      
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, null, "0");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, undefined, "0");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, "", "0");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, "aString", "0");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, NaN, "0");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, false, "0");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, true, "1");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, /.*/, "0");

      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, "-20", "-20");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, -20.0, "-20");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, "20", "20");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, 20.0, "20");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, 1e2, "100");
      // out-of-bounds
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, 240, "-16");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, "240", "-16");
      requestCheckTest(requestTestService, 'I1', Plug.UPnP.prototype.types.i1, -240.00, "16");
      
    });
    
    describe('UPnP Request Type Conversion: i2', function() {
      
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, null, "0");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, undefined, "0");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, "", "0");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, "aString", "0");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, NaN, "0");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, false, "0");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, true, "1");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, /.*/, "0");

      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, "-32760", "-32760");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, -32760.0, "-32760");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, "32760", "32760");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, 32760.0, "32760");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, -1e4, "-10000");
      // out-of-bounds
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, -67000, "-1464");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, "67000", "1464");
      requestCheckTest(requestTestService, 'I2', Plug.UPnP.prototype.types.i2, 67000.00, "1464");
      
    });
    
    describe('UPnP Request Type Conversion: i4', function() {
      
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, null, "0");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, undefined, "0");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, "", "0");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, "aString", "0");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, NaN, "0");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, false, "0");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, true, "1");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, /.*/, "0");

      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, "-2147483642", "-2147483642");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, -2147483642.0, "-2147483642");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, "2147483642", "2147483642");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, 2147483642.0, "2147483642");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, -1e8, "-100000000");
      // out-of-bounds
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, -4294967200, "96");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, "4294967200", "-96");
      requestCheckTest(requestTestService, 'I4', Plug.UPnP.prototype.types.i4, 4294967200.00, "-96");
      
    });
    
    describe('UPnP Request Type Conversion: ui1', function() {
      
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, null, "0");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, undefined, "0");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, "", "0");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, "aString", "0");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, NaN, "0");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, false, "0");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, true, "1");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, /.*/, "0");

      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, "-20", "236");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, -20.0, "236");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, "20", "20");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 20.0, "20");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 240, "240");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 1e1, "10");
      // out-of-bounds
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 600, "88");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, "600", "88");
      requestCheckTest(requestTestService, 'Ui1', Plug.UPnP.prototype.types.ui1, 600.00, "88");
      
    });
    
    describe('UPnP Request Type Conversion: ui2', function() {

      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, null, "0");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, undefined, "0");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui1, "", "0");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, "aString", "0");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, NaN, "0");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, false, "0");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, true, "1");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, /.*/, "0");

      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, "-20", "65516");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, -20.0, "65516");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, "20", "20");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, 65530.0, "65530");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, 65530, "65530");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui2, -1e4, "55536");
      // out-of-bounds
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, -67000, "64072");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, "67000", "1464");
      requestCheckTest(requestTestService, 'Ui2', Plug.UPnP.prototype.types.ui2, 67000.00, "1464");
      
    });
    
    describe('UPnP Request Type Conversion: ui4', function() {

      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, null, "0");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, undefined, "0");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, "", "0");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, "aString", "0");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, NaN, "0");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, false, "0");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, true, "1");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, /.*/, "0");

      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, "-2147483642", "2147483654");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, -2147483642.0, "2147483654");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, "4294967200", "4294967200");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, 4294967200.0, "4294967200");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, -1e8, "4194967296");
      // out-of-bounds
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, -4294967200, "96");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, "8294967200", "3999999904");
      requestCheckTest(requestTestService, 'Ui4', Plug.UPnP.prototype.types.ui4, 8294967200.00, "3999999904");
      
    });
    
    describe('UPnP Request Type Conversion: int', function() {

      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, null, "0");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, undefined, "0");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, "", "0");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, "aString", "0");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, NaN, "0");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, false, "0");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, true, "1");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, /.*/, "0");

      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, "-2147483642", "-2147483642");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, -2147483642.0, "-2147483642");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, "4294967200", "4294967200");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, 4294967200.0, "4294967200");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, -1e8, "-100000000");
      // out-of-bounds
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, -429496720000, "-429496720000");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, "829496720000", "829496720000");
      requestCheckTest(requestTestService, 'Int', Plug.UPnP.prototype.types.int, 829496720000.00, "829496720000");
      
    });
    
    describe('UPnP Request Type Conversion: r4', function() {

      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, null, "0");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, undefined, "0");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, "", "0");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, "aString", "0");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, NaN, "0");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, false, "0");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, true, "1");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, /.*/, "0");

      // account for floating point rounding errors
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, "-214746.4375", "-214746.4375");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, -214746.4375, "-214746.4375");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, "429496.71875", "429496.71875");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, 429496.71875, "429496.71875");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, -1.04e-8, "-0.000000010399999972321439");

      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, -419496.96875, "-419496.96875");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, "82949.86718750", "82949.8671875");
      requestCheckTest(requestTestService, 'R4', Plug.UPnP.prototype.types.r4, 82949.86718750, "82949.8671875");
      
    });
    
    describe('UPnP Request Type Conversion: r8', function() {

      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, null, "0");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, undefined, "0");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, "", "0");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, "aString", "0");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, NaN, "0");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, false, "0");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, true, "1");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, /.*/, "0");

      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, "-2147464375.3424", "-2147464375.3424");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, -2147464375.3424, "-2147464375.3424");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, "42949671875.2342", "42949671875.2342");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, 42949671875.2342, "42949671875.2342");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, -1.04e-16, "-0.000000000000000104");

      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, -41949696875.3432, "-41949696875.3432");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, "829498671875.340", "829498671875.34");
      requestCheckTest(requestTestService, 'R8', Plug.UPnP.prototype.types.r8, 829498671875.34, "829498671875.34");
      
    });
    
    describe('UPnP Request Type Conversion: float', function() {

      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, null, "0");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, undefined, "0");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, "", "0");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, "aString", "0");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, NaN, "0");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, /.*/, "0");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, 0, "0");

      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, "-2147464375.3424", "-2147464375.3424");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, -2147464375.3424, "-2147464375.3424");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, "42949671875.2342", "42949671875.2342");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, 42949671875.2342, "42949671875.2342");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, -1.04e-16, "-0.000000000000000104");

      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, -41949696875.3432, "-41949696875.3432");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, "829498671875.340", "829498671875.34");
      requestCheckTest(requestTestService, 'Float', Plug.UPnP.prototype.types.float, 829498671875.34, "829498671875.34");
      
    });
    
    describe('UPnP Request Type Conversion: char', function() {

      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, null, "");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, undefined, "");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "aString", "a");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "", "");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, 0, "0");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, NaN, "");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, /.*/, "");

      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "2147464375.3424", "2");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, -2147464375.3424, "-");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "4294967", "4");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, 4294967, "4");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "<baz>", "<");
      requestCheckTest(requestTestService, 'Char', Plug.UPnP.prototype.types.char, "&&&&&&", "&");
      
    });
    
    describe('UPnP Request Type Conversion: string', function() {

      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, "", "");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, null, "");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, undefined, "");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, 0, "0");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, NaN, "");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, /.*/, "");

      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, "2147464375.3424", "2147464375.3424");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, -2147464375.3424, "-2147464375.3424");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, "4294967", "4294967");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, 4294967, "4294967");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, "<baz>&</baz>", "<baz>&</baz>");
      requestCheckTest(requestTestService, 'String', Plug.UPnP.prototype.types.string, "&&&&&&", "&&&&&&");
      
    });
    
    describe('UPnP Request Type Conversion: dateTime', function() {

      var d0 = new Date( parseDate(0) );
      var d0Str, d0Time;
      if(d0.toString() == "Invalid Date") { // opera specific error functionality
        d0Str = "";
        d0Time = "";
      } else {
        d0Str = d0.toISOString();
        d0Time = d0.getTime();
      }
      
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d0, d0Time);
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d0Str, d0Time);

      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, "", "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, null, "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, undefined, "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, false, "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, true, "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, "aString", "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, NaN, "");
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, /.*/, "");

      var d1 = new Date( parseDate("2012-10-15T11:30:00") );
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d1, d1.getTime());
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d1.toISOString(), d1.getTime());
      
      var d2 = new Date( parseDate("2012-10-15") );
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d2, d2.getTime());
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d2.toISOString(), d2.getTime());
      
      var d3 = new Date( parseDate("12:30:00+0200") );
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d3, d3.getTime());
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d3.toISOString(), d3.getTime());
      
      var d4 = new Date( parseDate("2012-10-15T12:30:00+0200") );
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d4, d4.getTime());
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d4.toISOString(), d4.getTime());
      
      var d5 = new Date( parseDate("2012-10-15T12:30:00Z") );
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d5, d5.getTime());
      requestCheckTest(requestTestService, 'DateTime', Plug.UPnP.prototype.types.dateTime, d5.toISOString(), d5.getTime());
      
    });
    
    describe('UPnP Request Type Conversion: boolean', function() {

      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "", "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, null, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, undefined, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, 0, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, NaN, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, /.*/, "0");

      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, true, "1");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, false, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, 0, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, 1, "1");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, -1, "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "true", "1");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "false", "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "yes", "1");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "no", "0");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "y", "1");
      requestCheckTest(requestTestService, 'Boolean', Plug.UPnP.prototype.types.boolean, "n", "0");
      
    });
    
    describe('UPnP Request Type Conversion: bin_base64', function() {

      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, "", "");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, null, "");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, undefined, "");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, 0, "MA==");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, NaN, "");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, true, "MQ==");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, false, "MA==");
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, /.*/, "");
      
      requestCheckTest(requestTestService, 'Bin_base64', Plug.UPnP.prototype.types.bin_base64, "<bar>&</bar>", "PGJhcj4mPC9iYXI+");
      
    });
    
    describe('UPnP Request Type Conversion: bin_hex', function() {

      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, "", "");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, null, "");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, undefined, "");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, 0, "30");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, NaN, "");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, true, "31");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, false, "30");
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, /.*/, "");
      
      requestCheckTest(requestTestService, 'Bin_hex', Plug.UPnP.prototype.types.bin_hex, "<bar>&</bar>", "3c6261723e263c2f6261723e");
      
    });

  }
  
// Test runners

  function requestCheckTest(svcObj, requestName, requestType, requestVal, expectedVal) {

    it('Type conversion to [' + requestType + ']', function(done) {

      var options = {"request": {}, "response": { "Date": { "type": "date" }, "Date_tz": { "type": "date_tz" }, "DateTime": { "type": "dateTime" }, "DateTime_tz": { "type": "dateTime_tz" }, "Time": { "type": "time" }, "Time_tz": { "type": "time_tz" }}};

      options["request"][ requestName ] = { "value": requestVal, "type": requestType };

      svcObj.action('test002', options, function(e, response) {
        assert.equal(e, undefined);

        if( Object.prototype.toString.call( response.data[requestName] ) == '[object Date]' ) {
          response.data[requestName] = response.data[requestName].getTime();
        }

        assert.strictEqual(response.data[requestName], expectedVal);
        done();
      });

    });

  }

  function responseCheckTest(svcObj, responseName, responseType, expectedVal) {

    it('Type conversion to [' + responseType + ']', function(done) {

      var options = {"request": {}, "response": {}};

      options["response"][ responseName ] = { type: responseType };

      svcObj.action('test001', options, function(e, response) {
        assert.equal(e, undefined);

        if( Object.prototype.toString.call( response.data[responseName] ) == '[object Date]' ) {
          response.data[responseName] = response.data[responseName].getTime();
        }

        assert.strictEqual(response.data[responseName], expectedVal);
        done();
      });

    });

  }

// Helper functions

  /**
   * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
   * © 2011 Colin Snover <http://zetafleet.com>
   * Released under MIT license.
   *
   * 2012 - Modifications to accept times without dates - by Rich Tibbett
   */

  function parseDate(date) {
      var timestamp, struct, minutesOffset = 0, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
      
      if(typeof date !== 'string') date += "";

      if ((struct = /^((\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:[T\s]?(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{4}))?)?$/.exec(date))) {

          struct = struct.slice(1, struct.length);

          // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
          for (var i = 0, k; (k = numericKeys[i]); ++i) {
              struct[k] = +struct[k] || 0;
          }

          // allow undefined days and months
          struct[2] = (+struct[2] || 1) - 1;
          struct[3] = +struct[3] || 1;

          if (struct[8] !== 'Z' && struct[9] !== undefined) {
              minutesOffset = (( struct[10] / 100 ) - (( struct[10] / 100 ) % 1)) * 60 + (struct[10] % 100);

              if (struct[9] === '+') {
                  minutesOffset = 0 - minutesOffset;
              }
          }

          timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
      }
      else {
          timestamp = Date.parse ? Date.parse(date) : NaN;
      }

      return timestamp;
  };

})( this );