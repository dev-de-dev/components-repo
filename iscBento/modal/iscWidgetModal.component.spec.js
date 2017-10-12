( function() {
  'use strict';


  describe( 'iscWidgetModal component', function() {
    var suite;

    useDefaultModules( 'iscBento', 'api', 'fhir' );

    var html = "<isc-widget-modal end-points widgets></isc-widget-modal>";

    beforeEach( inject( function( $rootScope, $compile, FoundationApi, widgetModalService, api, $httpBackend ) {
      suite               = window.createSuite();
      suite.$rootScope    = $rootScope;
      suite.FoundationApi = FoundationApi;
      suite.widgetModalService = widgetModalService;
      suite.api           = api;
      suite.$httpBackend  = $httpBackend;
      suite.$scope        = $rootScope.$new();
      suite.element       = $compile( html )( suite.$scope );
      suite.$httpBackend.when( 'GET', /.html$/ )
        .respond( 200, {} );

      suite.$scope.$digest();
      suite.$isolateScope = suite.element.isolateScope();
      suite.ctrl          = suite.$isolateScope.modalCtrl;
      suite.ctrl.endPoints = [{ type : 'Condition' }, { type : 'Devices' }];
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

    describe( 'cancel function', function() {
      it( 'should push to sources and call getOptions if new', function() {
        _.unset( suite.ctrl, 'widget' );
        expect( suite.ctrl.widget ).toBeUndefined();

        _.set( suite.ctrl, 'endPoints[0].selected', true );
        expect( suite.ctrl.endPoints ).toEqual( [{ type : 'Condition', selected : true }, { type : 'Devices' }] );

        _.set( suite, 'widgetModalService.tabs[2].hide', false );
        expect( suite.widgetModalService.tabs[2].hide ).toBeFalsy();

        suite.ctrl.cancel();

        expect( suite.ctrl.widget ).toEqual( { desktop: { cols: 1, rows: 1 }, tablet: { cols: 1, rows: 1 }, sources: [ ], templates : [] } );
        expect( suite.ctrl.endPoints ).toEqual( [{ type : 'Condition' }, { type : 'Devices' }] );
        expect( suite.widgetModalService.tabs[2] ).toBeTruthy();
        expect( suite.ctrl.tabs[2] ).toBeUndefined();

      } );

    } );

    describe( 'updateSources function', function() {
      it( 'should push to sources and call getOptions if new', function() {
        var source = { type : 'Condition', selected : true };
        spyOn( suite.ctrl, 'getProperties' );
        suite.ctrl.widget.sources = [];
        suite.ctrl.updateSources( source );
        expect( suite.ctrl.getProperties ).toHaveBeenCalled();
        expect( suite.ctrl.widget.sources ).toEqual( [_.assign( source, { properties : [], params: '' } )] );
      } );

      it( 'should remove from sources and if old and hide 3rd tab if sources are empty', function() {
        var source = { type : 'Condition', selected : false };
        spyOn( suite.ctrl, 'getProperties' );
        suite.ctrl.widget.sources = [{ type : 'Condition' }];
        suite.ctrl.updateSources( source );
        expect( suite.ctrl.getProperties ).not.toHaveBeenCalled();
        expect( suite.ctrl.widget.sources ).toEqual( [] );
        expect( suite.widgetModalService.tabs[2].hide ).toEqual( true );
      } );

      it( 'should remove from sources and if old and not hide 3rd tab if there are sources', function() {
        var source = { type : 'Condition', selected : false };
        _.set( suite, 'widgetModalService.tabs[2].hide', false );
        spyOn( suite.ctrl, 'getProperties' );
        suite.ctrl.widget.sources = [{ type : 'Condition' }, { type : 'Allergy' }];
        suite.ctrl.updateSources( source );
        expect( suite.ctrl.getProperties ).not.toHaveBeenCalled();
        expect( suite.ctrl.widget.sources ).toEqual( [{ type : 'Allergy' }] );
        expect( suite.widgetModalService.tabs[2].hide ).toEqual( false );

      } );

    } );

    describe( 'getProperties function', function() {
      it( 'should call to API, unhide the tab and filter the tabs', function() {
        var source = { type : 'Condition', properties : [{ name : 'date', path : 'date' }] };
        _.set( suite, 'widgetModalService.tabs[2].hide', true );
        _.unset( suite.ctrl, 'tabs[2]' );

        spyOn( suite.api, 'get' ).and.callThrough();
        suite.ctrl.getProperties( source, 0 );

        expect( suite.api.get ).toHaveBeenCalledWith( 'config/properties', ['Condition'] );
        expect( suite.widgetModalService.tabs[2].hide ).toEqual( false );
        expect( suite.ctrl.tabs[2] ).toBeDefined();
      } );

      it( 'should call to API, ignore selection if no tab number, and set allSelected to false', function() {
        var source = { type : 'Condition', properties : [] };
        suite.$httpBackend.expectGET( 'api/v1/config/properties/Condition' ).respond( { properties : [{ key: 'date', path : 'resource.date' }] } );

        suite.ctrl.getProperties( source );

        suite.$httpBackend.flush();

        expect( source.properties ).toEqual( [{ key: 'date', path: 'resource.date' }] );
        expect( source.allSelected ).toEqual( false );

      } );

      it( 'should call to API, toggle selection if tab number, and set allSelected to true', function() {
        expect( suite.ctrl.widget ).toBeDefined();

        var source = { type : 'Condition', properties : [{ path : 'date', key : 'date' }] };
        suite.ctrl.widget.sources = [{ type : 'Condition', properties : [{ name: 'date', path : 'date', key : 'date', order : 1 }] }];
        suite.$httpBackend.expectGET( 'api/v1/config/properties/Condition' ).respond( { properties : [{ key: 'date', path : 'date' }] } );

        suite.ctrl.getProperties( source, 0 );

        suite.$httpBackend.flush();

        expect( source.properties ).toEqual( [{ key: 'date', path: 'date', selected : true, order : 1 }] );
        expect( source.allSelected ).toEqual( true );
      } );

    } );

    describe( 'renameWidget function', function() {
      it( 'should set widget name and namedbyUser if name is passed in', function() {
        suite.ctrl.renameWidget( 'The Widget' );

        expect( suite.ctrl.widget.name ).toEqual( 'The Widget' );
        expect( suite.ctrl.namedByUser ).toEqual( true );
      } );

      it( 'should not update widget name if namedbyUser is true', function() {
        suite.ctrl.widget.name = 'The Widget';
        suite.ctrl.namedByUser = true;
        suite.ctrl.widget.sources = [{ type : 'new' }];

        suite.ctrl.renameWidget();

        expect( suite.ctrl.widget.name ).toEqual( 'The Widget' );
        expect( suite.ctrl.namedByUser ).toEqual( true );
      } );

      it( 'should update widget name if namedbyUser is false', function() {
        suite.ctrl.widget.name = 'The Widget';
        suite.ctrl.namedByUser = false;
        suite.ctrl.widget.sources = [{ type : 'new' }];

        suite.ctrl.renameWidget();

        expect( suite.ctrl.widget.name ).toEqual( 'new' );
        expect( suite.ctrl.namedByUser ).toEqual( false );
      } );
    } );

    describe( 'updateProperties function', function() {
      it( 'should add the properties to the source if they are selected and toggle allSelected to true', function() {
        var source = { type : 'Condition', orderCount: 0, properties : [{ name : 'date', path : 'date', selected : true, order: 1 }] };
        var property = { name : 'name', path : 'name', selected : true, order: 1 };
        suite.ctrl.widget.sources = [{ type : 'Condition', properties : [] }];

        suite.ctrl.updateProperties( source, property );

        expect( suite.ctrl.widget.sources ).toEqual( [{ type: 'Condition', properties: [{ name: 'name', path: 'name', selected: true, order: 1 }] }] );
        expect( source.allSelected ).toEqual( true );
      } );

      it( 'should remove the properties to the source if they are not selected and toggle allSelected to false', function() {
        var source = { type : 'Condition', properties : [{ key : 'date', path : 'date' }] };
        var property = { key : 'date', path : 'date' };
        suite.ctrl.widget.sources = [{ type : 'Condition', properties : [{ key : 'date', path : 'date' }] }];

        suite.ctrl.updateProperties( source, property );

        expect( suite.ctrl.widget.sources ).toEqual( [{ type: 'Condition', properties: [ ] }] );
        expect( source.allSelected ).toEqual( false );
      } );
    } );

    describe( 'renameProperty function', function() {
      it( 'should set the key of the source property to that of the one passed in', function() {
        suite.ctrl.widget.sources = [{ type : 'AllergyIntolerance', properties : [{ key : 'dateTime' }] }];
        suite.ctrl.renameProperty( { key : 'dateTime', name : 'date' }, 'AllergyIntolerance' );

        expect( suite.ctrl.widget.sources ).toEqual( [{ type : 'AllergyIntolerance', properties : [{ key : 'dateTime', name : 'date' }] }] );
      } );
    } );

    describe( 'selectAll function', function() {
      it( 'should toggle all the properties to selected for an endpoint and add them to the widget on the controller', function() {
        var endPoint = { type : 'Condition', allSelected: true, properties : [{ name : 'date', path : 'date', order: 1 }] };
        suite.ctrl.widget.sources = [{ type : 'Condition', properties : [] }];

        suite.ctrl.selectAll( endPoint );

        expect( endPoint.properties ).toEqual( [{ name: 'date', path: 'date', selected: true, order: 1 }] );
        expect( suite.ctrl.widget.sources[0].properties ).toEqual( [{ name: 'date', path: 'date', selected: true, order: 1 }] );
      } );

      it( 'should toggle all the properties  to unselected for an endpoint and clear the properties on the widget on the controller', function() {
        var endPoint = { type : 'Condition', allSelected: false, properties : [{ name : 'date', path : 'date', selected : true, order: 1 }] };
        suite.ctrl.widget.sources = [{ type : 'Condition', properties : [{ name : 'date', path : 'date', order: 1 }] }];

        suite.ctrl.selectAll( endPoint );

        expect( endPoint.properties ).toEqual( [{ name: 'date', path: 'date', selected: false, order: 1 }] );
        expect( suite.ctrl.widget.sources[0].properties ).toEqual( [ ] );
      } );
    } );

    describe( 'initializeWidget function', function() {
      it( 'should set self.widget, toggle the endpoints, and call getProperties for the endpoints if they are contained in the sources', function() {
        spyOn( suite.ctrl, 'getProperties' );
        suite.ctrl.endPoints = [{ type : 'Allergy' }];
        suite.ctrl.initializeWidget( {}, { sources: [{ type : 'Allergy' }] }, 1 );

        expect( suite.ctrl.widget ).toEqual( { sources: [{ type : 'Allergy' }] } );
        expect( suite.ctrl.getProperties ).toHaveBeenCalledWith( { type : 'Allergy', selected : true }, 1  );
      } );

      it( 'should set self.widget, not toggle the endpoints, and not call getProperties for the endpoints if they are not contained in the sources', function() {
        spyOn( suite.ctrl, 'getProperties' );
        suite.ctrl.endPoints = [{ type : 'Condition' }];
        suite.ctrl.initializeWidget( {}, { sources: [{ type : 'Allergy' }] }, 1 );

        expect( suite.ctrl.widget ).toEqual( { sources: [{ type : 'Allergy' }] } );
        expect( suite.ctrl.getProperties ).not.toHaveBeenCalled();
        expect( suite.ctrl.endPoints ).toEqual( [{ type: 'Condition' }] );
      } );

    } );

    describe( '$onInit function', function() {
      it( 'should register Foundation subscribe and rootScope on event', function() {
        spyOn( suite.FoundationApi, 'subscribe' );
        spyOn( suite.$rootScope, '$on' );

        suite.ctrl.$onInit();

        expect( suite.FoundationApi.subscribe ).toHaveBeenCalledWith(  'iscWidgetModal', jasmine.any( Function ) );
        expect( suite.$rootScope.$on ).toHaveBeenCalledWith( 'editWidget', jasmine.any( Function ) );
      } );

    } );

    describe( '$postLink function', function() {
      it( 'should register Foundation subscribe and rootScope on event', function() {
        spyOn( suite.$isolateScope, '$applyAsync' );

        suite.ctrl.$postLink();

        expect( suite.$isolateScope.$applyAsync ).toHaveBeenCalled();
      } );

    } );
  } );
} )();
