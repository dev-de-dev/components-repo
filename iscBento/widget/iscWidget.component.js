/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:39:10 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .component( 'iscWidget', {
      bindings    : {
        params     : '<?',
        widget     : '<',
        apiService : '<'
      },
      controller  : controller,
      controllerAs: 'widgetCtrl',
      templateUrl : /* @ngInject */ function( $element, $attrs ) {
        return $attrs.templateUrl || 'iscBento/widget/iscWidget.html';
      }
    } );

  /* @ngInject */
  function controller( devlog, $rootScope, widgetService, $interval, $timeout, BENTO_EVENTS, $scope, $element ) {
    var log = devlog.channel( 'iscWidget' );

    var self = this;
    var savedWidget = _.find( widgetService.savedWidgetData, { id : _.get( self, 'widget.id' ) } );

    widgetService.setApiService( self.apiService || 'api' );

    _.extend( self, {
      $onInit                 : $onInit,
      $postLink               : $postLink,
      $onChanges              : $onChanges,
      $onDestroy              : $onDestroy,
      getData                 : getData,
      saveWidget              : saveWidget,
      deleteWidget            : deleteWidget,
      makeConfig              : makeConfig,
      hideEmpty               : hideEmpty,
      changeConfiguration     : changeConfiguration,
      startCounter            : startCounter,
      checkTime               : checkTime,
      selectedDirective       : widgetService.directiveChoices[0]
    }, savedWidget || {} );

    /**
     * This lifecycle hook will be executed when all controllers on an element have been constructed and after their bindings are initialized.
     * This hook is meant to be used for any kind of initialization work of a controller.
     * To get a better idea of how this behaves, let’s take a look at some code.
     */

    function $onInit() {
      log.debug( '$onInit' );

      if ( self.widget && !self.data ) {
        self.loading = true;
        self.getData( self.widget );
        if ( self.widget.templates && !self.config ) {
          self.makeConfig( self.widget );
        }
      } else {
        onDataLoad();
      }
    }

    /**
     * In Angular 1.5 it gets even better, because there’s a lifecycle hook called $postLink(),
     * which not only can be the place where we do all of the DOM manipulation,
     * but it’s also the hook where we know that all child directives have been compiled and linked.
     */
    function $postLink() {

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

    function deleteWidget() {
      $rootScope.$emit( BENTO_EVENTS.deleteWidget, self.widget.id );
    }

    function changeConfiguration( tabNumber ) {
      $rootScope.$emit( BENTO_EVENTS.editWidget, self.widget, tabNumber, self.makeConfig );
    }

    function hideEmpty() {
      $rootScope.$emit( BENTO_EVENTS.hideEmpty );
    }

    function saveWidget() {
      $rootScope.$emit( BENTO_EVENTS.saveWidget, self.widget );
    }


    function getData( widget ) {
      if ( _.isEmpty( self.params ) ) {
        self.data = [];
        self.widget.noData = _.isEmpty( self.data );
        self.loading = false;
        return;
      }

      var params = {
        patient : _.get( self, 'params.id' )
      };

      widgetService.getWidgetData( widget, params )

      // This block runs once all calls are resolved
      .then( function( combined ) {
        self.data = combined;
        self.widget.noData = _.isEmpty( self.data );
        self.loading = false;

        if ( widget.templates[0] !== 'table' ) {
          _.forEach( widget.sources, function( source ) {
            // This initializes or adds to the series property for highcharts. input data and source, receive formatted series data
            _.set( self, 'config.series', _.concat( _.get( self, 'config.series' ), widgetService.getSeries( self.data, source ) ) );
          } );
        }

        if ( !self.widget.noData ) {
          onDataLoad();
        }
      } );
    }

    function onDataLoad() {
      self.startCounter( moment() );
      _.delay( function() { self.showIndicator = isThereScrolling(); }, 500 );
      $scope.$on( 'gridster-item-resize', _.debounce( onResize, 500 ) );
      if ( self.widget ) {
        widgetService.savedWidgetData.push( { id : self.widget.id, data : self.data, config : self.config, selectedDirective : self.selectedDirective } );
      }
    }

    function startCounter( resolveTime ) {
      self.lastUpdated = resolveTime.fromNow();
      self.checkTime( resolveTime, self.lastUpdated );
    }

    function checkTime( startTime, previous ) {
      $interval( function( ) {
        if ( !_.isEqual( startTime.fromNow(), previous ) ) {
          self.lastUpdated = null;
          previous = startTime.fromNow();

          $timeout( function() {
            self.lastUpdated = previous;
          }, 100 );
        }
      }, 15000 );
    }

    function makeConfig( widget ) {
      if ( widget.templates[0] === 'table' ) {
        self.config = widgetService.compileTable( widget );
      } else {
        self.config = widgetService.compileChart( widget );
      }

      self.selectedDirective = _.find( widgetService.directiveChoices, { type : widget.templates[0] } );
    }

    function onResize() {
      _.invoke( _.result( self, 'config.getChartObj', { reflow : _.noop } ), 'reflow' );
      self.showIndicator = isThereScrolling();
    }

    function isThereScrolling() {
      var widgetWidth = $element.find( '.widget-content' )[0].clientWidth;
      var tableWidth  = _.get( $element.find( '.grid-table' ), '[0].clientWidth', 0 );
      return tableWidth > widgetWidth;
    }

  }

} )();
