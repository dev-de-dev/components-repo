/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:52:32 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .factory( 'bentoService', bentoServiceService );

  /* @ngInject */
  function bentoServiceService( devlog, BENTO_OPTIONS, api ) {

    var log = devlog.channel( 'bentoServiceService' );
    log.logFn( 'LOADED' );

    // ----------------------------
    // class factory
    // ----------------------------
    var debouncedHeightAdjust = _.debounce( adjustHeight, 500 );

    var service = {
      setGridSize    : setGridSize,
      config         : {},
      bentoOptions   : _.extend( BENTO_OPTIONS, {
        itemChangeCallback : _.debounce( itemChangeCallback, 500 ),
        initCallback       : debouncedHeightAdjust
      } ),
      adjustHeight   : debouncedHeightAdjust
    };

    return service;

    // ----------------------------
    // functions
    // ----------------------------

    function setGridSize( device, gridSize ) {
      _.set( service, 'device', device );
      _.set( this, 'options.maxCols', gridSize );
      _.set( this, 'options.minCols', gridSize );
      _.invoke( this, 'options.api.optionsChanged' );
    }

    function itemChangeCallback() {
      var widgets = _.map( service.config.configuration, function( widget ) {
        return _.pick( widget, [service.device, 'id'] );
      } );

      api.post( 'config/dashboards/' + service.config.id, {
        name          : service.config.name,
        configuration : widgets
      } );

      service.adjustHeight();
    }

    function adjustHeight() {
      // elemHeight is the widget furthest down on the page - we set the surrounding div to that height
      var elemHeight = _.max( _.map( $( '.isc-bento .widget' ), function( widget ) {
        return widget.offsetTop + widget.offsetHeight;
      } ) );
      // divHeight is whichever is longer, the page itself or the height of the longest widget
      var divHeight = _.max( [elemHeight + BENTO_OPTIONS.margin, $( '.dashboard' ).height()] );
      $( '.isc-bento' ).animate( { height : divHeight } );
    }

  }//END CLASS

} )();
