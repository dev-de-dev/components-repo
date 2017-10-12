( function() {
  'use strict';

  angular.module( 'isc.oauth' )
    .factory( 'iscOauthInterceptor', iscOauthInterceptor );

  /* @ngInject */
  function iscOauthInterceptor( $injector, devlog ) {//jshint ignore:line
    var log = devlog.channel( 'iscOauthInterceptor' );

    var $http;
    var iscSessionModel;
    var iscOauthService;
    // ----------------------------
    // factory class
    // ----------------------------

    var factory = {
      request: request
    };

    return factory;

    // ----------------------------
    // functions
    // ----------------------------
    function request( config ) {//jshint ignore:line

      //dynamically injecting it to prevent circular Dependency Injections.
      $http           = $http || $injector.get( '$http' );
      iscOauthService = iscOauthService || $injector.get( 'iscOauthService' );

      if ( !_.get( config, "headers.AUTHORIZATION", false ) ) {
        var token = iscOauthService.get( 'accessToken' );
        _.set( config, "headers.AUTHORIZATION", "BEARER " + token );
        _.set( $http, "defaults.headers.common.AUTHORIZATION", "BEARER " + token );
      }
      return config;
    }
  }// END CLASS

} )();
