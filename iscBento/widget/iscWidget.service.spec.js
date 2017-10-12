( function() {
  'use strict';

  describe( 'isWidget Service', function() {
    var suite;

    var response = { entry : [{ resource : { id : 22 } }] };
    var sampleWidget  = { sources : [{ type: 'Allergy', properties: [{ name: 'name', path: 'path', order: 1, dataType: 'type' }] }, { type: 'Devices', properties: [{ name: 'name', path: 'path', order: 1, dataType: 'type' }] }], id : 2 };

    useDefaultModules( 'iscBento' , 'api', 'fhir' );

    beforeEach( inject( function( widgetService, api, $httpBackend, $rootScope ) {
      suite              = window.createSuite();
      suite.service      = widgetService;
      suite.service.setApiService( 'fhir' );
      suite.api          = api;
      suite.$httpBackend = $httpBackend;
      suite.$rootScope   = $rootScope;
      suite.appConfig     = {};

    } ) );

    describe( 'test setup', function() {
      it( 'should have the right functions', function() {
        expect( suite.service.directiveChoices ).toBeDefined();
        expect( suite.service.compileTable ).toBeDefined();
        expect( suite.service.goToDetails ).toBeDefined();
      } );
    } );

    describe( 'compileTable function', function() {
      it( 'should correctly create a table config and combine similar properties', function() {
        var table = suite.service.compileTable( sampleWidget );
        expect( table ).toEqual( { sortable: true, onRowClick: jasmine.any( Function ), cssTRClass : 'grid-block tr clickable', columns: [{ key: 'name', model: 'path', order: 1, templateUrl: 'iscBento/widget/type.html' }] } );
      } );

      it( 'should correctly create a table config and keep seperate differrent properties', function() {
        var newWidget = angular.copy( sampleWidget );
        _.set( newWidget, 'sources[0].properties[0].name', 'name2' );
        var table = suite.service.compileTable( newWidget );
        expect( table ).toEqual( { sortable: true, onRowClick: jasmine.any( Function ), cssTRClass : 'grid-block tr clickable', columns: [{ key: 'name2', model: 'path', order: 1, templateUrl: 'iscBento/widget/type.html' }, { key: 'name', model: 'path', order: 1, templateUrl: 'iscBento/widget/type.html' }] } );
      } );
    } );

    describe( 'goToDetails function', function() {
      it( 'should emit showDetailsPanel event', function() {
        spyOn( suite.$rootScope, '$emit' );
        suite.service.goToDetails( response.entry[0], sampleWidget );
        expect( suite.$rootScope.$emit ).toHaveBeenCalledWith( 'showDetailsPanel', { data: { resource : { id : 22 } }, sources: sampleWidget.sources } );
      } );
    } );

    describe( 'getSeries function', function() {
      it( 'should add a series grouped by the code to the config keeping ungrouped data with different codes', function() {
        var data = [];
        _.set( data, '[0].resource.code.coding[0].display', 'HDL' );
        _.set( data, '[1].resource.code.coding[0].display', 'LDL' );
        var source = { groupBy : { path : 'resource.code.coding[0].display' } };

        var config = { series : [] };
        spyOn( suite.service, 'getValues' ).and.returnValue( [1, 2] );

        config.series = suite.service.getSeries( data, source );

        expect( config.series ).toEqual( [Object( { name: 'HDL', data: [1, 2] } ), Object( { name: 'LDL', data: [1, 2] } )] );
      } );

      it( 'should add a series grouped by the code to the config', function() {
        var data = _.set( [], '[0].resource.code.coding[0].display', 'HDL' );
        var source = { groupBy : { path : 'resource.code.coding[0].display' } };

        _.set( data, '[1].resource.code.coding[0].display', 'HDL' );

        var config = { series : [] };
        spyOn( suite.service, 'getValues' ).and.returnValue( [1, 2] );

        config.series = suite.service.getSeries( data, source );

        expect( config.series ).toEqual( [Object( { name: 'HDL', data: [1, 2] } )] );
      } );
    } );

    describe( 'getValues function', function() {
      it( 'should make an array with the date and the value', function() {
        var data = [{ resource : { effectiveDateTime : 1, valueQuantity: { value : 2 } } }];
        var source = { xAxis : { path : 'resource.effectiveDateTime' }, yAxis : { path : 'resource.valueQuantity.value' } };

        var newData = suite.service.getValues( data, source );

        expect( newData ).toEqual( [[1, 2]] );
      } );

    } );

  } );
} )();
