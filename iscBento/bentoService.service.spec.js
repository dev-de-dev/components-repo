( function() {
  'use strict';


  describe( 'iscBento service', function() {
    var suite;

    useDefaultModules( 'iscBento', 'api', 'fhir' );

    beforeEach( inject( function( bentoService, BENTO_OPTIONS, api, $httpBackend ) {
      suite              = window.createSuite();
      suite.service      = bentoService;
      suite.api          = api;
      suite.$httpBackend = $httpBackend;
    } ) );

    describe( 'test setup', function() {
      it( 'should have the right functions', function() {
        expect( suite.service.bentoOptions ).toBeDefined();
      } );
    } );

  } );
} )();
