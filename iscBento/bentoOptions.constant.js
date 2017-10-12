/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:43:51 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .constant( 'BENTO_OPTIONS', {
      gridType          : 'scrollVertical',
      compactType       : 'compactUp&Left',
      mobileBreakpoint  : 760,
      margin            : 16,
      outerMargin       : true,
      draggable         : {
        enabled : true
      },
      resizable         : {
        enabled : true
      },
      swap              : false,
      pushItems         : true,
      displayGrid       : 'onDrag&Resize',
      pageTitle         : 'Patient Summary',
      scrollContainer   : '.isc-page'
    } );

} )();
