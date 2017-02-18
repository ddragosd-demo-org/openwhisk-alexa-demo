'use strict'

var Swagger = require('swagger-client');
//refer to local spec
var spec = require('./adobe-analytics-api.json');

module.exports = exports = function(params){

    var swagger = new Swagger({
      spec: spec,
      usePromise: true
    });

    return new Promise((resolve, reject) => {
        swagger.then(function(sdk){
            try
            {
                if(params !== null)
                {
                    //setup headers
                    if(params['Authorization'] !== undefined )
                        addClientAuth(sdk, "token_scheme", "Authorization", params['Authorization']);

                    if(params['x-proxy-company'] !== undefined)
                        addClientAuth(sdk, "company_header_scheme", "x-proxy-company", params['x-proxy-company']);

                    if(params['x-api-key'] !== undefined)
                        addClientAuth(sdk, "api_key_scheme", "x-api-key", params['x-api-key']);

                    var proxy_user_name = "dummyUserNotUsed";
                    if(params['x-proxy-username'] !== undefined)
                        proxy_user_name = params['x-proxy-username'];

                    //Add x-proxy-username header
                    addClientAuth(sdk, "proxy_user_scheme", "x-proxy-username", proxy_user_name);
                }
                resolve(sdk);
            }
            catch(Error)
            {
                reject(Error);
            }});
        }
    )
}

function addClientAuth(sdk, scheme, key, value)
{
    sdk.clientAuthorizations.add(scheme, new Swagger.ApiKeyAuthorization( key, value, "header"));
}