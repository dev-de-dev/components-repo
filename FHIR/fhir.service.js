/**
 * Created by Debashish Mohapatra on 11/7/16.
 */

( function() {

  'use strict';

  angular.module( 'fhir' )
    .factory( 'fhirService', fhirService );

  function fhirService( fhirResources, fhir ) {

    var service = {
      process    : process
      // getFilters : getFilters
    };

    return service;

    function process() {
      service.metadata = window.sessionStorage.getItem( 'fhirMetaData' );
      service.resources = _.get( service.metadata, 'rest[0].resource', _.map( fhirResources, function( resource ) {
        return {
          type : resource
        };
      } ) );
    }

    // function getFilters( self, id ) {
    //   fhir.get( 'Condition', { patient : id } ).then( function( results ) {
    //     self.filters = _.uniqBy( _.map( results.entry, function( entryItem ) {
    //       return _.get( entryItem, 'resource.code.coding[0]' );
    //     } ), 'code' );
    //   } );
    // }
  }

}() );
