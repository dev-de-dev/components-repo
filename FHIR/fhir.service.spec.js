( function() {
  'use strict';


  describe( 'fhir service', function() {
    var suite;

    var fhirMetadata = {
      rest : [{
        resource : ['Patient']
      }]
    };

    useDefaultModules( 'fhir', 'api' );

    beforeEach( inject( function( fhirService ) {

      suite              = window.createSuite();
      suite.service      = fhirService;

      suite.storage      = window.sessionStorage;

      spyOn( suite.storage, 'getItem' ).and.returnValue( fhirMetadata );
    } ) );

    describe( 'test setup', function() {
      it( 'should have the right functions', function() {
        expect( suite.service.process ).toBeDefined();
      } );
    } );

    describe( 'process function', function() {
      it( 'processes the resources accurately if specified', function() {

        _.unset( suite.resources );

        suite.service.process();

        expect( suite.storage.getItem ).toHaveBeenCalledWith( 'fhirMetaData' );
        expect( suite.service.metadata ).toEqual( fhirMetadata );
        expect( suite.service.resources ).toEqual( ['Patient'] );
      } );
    } );

    describe( 'process function', function() {
      it( 'processes the resources accurately if unspecified', function() {
        suite.storage.getItem.and.returnValue();
        suite.service.process();
        expect( suite.storage.getItem ).toHaveBeenCalledWith( 'fhirMetaData' );
        expect( suite.service.resources ).toContain( { type : 'Account' } );
      } );
    } );


  } );
} )();
