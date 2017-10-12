/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:43:51 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .constant( 'BENTO_EVENTS', {
      deleteWidget   : 'deleteWidget',
      hideEmpty      : 'hideEmpty',
      editWidget     : 'editWidget',
      saveWidget     : 'saveWidget',
      saveModalWidget: 'saveModalWidget',
      filterWidgets  : 'filterWidgets'
    } );

} )();
