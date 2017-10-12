( function() {
  'use strict';
  /*
   * oauth module
   *
   * To configure oauth, the below properties are required and must be configured externally:
   *    {
   *      'oauthBaseUrl'  : 'http://ouathserver.devinternal.com/oauth'
   *      'client'        :  Base-64-encode( clientId : clientSecret ),
   *      'aud'           : "https://ouathserver.devinternal.com/oauth"
   *    }
   *
   * It can be configured via the ways below:
   *   1. Specified in app.Config :
   *        appConfig : {
   *        ...
   *         'oauth' : {
   *              'oauthBaseUrl'  : 'http://ouathserver.devinternal.com/oauth'
   *              'client'        : Base-64-encode( clientId : clientSecret ),
   *              'aud'           : "https://ouathserver.devinternal.com/oauth"
   *         }
   *        }
   *
   *   2. Custom config url specified in appConfig which returns the JSON below :
   *        {
   *         'oauth' : {
   *              'oauthBaseUrl'  : 'http://ouathserver.devinternal.com/oauth',
   *              'client'        : Base-64-encode( clientId : clientSecret ),
   *              'aud'           : "https://ouathserver.devinternal.com/oauth"
   *         }
   *        }
   *   3. FHIR based where oauth base url is provided by FHIR metadata and other properties are specified in appConfig
   *        appConfig : {
   *        ...
   *         'oauth' : {
   *              'client'        : Base-64-encode( clientId : clientSecret ),
   *              'aud'           : "https://ouathserver.devinternal.com/oauth"
   *         }
   *        }
   *   4. Custom config url in appConfig  which returns FHIR server url and oauth properties JSON
   *        {
   *         'fhir' : {
   *              'iss'    : 'http://ouathserver.devinternal.com/fhirserver',
   *              'client' : Base-64-encode( clientId : clientSecret ),
   *              'aud'    : "https://ouathserver.devinternal.com/oauth"
   *         }
   *        }
   * */
  angular.module( 'isc.oauth', ['isc.common', 'angular-md5'] );

} )();

