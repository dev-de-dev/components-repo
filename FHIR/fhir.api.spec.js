( function() {
  'use strict';


  describe( 'fhir api', function() {
    var suite;

    var response = { entry : [{ resource : { id : 22, resourceType: 'DiagnosticReport' } }] };
    var sources = [{ type: 'DiagnosticReport', params: '?param', properties: [{ name: 'name', path: 'path', order: 1, dataType: 'type' }] }, { type: 'Devices', params: '', properties: [{ name: 'name', path: 'path', order: 1, dataType: 'type' }] }];


    useDefaultModules( 'fhir', 'api' );

    beforeEach( inject( function( $httpBackend, $http, api, fhir ) {

      suite                = window.createSuite();
      suite.$httpBackend   = $httpBackend;
      suite.api            = api;
      suite.fhir           = fhir;
      suite.appConfig      = {};

      suite.httpApi        = $http;

      suite.$httpBackend.when( 'GET', /.html$/ )
        .respond( 200, {} );

      suite.appConfig.fhir = {
        iss : "http://fhir"
      };
    } ) );

    describe( 'test setup', function() {
      it( 'should have the right functions', function() {
        expect( suite.fhir.get ).toBeDefined();
        expect( suite.fhir.post ).toBeDefined();
        expect( suite.fhir.put ).toBeDefined();
        expect( suite.fhir.getUrl ).toBeDefined();
        expect( suite.fhir.delete ).toBeDefined();
      } );
    } );

    describe( 'functions', function() {
      it( 'makes the correct get call to api', function() {
        spyOn( suite.api, 'get' );

        suite.fhir.get( 'path' );

        expect( suite.api.get ).toHaveBeenCalledWith( 'http://fhir/path' );
      } );

      it( 'makes the correct post call to api', function() {
        spyOn( suite.api, 'post' );

        suite.fhir.post( 'path' );

        expect( suite.api.post ).toHaveBeenCalledWith( 'http://fhir/path' );
      } );
    } );

    describe( 'getAndCombine function', function() {
      it( 'should call the api and combine entries that have the same id', function() {
        var response2 = angular.copy( response );
        _.set( response2, 'entry[0].resource', { id: 22, resourceType: 'Devices' } );

        suite.$httpBackend.expectGET( /DiagnosticReport\?param&patient=1/ ).respond( response );
        suite.$httpBackend.expectGET( /Devices\?patient=1/ ).respond( response2 );

        var combined = suite.fhir.getAndCombine( sources, { patient : 1 } );
        suite.$httpBackend.flush();

        expect( combined.$$state.value ).toEqual( [{ resource: { id: 22, resourceType: 'Devices' }, search: undefined, references: [] }] );
      } );

      it( 'should call the api and leave separate the entries that have different ids', function() {
        var response2 = angular.copy( response );
        _.set( response2, 'entry[0].resource', { id: 15, resourceType: 'Devices' } );
        _.set( sources, '[0].params', '' );

        suite.$httpBackend.expectGET( /DiagnosticReport\?patient=1/ ).respond( response );
        suite.$httpBackend.expectGET( /Devices\?patient=1/ ).respond( response2 );

        var combined = suite.fhir.getAndCombine( sources, { patient : 1 } );
        suite.$httpBackend.flush();
        expect( combined.$$state.value ).toEqual( [{ resource: { id: 15, resourceType: 'Devices' }, search: undefined, references: [] }, { resource: { id: 22, resourceType: 'DiagnosticReport' }, search: undefined, references: [] }] );

      } );
    } );


  } );
} )();
