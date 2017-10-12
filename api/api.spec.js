( function() {
  'use strict';


  describe( 'api module', function() {
    var suite;

    useDefaultModules( 'api' );

    beforeEach( inject( function( $httpBackend, $http, api ) {
      suite              = window.createSuite();
      suite.$httpBackend = $httpBackend;
      suite.api          = api;
      suite.httpApi      = $http;
    } ) );

    describe( 'test setup', function() {
      it( 'should have the right functions', function() {
        expect( suite.api.get ).toBeDefined();
        expect( suite.api.post ).toBeDefined();
        expect( suite.api.put ).toBeDefined();
        expect( suite.api.getUrl ).toBeDefined();
        expect( suite.api.delete ).toBeDefined();
      } );
    } );

    describe( 'get function', function() {
      it( 'should call out to httpApi', function() {
        suite.$httpBackend.whenGET( 'api/v1/path' ).respond( 200, {} );
        spyOn( suite.api, 'getUrl' ).and.callThrough();
        spyOn( suite.httpApi, 'get' ).and.callThrough();

        suite.api.get( 'path' );
        suite.$httpBackend.flush();

        expect( suite.api.getUrl ).toHaveBeenCalledWith( 'path' );
        expect( suite.httpApi.get ).toHaveBeenCalledWith( 'api/v1/path' );
      } );

      it( 'should call out to httpApi for an object', function() {
        suite.$httpBackend.whenGET( 'api/v1/path?this=that' ).respond( 200, {} );
        spyOn( suite.httpApi, 'get' ).and.callThrough();

        suite.api.get( 'path', { this : 'that' } );
        suite.$httpBackend.flush();

        expect( suite.httpApi.get ).toHaveBeenCalledWith( 'api/v1/path?this=that' );
      } );

      it( 'should call out to httpApi for an array', function() {
        suite.$httpBackend.whenGET( 'api/v1/path/more/paths' ).respond( 200, {} );
        spyOn( suite.httpApi, 'get' ).and.callThrough();

        suite.api.get( 'path', ['more', 'paths'] );
        suite.$httpBackend.flush();

        expect( suite.httpApi.get ).toHaveBeenCalledWith( 'api/v1/path/more/paths' );
      } );
    } );

    describe( 'post/put function', function() {
      it( 'should post out to httpApi', function() {
        suite.$httpBackend.whenPOST( 'api/v1/path' ).respond( 200, {} );
        spyOn( suite.api, 'getUrl' ).and.callThrough();
        spyOn( suite.httpApi, 'post' ).and.callThrough();

        suite.api.post( 'path', { this : 'that' } );
        suite.$httpBackend.flush();

        expect( suite.api.getUrl ).toHaveBeenCalledWith( 'path' );
        expect( suite.httpApi.post ).toHaveBeenCalledWith( 'api/v1/path', { this : 'that' } );
      } );

      it( 'should put out to httpApi', function() {
        suite.$httpBackend.whenPUT( 'api/v1/path' ).respond( 200, {} );
        spyOn( suite.httpApi, 'put' ).and.callThrough();

        suite.api.put( 'path', { this : 'that' } );
        suite.$httpBackend.flush();

        expect( suite.httpApi.put ).toHaveBeenCalledWith( 'api/v1/path', { this : 'that' } );
      } );

      it( 'should post out to httpApi and serialize the object sent', function() {
        suite.$httpBackend.whenPOST( 'api/v1/path?this=that' ).respond( 200, {} );
        spyOn( suite.httpApi, 'post' ).and.callThrough();

        suite.api.post( 'path', { serialize : true, this : 'that' } );
        suite.$httpBackend.flush();

        expect( suite.httpApi.post ).toHaveBeenCalledWith( 'api/v1/path?this=that', {} );
      } );
    } );

    describe( 'delete function', function() {
      it( 'should make delete call out to httpApi', function() {
        suite.$httpBackend.whenDELETE( 'api/v1/path?this=that' ).respond( 200, {} );
        spyOn( suite.api, 'getUrl' ).and.callThrough();
        spyOn( suite.httpApi, 'delete' ).and.callThrough();

        suite.api.delete( 'path', { this : 'that' } );
        suite.$httpBackend.flush();

        expect( suite.api.getUrl ).toHaveBeenCalledWith( 'path' );
        expect( suite.httpApi.delete ).toHaveBeenCalledWith( 'api/v1/path?this=that' );
      } );

    } );

    describe( 'getUrl fun', function() {
      it( 'should return url with api path appended for relative url', function() {
        expect( suite.api.getUrl( "path" ) ).toBe( "api/v1/path" );
        expect( suite.api.getUrl( "/path" ) ).toBe( "api/v1/path" );
      } );
      it( 'should return url without api path appended for absolute url', function() {
        expect( suite.api.getUrl( "http://path" ) ).toBe( "http://path" );
        expect( suite.api.getUrl( "ftp://path" ) ).toBe( "ftp://path" );
      } );

    } );


  } );
} )();
