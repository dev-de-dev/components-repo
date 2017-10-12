( function() {
  'use strict';


  describe( 'iscPanel component', function() {
    var suite;

    useDefaultModules( 'iscBento', 'isc.templates', 'api', 'isc.configuration', 'fhir' );

    var html = "<isc-bento-panel></isc-bento-panel>";

    beforeEach( inject( function( $rootScope, $compile, FoundationApi, $httpBackend ) {
      suite               = window.createSuite();
      suite.$rootScope    = $rootScope;
      suite.$httpBackend  = $httpBackend;
      suite.FoundationApi = FoundationApi;
      suite.$scope        = $rootScope.$new();
      suite.element       = $compile( html )( suite.$scope );
      suite.$scope.$digest();
      suite.$isolateScope = suite.element.isolateScope();
      suite.ctrl          = suite.$isolateScope.panelCtrl;
    } ) );

    describe( 'set setup', function() {
      it( 'should have right dependencies', function() {
        expect( suite.$rootScope ).toBeDefined();
        expect( suite.$scope ).toBeDefined();
        expect( suite.element ).toBeDefined();
        expect( suite.$isolateScope ).toBeDefined();
        expect( suite.ctrl ).toBeDefined();
      } );
    } );

    describe( 'init function', function() {
      it( 'should register $on listener on init', function() {
        spyOn( suite.$rootScope, '$on' );
        suite.ctrl.$onInit();
        expect( suite.$rootScope.$on ).toHaveBeenCalled();
      } );
    } );

    describe( 'showDetails function', function() {
      it( 'should set the details data and properties correctly', function() {
        spyOn( suite.FoundationApi, 'publish' );
        spyOn( suite.ctrl, 'getProperties' );

        suite.ctrl.showDetails( {}, { data : 'data', sources : [{ type: 'Allergy' }] } );

        expect( suite.ctrl.detailsData ).toEqual( 'data' );
        expect( suite.ctrl.sources ).toEqual( [{ type: 'Allergy' }] );
        expect( suite.FoundationApi.publish ).toHaveBeenCalled();
        expect( suite.ctrl.getProperties ).toHaveBeenCalled();

      } );
    } );

    describe( 'getProperties function', function() {

      it( 'should call to API and set the properties', function() {
        var source = { type : 'Condition', properties : [] };
        suite.$httpBackend.expectGET( 'api/v1/config/properties/Condition' ).respond( { properties : [{ name: 'date', path : 'date' }] } );

        suite.ctrl.getProperties( source );

        suite.$httpBackend.flush();

        expect( source.properties ).toEqual( [{ name: 'date', path: 'date' }] );

      } );

    } );

  } );
} )();
