/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:39:10 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .component( 'iscBentoPanel', {
      bindings    : {
        params: '<?'
      },
      controller  : controller,
      controllerAs: 'panelCtrl',
      templateUrl : /* @ngInject */ function( $element, $attrs ) {
        return $attrs.templateUrl || 'iscBento/panel/iscBentoPanel.html';
      }
    } );

  /* @ngInject */
  function controller( devlog, $rootScope, FoundationApi, api, widgetService, widgetModalService ) {
    var log = devlog.channel( 'iscPanel' );

    var self = this;

    var chartSource = {
      groupBy : {
        key  : 'code_display',
        path : 'resource.code.coding[0].display'
      },
      xAxis   : {
        key  : 'effectiveDateTime',
        path : 'resource.effectiveDateTime'
      },
      yAxis   : {
        key  : 'valueQuantity_value',
        path : 'resource.valueQuantity.value'
      }
    };

    _.extend( self, {
      $onInit                 : $onInit,
      $postLink               : $postLink,
      $onChanges              : $onChanges,
      $onDestroy              : $onDestroy,
      showDetails             : showDetails,
      getProperties           : getProperties,
      getChartData            : getChartData,
      addChartToDashboard     : addChartToDashboard
    } );

    /**
     * This lifecycle hook will be executed when all controllers on an element have been constructed and after their bindings are initialized.
     * This hook is meant to be used for any kind of initialization work of a controller.
     * To get a better idea of how this behaves, let’s take a look at some code.
     */

    function showDetails( event, details ) {
      self.detailsData = details.data;
      self.sources     = details.sources;

      _.forEach( self.sources, function( source ) {
        if ( !source.properties ) {
          self.getProperties( source );
        }
      } );

      FoundationApi.publish( 'detailsPanel', 'open' );
    }

    function getProperties( source ) {
      api.get( 'config/properties', [source.type] ).then( function( results ) {
        source.properties = _.reject( results.properties, { dataType : 'object' } );
      } );
    }

    function addChartToDashboard( widget ) {
      $rootScope.$emit( 'saveModalWidget', widget );
    }

    function getChartData( entry ) {
      var type   = entry.resource.resourceType;
      var coding = _.get( entry, 'resource.code.coding[0]' );

      var params = {
        patient : _.get( self, 'params.id' ),
        code    : coding.code
      };

      widgetService.apiService.get( type, params )

      .then( function( results ) {
        entry.widget = _.cloneDeep( _.assign( { name : coding.display }, widgetModalService.widget ) );
        entry.widget.templates.push( 'timeline' );
        entry.widget.sources.push( _.assign( { type : type, params : '?code=' + coding.code }, chartSource ) );
        entry.config = widgetService.compileChart( entry.widget );
        entry.config.series = widgetService.getSeries( results.entry, entry.widget.sources[0] );
      } );
    }

    function $onInit() {
      log.debug( '$onInit' );
      $rootScope.$on( 'showDetailsPanel', self.showDetails );
    }

    /**
     * In Angular 1.5 it gets even better, because there’s a lifecycle hook called $postLink(),
     * which not only can be the place where we do all of the DOM manipulation,
     * but it’s also the hook where we know that all child directives have been compiled and linked.
     */
    function $postLink() {
      log.debug( '$postLink', self );
    }

    /**
     * This hook allows us to react to changes of one-way bindings of a component.
     * changesObj is an object that holds the changes of all one-way bindings with the currentValue and the previousValue.
     * @param changesObj
     */
    function $onChanges( changesObj ) {
      log.debug( '$onChanges' );
    }

    /**
     * $onDestroy() is a hook that is called when its containing scope is destroyed.
     * We can use this hook to release external resources, watches and event handlers.
     */
    function $onDestroy() {
      log.debug( '$onDestroy' );
    }

  }

} )();
