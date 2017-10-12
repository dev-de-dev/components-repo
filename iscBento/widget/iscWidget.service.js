/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:52:32 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .factory( 'widgetService', widgetService );

  /* @ngInject */
  function widgetService( devlog, $rootScope, $injector ) {

    var log = devlog.channel( 'widgetService' );
    log.debug( 'widgetService LOADED' );

    // ----------------------------
    // class factory
    // ----------------------------

    var table = {
      type      : 'table',
      component : 'faux-table',
      attrs     : {
        'config'       : 'widgetCtrl.config',
        'template-url' : 'iscBento/widget/fauxTable.html',
        'data-data'    : 'widgetCtrl.data'
      }
    };

    var chart = {
      type     : 'chart',
      component: 'highchart',
      attrs    : {
        'id'    : 'chart',
        'config': 'widgetCtrl.config'
      }
    };

    var timeline = {
      type     : 'timeline',
      component: 'highchart',
      attrs    : {
        'id'    : 'timeline',
        'config': 'widgetCtrl.config'
      }
    };


    var service = {
      directiveChoices : [table, chart, timeline],
      setApiService    : setApiService,
      getWidgetData    : getWidgetData,
      compileTable     : compileTable,
      compileChart     : compileChart,
      goToDetails      : goToDetails,
      getSeries        : getSeries,
      getValues        : getValues,
      savedWidgetData  : []
    };

    return service;

    function setApiService( apiServiceName ) {
      service.apiServiceName = apiServiceName;
      service.apiService     = $injector.get( apiServiceName );
    }

    function getWidgetData( widget, params ) {
      return service.apiService.getAndCombine( widget.sources, params );
    }

    function compileChart( widget ) {
      return {
        chart       : {
          type    : widget.templates[0] === 'timeline' ? 'line' : 'bar'
        },
        chartType   : widget.templates[0] === 'timeline' ? 'stock' : undefined,
        plotOptions : {
          line : {
            marker : {
              enabled : true,
              radius  : 3
            }
          }
        },
        legend      : {
          enabled       : true,
          verticalAlign : 'bottom',
          margin        : 0,
          padding       : 0
        },
        navigator   : {
          margin        : 10,
          height        : 15,
          xAxis         : {
            tickPixelInterval : 100
          }
        },
        series      : []
      };
    }


    function compileTable( widget ) {
      return {
        sortable   : true,
        onRowClick : _.partialRight( goToDetails, widget ),
        cssTRClass : 'grid-block tr clickable',
        columns    : getColumns( widget.sources )
      };
    }

    function getColumns( sources ) {
      return _.chain( sources )
        .flatMap( function( source ) {
          return source.properties;
        } )
        .map( function( property ) {
          return {
            key         : property.name || property.key,
            model       : property.path,
            order       : property.order,
            templateUrl : !!property.dataType ? ( 'iscBento/widget/' + property.dataType + '.html' ) : undefined
          };
        } )
        .uniqBy( 'key' )
        .value();
    }

    function goToDetails( row, widget ) {
      $rootScope.$emit( 'showDetailsPanel', {
        data       : row,
        sources    : widget.sources
      } );
    }

    function getSeries( data, source ) {
      return _.map( _.groupBy( data, _.get( source, 'groupBy.path' ) ), function( points, key ) {
        return {
          name : key,
          data : service.getValues( points, source )
        };
      } );
    }

    function getValues( data, source ) {
      return _.chain( data )
        .map( function( entry ) {
          return [new Date( _.get( entry, _.get( source, 'xAxis.path' ) ) ).valueOf(),
            _.get( entry, _.get( source, 'yAxis.path' ) )];
        } )
        .sortBy( '0' )
        .value();
    }

  }//END CLASS

} )();
