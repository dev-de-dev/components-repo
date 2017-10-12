( function() {
  'use strict';


  describe( 'iscBento component', function() {
    var suite;

    useDefaultModules( 'iscBento' );

    beforeEach( module( 'api', 'fhir' ) );

    var html = "<isc-bento patient='' widgets='' options='' api-service='fhir'></isc-bento>";

    beforeEach( inject( function( $rootScope, $compile, $httpBackend, api ) {
      suite               = window.createSuite();
      suite.$rootScope    = $rootScope;
      suite.$httpBackend  = $httpBackend;
      suite.$scope        = $rootScope.$new();
      suite.element       = $compile( html )( suite.$scope );
      suite.api           = api;

      suite.$httpBackend.when( 'GET', /.html$/ )
        .respond( 200, {} );


      // bento will be pointing at an .isc-page for the scroll-container attribute
      var jqBase = window.$;
      spyOn( window, '$' ).and.callFake( function( selector ) {
        if ( selector === '.isc-page' ) {
          return jqBase( '<div class="isc-page" ui-view>' );
        }
        return jqBase( selector );
      } );

      suite.$scope.$digest();
      suite.$isolateScope = suite.element.isolateScope();
      suite.ctrl          = suite.$isolateScope.bentoCtrl;
      suite.ctrl.widgets  = [
        { id: 1, templates: [], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 } },
        { id: 2, templates: [], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 } }
      ];
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

    describe( 'initialization', function() {
      it( 'should initialize with the right stuff', function() {
        expect( suite.ctrl.options ).toBeDefined();
        expect( suite.ctrl.deleteWidget ).toBeDefined();
        expect( suite.ctrl.deleteAll ).toBeDefined();
      } );
    } );

    describe( 'deleteWidget function', function() {
      it( 'should remove the widget from the widget array', function() {
        suite.$httpBackend.expectDELETE( 'api/v1/config/widgets/2' ).respond( {} );
        spyOn( suite.api, 'delete' ).and.callThrough();

        suite.ctrl.deleteWidget( {}, 2 );
        suite.$httpBackend.flush();

        expect( suite.api.delete ).toHaveBeenCalledWith( 'config/widgets', [2] );
        expect( suite.ctrl.widgets ).toEqual( [{ id: 1, templates: [], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 }, noData: true }] );
      } );
    } );

    describe( 'deleteAll function', function() {
      it( 'should remove all widgets and post to the server', function() {
        suite.$httpBackend.expectDELETE( 'api/v1/config/widgets' ).respond( {} );
        suite.ctrl.deleteAll();
        suite.$httpBackend.flush();
        expect( suite.ctrl.widgets ).toEqual( [] );
      } );
    } );

    describe( 'hideEmpty function', function() {
      it( 'should hide the empty widgets', function() {
        expect( suite.ctrl.emptyWidgetsHidden ).toEqual( false );
        suite.ctrl.widgets[0].noData = true;

        suite.ctrl.hideEmpty( true );
        expect( suite.ctrl.widgets ).toEqual( [{ id: 1, templates: [  ], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 }, noData: true, empty: true }, { id: 2, templates: [  ], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 }, empty: undefined }] );
      } );

      it( 'should unhide the empty widgets', function() {
        expect( suite.ctrl.emptyWidgetsHidden ).toEqual( false );
        suite.ctrl.widgets[0].noData = true;
        suite.ctrl.widgets[0].empty = true;

        suite.ctrl.hideEmpty( false );
        expect( suite.ctrl.widgets ).toEqual( [{ id: 1, templates: [  ], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 }, noData: true, empty: false }, { id: 2, templates: [  ], tablet: { cols: 1, rows: 1, x: 0, y: 0 }, desktop: { cols: 1, rows: 1, x: 0, y: 0 }, empty: false }] );
      } );
    } );
  } );
} )();
