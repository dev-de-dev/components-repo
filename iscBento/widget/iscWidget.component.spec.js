( function() {
  'use strict';


  describe( 'iscWidget component', function() {
    var suite;

    var sampleWidget  = { templates : ['table'], sources : [{ type: 'Allergy', properties: [{ name: 'name', path: 'path' }] }, { type: 'Devices', properties: [{ name: 'name', path: 'path' }] }], id : 2 };
    var interval;

    useDefaultModules( 'iscBento', 'api', 'fhir' );

    var html = "<isc-widget widget='{id:2}'></isc-widget>";

    beforeEach( inject( function( $rootScope, $compile, $httpBackend, api, widgetService, $q, $timeout, $interval ) {
      interval            = jasmine.createSpy( 'interval', $interval );
      suite               = window.createSuite();
      suite.$rootScope    = $rootScope;
      suite.$httpBackend  = $httpBackend;
      suite.api           = api;
      suite.$timeout      = $timeout;
      suite.widgetService = widgetService;
      suite.$scope        = $rootScope.$new();
      suite.element       = $compile( html )( suite.$scope );
      suite.$httpBackend.when( 'GET', /.html$/ )
        .respond( 200, {} );

      suite.$scope.$digest();
      suite.$isolateScope = suite.element.isolateScope();
      suite.ctrl          = suite.$isolateScope.widgetCtrl;
      suite.ctrl.widget   = angular.copy( sampleWidget );
      suite.deferred      = $q.defer();
      suite.ctrl.patient  = { id : 1 };
      suite.ctrl.params   = {};
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
      it( 'should call getData and getOptions if no properties', function() {
        spyOn( suite.ctrl, 'getData' );
        spyOn( suite.ctrl, 'makeConfig' );
        suite.ctrl.data = null;

        suite.ctrl.$onInit();

        expect( suite.ctrl.widget ).toBeDefined();
        expect( suite.ctrl.loading ).toBeTruthy();
        expect( suite.ctrl.getData ).toHaveBeenCalled();
        expect( suite.ctrl.makeConfig ).toHaveBeenCalled();
      } );

      it( 'should call getData and makeConfig if properties exist', function() {
        spyOn( suite.ctrl, 'getData' );
        spyOn( suite.ctrl, 'makeConfig' );
        suite.ctrl.widget.sources = [{ type : 'me' }];
        suite.ctrl.data = null;
        suite.ctrl.$onInit();

        expect( suite.ctrl.widget ).toBeDefined();
        expect( suite.ctrl.getData ).toHaveBeenCalled();
        expect( suite.ctrl.makeConfig ).toHaveBeenCalled();
      } );
    } );

    describe( 'deleteWidget function', function() {
      it( 'should emit event', function() {
        spyOn( suite.$rootScope, '$emit' );
        suite.ctrl.deleteWidget();
        expect( suite.$rootScope.$emit ).toHaveBeenCalledWith( 'deleteWidget', 2 );
      } );
    } );

    describe( 'changeConfiguration function', function() {
      it( 'should emit editWidget event', function() {
        spyOn( suite.$rootScope, '$emit' );
        suite.ctrl.changeConfiguration( 0 );
        expect( suite.$rootScope.$emit ).toHaveBeenCalledWith( 'editWidget', sampleWidget, 0, jasmine.any( Function ) );
      } );
    } );

    describe( 'hideEmpty function', function() {
      it( 'should emit event', function() {
        spyOn( suite.$rootScope, '$emit' );
        suite.ctrl.hideEmpty();
        expect( suite.$rootScope.$emit ).toHaveBeenCalledWith( 'hideEmpty' );
      } );
    } );

    describe( 'saveWidget function', function() {
      it( 'should emit event', function() {
        spyOn( suite.$rootScope, '$emit' );
        suite.ctrl.saveWidget();
        expect( suite.$rootScope.$emit ).toHaveBeenCalledWith( 'saveWidget', sampleWidget );
      } );
    } );


    describe( 'getData function', function() {
      it( 'should call the api getAndCombine and then set noData to false if no data', function() {
        spyOn( suite.widgetService, 'getWidgetData' ).and.returnValue( suite.deferred.promise );
        spyOn( suite.ctrl, 'startCounter' );

        suite.deferred.resolve( [] );
        suite.ctrl.getData( sampleWidget );

        suite.$scope.$apply();

        expect( suite.ctrl.data ).toEqual( [] );
        expect( suite.ctrl.widget.noData ).toEqual( true );
        expect( suite.ctrl.loading ).toEqual( false );
        expect( suite.ctrl.startCounter ).not.toHaveBeenCalled();
      } );

      it( 'should call the api getAndCombine and then set noData to true if there is data', function() {
        spyOn( suite.widgetService, 'getWidgetData' ).and.returnValue( suite.deferred.promise );
        spyOn( suite.ctrl, 'startCounter' );

        suite.ctrl.params = { patient: 1 };
        suite.deferred.resolve( ['combined'] );
        suite.ctrl.getData( sampleWidget );

        suite.$scope.$apply();

        expect( suite.ctrl.data ).toEqual( ['combined'] );
        expect( suite.ctrl.widget.noData ).toEqual( false );
        expect( suite.ctrl.loading ).toEqual( false );
        expect( suite.ctrl.startCounter ).toHaveBeenCalled();
      } );

      it( 'should get the series and reflow the chart if it is a chart', function() {
        var sampleChart = _.cloneDeep( sampleWidget );
        sampleChart.templates = ['chart'];
        spyOn( suite.widgetService, 'getWidgetData' ).and.returnValue( suite.deferred.promise );
        spyOn( suite.widgetService, 'getSeries' );
        spyOn( suite.$isolateScope, '$on' );

        suite.ctrl.params = { patient: 1 };

        suite.deferred.resolve( ['combined'] );
        suite.ctrl.getData( sampleChart );

        suite.$scope.$apply();

        expect( suite.widgetService.getSeries ).toHaveBeenCalled();
      } );

    } );

    describe( 'startCounter function', function() {
      it( 'should call the checkTime function and set lastUpdated', function() {
        var today = moment( '2017-01-01' ).toDate();
        var resolveTime =  moment( '2017-01-01' );
        jasmine.clock().mockDate( today );
        spyOn( suite.ctrl, 'checkTime' );

        suite.ctrl.startCounter( resolveTime ) ;

        expect( suite.ctrl.checkTime ).toHaveBeenCalledWith( resolveTime, 'a few seconds ago' );
        expect( suite.ctrl.lastUpdated ).toEqual( 'a few seconds ago' );
      } );
    } );

    describe( 'makeConfig function', function() {
      it( 'should call the compileTable function from the service if its a table', function() {
        spyOn( suite.widgetService, 'compileTable' ).and.returnValue( 'tableConfig' );
        suite.ctrl.makeConfig( sampleWidget );
        expect( suite.widgetService.compileTable ).toHaveBeenCalledWith( sampleWidget );
        expect( suite.ctrl.config ).toEqual( 'tableConfig' );
      } );

      it( 'should call the compileChart function from the service if its a chart', function() {
        var sampleChart = _.cloneDeep( sampleWidget );
        sampleChart.templates = ['chart'];
        spyOn( suite.widgetService, 'compileChart' ).and.returnValue( 'chartConfig' );
        suite.ctrl.makeConfig( sampleChart );
        expect( suite.widgetService.compileChart ).toHaveBeenCalledWith( sampleChart );
        expect( suite.ctrl.config ).toEqual( 'chartConfig' );
        expect( suite.ctrl.selectedDirective.type ).toEqual( 'chart' );

      } );
    } );

  } );
} )();
