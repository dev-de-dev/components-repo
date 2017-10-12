/**
 * Created by Debashish Mohapatra on 1/26/2016.
 */
( function() {
  'use strict';

  angular.module( 'fhir' )
    .factory( 'fhir', fhir );

  /* @ngInject */
  function fhir( api, config, $q ) {

    var include = { _include : 'DiagnosticReport:result' };

    var factory = {
      get           : _.partial( applyMethod, 'get' ),
      post          : _.partial( applyMethod, 'post' ),
      put           : _.partial( applyMethod, 'put' ),
      delete        : _.partial( applyMethod, 'delete' ),
      getUrl        : _.partial( applyMethod, 'getUrl' ),
      getAndCombine : getAndCombine
    };

    function applyMethod( method, path ) {
      arguments[1] = _.get( config, "fhir.iss", "" ) + ( arguments[1] ? "/" + arguments[1] : "" );
      return api[method].apply( api, _.tail( _.toArray( arguments ) ) );
    }

    function getAndCombine( sources, params ) {
      return _.reduce( sources, function( promises, source ) {
        var references = _.map( _.filter( source.properties, { dataType : 'reference' } ), 'reference' );
        return promises.then( function( collection ) {
          return factory.get( source.type + source.params, params )
            .then( function( data ) {
              var resourceEntries = [];

              _.forEach( data.entry, function( instance ) {
                instance.references = _.intersectionWith( _.at( instance, references ), sources, function( reference, source ) {
                  return _.includes( reference, source.type );
                } );

                var sameIdEntry = getReferencedResource( collection, instance ) || {};

                _.pull( collection, sameIdEntry );

                // combining the resources objects from different resources that have the same id
                // data from the same encounter always has the same id
                resourceEntries.push( {
                  resource   : _.defaults( instance.resource, _.get( sameIdEntry, 'resource', {} ) ),
                  search     : instance.search,
                  references : instance.references
                } );

              } );
              var combinedEntries = _.unionBy( resourceEntries, collection, 'resource.id' );

              return _.get( source, 'params' ) ? nestReferencedEntries( combinedEntries ) : combinedEntries;
            } );
        } );
      }, $q.when( [] ) ); // This is the aggregator promise, it collects what you return from the function
    }

    function getReferencedResource( collection, instance ) {
      return _.find( collection, ['resource.id', instance.resource.id] ) || _.find( collection, function( entry ) {
        return isReferenced( entry, instance ) || isReferenced( instance, entry );
      } );
    }

    function isReferenced( obj, otherObj ) {
      return _.includes( _.get( obj, 'references' ), otherObj.resource.resourceType + '/' + otherObj.resource.id );
    }

    function nestReferencedEntries( allEntries ) {
      var topLevelEntries = _.reject( allEntries, 'search' );
      _.forEach( topLevelEntries, function( topLevelEntry ) {
        if ( _.get( topLevelEntry, 'resource.result' ) ) {
          _.set( topLevelEntry, 'resource.result', _.map( topLevelEntry.resource.result, function( obj ) {
            return _.find( allEntries, function( entry ) {
              return ( entry.resource.resourceType + '/' + entry.resource.id ) === obj.reference;
            } );
          } ) );
        }
      } );
      return topLevelEntries;
    }

    return factory;

  }
} )();
