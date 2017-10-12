/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:52:32 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .factory( 'widgetModalService', widgetModalService );

  /* @ngInject */
  function widgetModalService( devlog ) {

    var log = devlog.channel( 'widgetModalService' );
    log.debug( 'widgetModalService LOADED' );

    // ----------------------------
    // class factory
    // ----------------------------

    var tabs = [{
      instructions : 'Choose Data Sources',
      position     : 0,
      isVisible    : isVisible,
      name         : 'sources'
    },
    {
      instructions : 'Choose a Display Format',
      isVisible    : isVisible,
      name         : 'display',
      get position () { return service.tabWidth; }
    },
    {
      instructions : 'Choose Data Properties To Include',
      isVisible    : isVisible,
      name         : 'properties',
      hide         : true,
      get position () { return service.tabWidth * 2; }
    }];

    var displayTypes = [
      { name : 'Table',    type : 'table',    icon : 'iscBento/svg/table-icon.html' },
      { name : 'Timeline', type : 'timeline', icon : 'iscBento/svg/timeline-icon.html' },
      { name : 'Chart',    type : 'chart',    class : 'fa fa-bar-chart fa-4x text-center' }
    ];

    var subTypes = [
      { name : 'Pie',    type : 'pie',    class : 'fa fa-pie-chart fa-4x text-center' },
      { name : 'Line',   type : 'line',   class : 'fa fa-line-chart fa-4x text-center' },
      { name : 'Bar',    type : 'bar',    class : 'fa fa-bar-chart fa-4x text-center' }
    ];

    var widget = {
      desktop    : {
        cols      : 1,
        rows      : 1
      },
      tablet     : {
        cols      : 1,
        rows      : 1
      },
      sources    : [],
      templates  : []
    };

    var service = {
      scrollDiv    : { width : _.noop, scrollLeft : _.noop },
      tabs         : tabs,
      displayTypes : displayTypes,
      subTypes     : subTypes,
      widget       : widget,
      get tabWidth () { return this.scrollDiv.width(); }
    };

    return service;

    function isVisible( scrollPosition ) {
      return _.inRange( scrollPosition, this.position, this.position + service.tabWidth );
    }

  }//END CLASS

} )();
