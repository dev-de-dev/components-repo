(function() {
  'use strict';

  describe( 'iscOauthInterceptor test', function() {

    var suite;

    // setup devlog
    beforeEach( module( 'isc.oauth', function( devlogProvider ) {
      devlogProvider.loadConfig( {} );
    } ) );

    beforeEach( inject( function( $http, iscOauthInterceptor, iscOauthService ) {
      suite                     = {};
      suite.$http               = $http;
      suite.iscOauthInterceptor = iscOauthInterceptor;
      suite.iscOauthService     = iscOauthService;
    } ) );


    /**
     *  tests
     */
    describe(
      'sanity check',
      function() {
        it( 'should have interceptor defined', function() {
          expect( suite.iscOauthInterceptor ).toBeDefined();
          expect( suite.iscOauthInterceptor.request ).toBeDefined();
        } );
      } );

    describe(
      'request tests',
      function() {

        it( 'should set auth header for authenticated requests if auth header is not available', function() {
          spyOn( suite.iscOauthService, 'get' ).and.returnValue( "test123" );

          var config = {};

          var requestResponse = suite.iscOauthInterceptor.request( config );

          expect( suite.iscOauthService.get ).toHaveBeenCalled();
          expect( requestResponse.headers.AUTHORIZATION ).toBe( 'BEARER test123' );
          expect( suite.$http.defaults.headers.common.AUTHORIZATION ).toBe( 'BEARER test123' );
        } );

        it( 'should not override auth header for authenticated requests if auth header is available', function() {
          spyOn( suite.iscOauthService, 'get' ).and.returnValue( "test123" );

          var config = {
            headers: {
              AUTHORIZATION: "test987"
            }
          };

          var requestResponse = suite.iscOauthInterceptor.request( config );

          expect( suite.iscOauthService.get ).not.toHaveBeenCalled();
          expect( requestResponse.headers.AUTHORIZATION ).toBe( 'test987' );
          expect( suite.$http.defaults.headers.common.AUTHORIZATION ).not.toBeDefined();
        } );
      } );


  } );
}());
