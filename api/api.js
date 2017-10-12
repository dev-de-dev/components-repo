/**
 * Created by Debashish Mohapatra on 1/26/2016.
 */
( function() {
  'use strict';

  angular.module( 'api', [] )
    .factory( 'api', api );

  /* @ngInject */
  function api( config, devlog, $http, $httpParamSerializer ) {
    var log = devlog.channel( 'api' );
    
    log.debug( 'api Service LOADED' );

    var api = {
      get         : get,
      post        : _.partial( postPut, 'post' ),
      put         : _.partial( postPut, 'put' ),
      getUrl      : getUrl,
      delete      : deleteIt
    };

    return api;

    function get( ) {
      var url = api.getUrl( arguments[0] );
      var args = _.slice( arguments, 1 );
      var queryString = _.map( _.toArray( args ), function( params ) {
        return getParams( params, url );
      } ).join( '' ) + ( config.api.params || '' );

      return $http.get( url + queryString );
    }

    function postPut( method, url, params ) {
      var queries = '';
      if ( !!_.get( params, 'serialize' ) ) {
        queries = getParams( params, url );
        params = {};
      }
      return $http[method]( api.getUrl( url ) + queries, params );
    }

    function deleteIt( url, params ) {
      return $http.delete( api.getUrl( url ) + ( !!params ? getParams( params, url ) : '' ) );
    }

    function getParams( params, url ) {
      var paramPrefix = !_.includes( url, '?' ) ? '?' : '&';

      if ( _.isPlainObject( params ) ) {
        _.unset( params, 'serialize' );
        params = paramPrefix + $httpParamSerializer( _.omitBy( params, _.isUndefined ) );

      } else if ( _.isArray( params ) ) {
        params = '/' + _.compact( params ).join( '/' );

      }
      return params;
    }

    function getUrl( url ) {
      log.debug( 'getUrl', url );
      var isAbsolute = new RegExp( '^(?:[a-z]+:)?//', 'i' );

      if ( url && isAbsolute.test( url ) ) {
        return url;
      } else {
        if ( url ) {
          url = ( _.startsWith( url, "/" ) ? url : "/" + url );
        }else {
          url = "";
        }
        var apiPath = _.endsWith( config.api.path, "/" ) ? config.api.path.substring( "-1" ) : config.api.path;
        return apiPath + url;
      }
    }

  }
} )();

