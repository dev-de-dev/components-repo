/**
 * Created by Debashish Mohapatra on 1/26/17.
 */

( function() {
  'use strict';

  angular
    .module( 'magicbox' )
    .component( 'magicbox', {
      bindings    : {
        "meta": "<"
      },
      controller  : controller,
      controllerAs: 'vm',
      templateUrl : /* @ngInject */ function( $element, $attrs ) {
        return $attrs.templateUrl || 'magicbox/magicbox.html';
      }
    } );


  /**
   * Magicbox component provides the ability to dynamically specify/render component/content.
   * Magicbox also exposes parent $scope to the dynamic components
   *
   * Usage: <magicbox meta="meta"></magicbox>
   *
   * It supports 3 different inputs:
   * 1. meta.component - angular 1.5 component
   *   e.g. meta = { component: "isc-my-component", attrs: { "patient-name": "{{patient.name}}", "ng-click":"expanded=!expanded" } }
   *   output (pre Angular compile):
   *   <isc-my-component patient-name="{{patient.name}}" ng-click="expanded=!expanded"></isc-my-component>
   *
   * 2. meta.templateUrl - html from $templateCache
   *   e.g. meta = { templateUrl: "path/to/template.html" }
   *   output (pre Angular compile):  //The html snippet below is the content of 'path/to/template.html'
   *   <div>
   *     I am the content inside of 'path/to/template.html' html file
   *   </div>
   *
   * 3. meta.template - custom template string
   *   e.g. meta = { template: "<my-element ng-class='{active:patient==$ctrl.currentPatient}'>{{patient.name}}</my-element>" }
   *   output (pre Angular compile):
   *   <my-element ng-class="{active:patient==$ctrl.currentPatient}>"
   *     {{patient.name}}
   *   </my-element>
   *
   * @param $scope
   * @param $compile
   * @param $element
   * @param $templateCache
   */
  function controller( $scope, $compile, $element, $templateCache ) {
    var self = this;

    _.extend( self, {
      $postLink : $postLink,
      $onChanges: $onChanges,
      $onDestroy: $onDestroy,
      childScope: null
    } );

    /**
     * dynamically compile and render content
     */
    function compile() {
      // clean up previous scope, if this instance is used dynamically
      cleanUp();

      var templateStr;
      var tag         = _.get( self, "meta.component" );
      var templateUrl = _.get( self, "meta.templateUrl" );
      var template    = _.get( self, "meta.template" );

      if ( tag ) {
        templateStr = createElementFromTag( tag, _.get( self, "meta.attrs" ) );
      }
      else if ( templateUrl ) {
        templateStr = $templateCache.get( templateUrl );
      }
      else if ( template ) {
        templateStr = template;
      }

      if ( !templateStr ) { //do nothing if templateStr is invalid
        return;
      }

      $element.addClass( _.get( self, 'meta.fieldClass', '' ) );
      self.childScope = $scope.$parent.$new();
      $element.html( $compile( templateStr )( self.childScope ) );
    }

    function cleanUp() {
      if ( self.childScope ) {
        self.childScope.$destroy();
      }
    }

    function createElementFromTag( tag, attrs ) {
      // Convert the attributes to kebab case before creating the magicbox
      // e.g., meta.attrs of:
      // { one : '1', two : '2', twentyThree : '23' }
      // should be compiled as these attributes:
      // <tag one="1" two="2" twenty-three="23"></tag>
      _.forEach( attrs, ensureKebabCase );
      return angular.element( "<" + tag + "></" + tag + ">", attrs );

      function ensureKebabCase( attrValue, attrName ) {
        delete attrs[attrName];
        attrs[_.kebabCase( attrName )] = attrValue;
      }
    }

    function $postLink() {
      compile();
    }

    function $onChanges( changesObj ) {
      compile();
    }

    function $onDestroy() {
      cleanUp();
    }


  }

} )();
