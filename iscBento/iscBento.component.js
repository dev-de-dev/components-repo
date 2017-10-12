/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:39:10 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .component( 'iscBento', {
      bindings    : {
        widgets   : '<?',
        apiService: '@',
        options   : '<?',
        params    : '<?',
        endPoints : '<?'
      },
      controller  : controller,
      controllerAs: 'bentoCtrl',
      templateUrl : /* @ngInject */ function( $element, $attrs ) {
        return $attrs.templateUrl || 'iscBento/iscBento.html';
      }
    } );

  /* @ngInject */
  function controller( devlog, $rootScope, bentoService, api, BENTO_EVENTS, $window ) {
    var log = devlog.channel( 'iscBento' );

    var self = this;

    _.extend( self, {
      $onInit           : $onInit,
      $postLink         : $postLink,
      $onChanges        : $onChanges,
      $onDestroy        : $onDestroy,
      widgets           : self.widgets || _.get( bentoService, 'config.configuration' ),
      options           : self.options || bentoService.bentoOptions,
      hasParams         : !_.isEmpty( self.params ),
      deleteWidget      : deleteWidget,
      deleteAll         : deleteAll,
      hideEmpty         : hideEmpty,
      saveModalWidget   : saveModalWidget,
      filterRecord      : filterRecord,
      filterWidgets     : filterWidgets,
      setGridSize       : bentoService.setGridSize,
      emptyWidgetsHidden: false,
      filters           : [],
      ngRepeatFilter    : ngRepeatFilter
    } );

    var listeners = [];

    /**
     * This lifecycle hook will be executed when all controllers on an element have been constructed and after their bindings are initialized.
     * This hook is meant to be used for any kind of initialization work of a controller.
     * To get a better idea of how this behaves, let’s take a look at some code.
     */
    function $onInit() {
      log.debug( '$onInit' );
      listeners.push( $rootScope.$on( BENTO_EVENTS.deleteWidget, self.deleteWidget ) );
      listeners.push( $rootScope.$on( BENTO_EVENTS.hideEmpty, _.partial( self.hideEmpty, true ) ) );
      listeners.push( $rootScope.$on( BENTO_EVENTS.saveModalWidget, self.saveModalWidget ) );
      listeners.push( $rootScope.$on( BENTO_EVENTS.filterWidgets, self.filterWidgets ) );
      angular.element( $window ).on( 'resize', bentoService.adjustHeight );
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
      _.forEach( listeners, function( off ) {
        off();
      } );
    }


    function filterRecord( filter ) {
      log.debug( 'filter', filter );
    }

    function saveModalWidget( event, widget, makeConfig ) {
      api.post( 'config/widgets', { configuration: [widget], dashboard: bentoService.config.id } ).then( function( results ) {
        widget.id = _.get( results, ['configuration', '0', 'id'], widget.id );

        if ( _.find( self.widgets, { id: widget.id } ) ) {
          self.widgets[_.findIndex( self.widgets, { id: widget.id } )] = widget;
          makeConfig( widget );
        } else {
          self.widgets.push( widget );
          bentoService.adjustHeight();
        }
      } );
    }

    function deleteWidget( event, id ) {
      api.delete( 'config/widgets', [id] ).then( function() {
        _.remove( self.widgets, { id: id } );
        bentoService.adjustHeight();
      } );
    }

    function deleteAll() {
      api.delete( 'config/widgets' ).then( function( result ) {
        self.widgets = [];
      } );
    }

    function hideEmpty( hide ) {
      self.emptyWidgetsHidden = hide;
      _.forEach( self.widgets, function( widget ) {
        widget.empty = hide && widget.noData;
      } );
      bentoService.adjustHeight();
    }

    function filterWidgets( $event, resources ) {
      if ( _.isEmpty( resources ) ) {
        self.widgets.forEach( function( widget ) {
          widget.hide = false;
        } );
      }
      self.widgets.forEach( function( widget ) {
        var sources = _.map( widget.sources, 'type' );
        widget.hide = _.isEmpty( _.intersection( resources, sources ) );
      } );
      bentoService.adjustHeight();
    }

    function ngRepeatFilter( item ) {
      return !item.hide;
    }

  }


} )();
