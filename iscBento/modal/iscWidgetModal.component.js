/**
 * Created by Debashish Mohapatra on 1/18/2017, 1:39:10 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'iscBento' )
    .component( 'iscWidgetModal', {
      bindings    : {
        endPoints : '<'
      },
      controller  : controller,
      controllerAs: 'modalCtrl',
      templateUrl : /* @ngInject */ function( $element, $attrs ) {
        return $attrs.templateUrl || 'iscBento/modal/iscWidgetModal.html';
      }
    } );

  /* @ngInject */
  function controller( devlog, api, $scope, widgetModalService, FoundationApi, $rootScope, BENTO_EVENTS ) {
    var log = devlog.channel( 'iscWidgetModal' );

    var self = this;

    _.extend( self, {
      $onInit                 : $onInit,
      $postLink               : $postLink,
      $onChanges              : $onChanges,
      $onDestroy              : $onDestroy,
      save                    : save,
      scroll                  : scroll,
      cancel                  : cancel,
      selectAll               : selectAll,
      updateProperties        : updateProperties,
      updateSources           : updateSources,
      getProperties           : getProperties,
      initializeWidget        : initializeWidget,
      renameProperty          : renameProperty,
      renameWidget            : renameWidget,
      addTemplate             : addTemplate,
      changeExtraProperties   : changeExtraProperties,
      mapPropertyTypes        : mapPropertyTypes,
      changeOrder             : changeOrder,
      addParams               : addParams,
      widget                  : _.cloneDeep( widgetModalService.widget ),
      displayTypes            : widgetModalService.displayTypes,
      subTypes                : widgetModalService.subTypes,
      tabs                    : _.reject( widgetModalService.tabs, 'hide' ),
      tabWidth                : widgetModalService.tabWidth,
      activeTab               : widgetModalService.tabs[0],
      makeConfig              : _.noop,
      isArray                 : angular.isArray
    } );

    function addTemplate( displayObj ) {
      if ( displayObj.selected ) {
        self.widget.templates.push( displayObj.type );
      } else {
        _.pull( self.widget.templates, displayObj.type );
      }
    }

    function addParams( source, params ) {
      _.find( self.widget.sources, { type : source.type } ).params = params;
    }

    function updateSources( source ) {
      if ( source.selected ) {
        self.widget.sources.push( _.assign( { properties: [], params : '' }, source ) );
        self.getProperties( source );
      } else {
        _.remove( self.widget.sources, { type : source.type } );

        if ( _.isEmpty( self.widget.sources ) ) {
          _.find( widgetModalService.tabs, { name : 'properties' } ).hide = true;
          self.tabs = _.reject( widgetModalService.tabs, 'hide' );
        }
      }
      self.renameWidget();
    }

    function getProperties( source, tabNumber ) {
      api.get( 'config/properties', [source.type] ).then( function( results ) {
        var widgetSource = _.find( self.widget.sources, { type : source.type } );
        source.orderCount = _.size( _.get( widgetSource, 'properties' ) );
        source.properties = _.reject( results.properties, { dataType : 'object' } );

        self.mapPropertyTypes( source );

        _.forOwn( source, function( properties, key ) {
          if ( key !== 'properties' && _.isArray( properties ) ) {
            self.changeExtraProperties( source, properties, key );
          }
        } );

        if ( _.isNumber( tabNumber ) ) {
          _.forEach( source.properties, function( property ) {
            property.selected = _.some( widgetSource.properties, { key : property.key } );
            property.order = _.get( _.find( widgetSource.properties, { key : property.key } ), 'order' );
          } );
        }
        source.allSelected = _.every( source.properties, 'selected' );
        widgetModalService.scrollDiv.scrollLeft( _.get( self, ['tabs', tabNumber, 'position'] ) );
      } );

      _.find( widgetModalService.tabs, { name : 'properties' } ).hide = false;
      self.tabs = _.reject( widgetModalService.tabs, 'hide' );
    }

    function mapPropertyTypes( source ) {
      source.groupBy    = _.cloneDeep( _.filter( source.properties, { dataType : 'code' } ) );
      source.xAxis      = _.cloneDeep( _.filter( source.properties, { dataType : 'dateTime' } ) );
      source.yAxis      = _.cloneDeep( _.filter( source.properties, { dataType : 'numeric' } ) );
    }

    function changeExtraProperties( source, properties, key ) {
      var widgetSource = _.find( self.widget.sources, { type : source.type } );
      _.set( widgetSource, key, _.find( properties, 'selected' ) || _.first( properties ) || '' );
    }

    function renameWidget( name ) {
      var sources = _.map( self.widget.sources, 'type' );
      self.widget.name = self.namedByUser ? self.widget.name : ( name || _.join( sources, ' & ' ) );
      self.namedByUser = self.widget.name && ( self.namedByUser || !!name );
    }

    function updateProperties( source, property ) {
      var widgetSource = _.find( self.widget.sources, { type : source.type } );

      if ( property.selected ) {
        widgetSource.properties.push( property );
        source.orderCount++;
        property.order = source.orderCount;
      } else {
        _.remove( widgetSource.properties, { key : property.key } );
        source.orderCount--;
        property.order = "";
      }

      source.allSelected = _.every( source.properties, 'selected' );
    }

    function changeOrder( source, property ) {
      var widgetSource = _.find( self.widget.sources, { type : source.type } );
      _.find( widgetSource.properties, { key : property.key } ).order = property.order;
    }

    function renameProperty( property, type ) {
      var source = _.find( self.widget.sources, { type : type } );
      _.find( source.properties, { key : property.key } ).name = property.name;
    }

    function scroll( back ) {
      var value;

      if ( !back ) {
        value = _.add( self.activeTab.position, widgetModalService.tabWidth );
      } else {
        value = widgetModalService.scrollDiv.scrollLeft() > self.activeTab.position ? self.activeTab.position : self.activeTab.position - widgetModalService.tabWidth;
      }

      widgetModalService.scrollDiv.animate( { scrollLeft : value, scrollTop : 0 }, {
        complete : checkPosition
      } );
    }

    // finds which tab is in view and sets it to be the active tab
    function checkPosition( event ) {
      _.forEach( self.tabs, function( tab ) {
        if ( tab.isVisible( _.get( event, 'target.scrollLeft', widgetModalService.scrollDiv.scrollLeft() ) ) ) {
          $scope.$apply( function() {
            self.activeTab = tab;
          } );
          return false;
        }
      } );
    }

    function save() {
      $rootScope.$emit( BENTO_EVENTS.saveModalWidget, _.cloneDeep( self.widget ), self.makeConfig );
    }

    function attachScrollListener() {
      widgetModalService.scrollDiv = $( '#scroll-div' );

      widgetModalService.scrollDiv.scroll( _.debounce( checkPosition, 100, {
        leading  : false,
        trailing : true
      } ) );
    }

    function initializeWidget( event, widget, tabNumber, makeConfigFunction ) {
      self.widget       = _.cloneDeep( widget );
      _.forEach( self.displayTypes, function( displayType ) {
        displayType.selected = _.includes( self.widget.templates, displayType.type );
      } );

      _.forEach( self.endPoints, function( endPoint ) {
        if ( _.some( self.widget.sources, { type : endPoint.type } ) ) {
          endPoint.selected = true;
          self.getProperties( endPoint, tabNumber );
        }
      } );

      self.makeConfig = makeConfigFunction;
    }

    function selectAll( endPoint ) {
      var widgetSource = _.find( self.widget.sources, { type : endPoint.type } );

      _.forEach( endPoint.properties, function( property, index ) {
        property.selected = endPoint.allSelected;
        property.order = property.order || index + 1;
      } );

      widgetSource.properties = endPoint.allSelected ? _.cloneDeep( endPoint.properties ) : [];
    }

    function cancel() {
      widgetModalService.scrollDiv.scrollLeft( 0 );
      self.widget    = _.cloneDeep( widgetModalService.widget );
      self.endPoints = _.map( self.endPoints, _.partialRight( _.pick, 'type' ) );
      self.displayTypes = _.map( self.displayTypes, _.partialRight( _.omit, 'selected' ) );
      _.find( widgetModalService.tabs, { name : 'properties' } ).hide = true;
      self.tabs = _.reject( widgetModalService.tabs, 'hide' );
    }

    function $onInit() {
      log.debug( '$onInit', self );
      FoundationApi.subscribe( 'iscWidgetModal', function( event ) {
        if ( event === 'close' ) {
          _.delay( self.cancel, 500 );
        }
      } );
      $rootScope.$on( BENTO_EVENTS.editWidget, self.initializeWidget );
    }

    /**
     * In Angular 1.5 it gets even better, because there’s a lifecycle hook called $postLink(),
     * which not only can be the place where we do all of the DOM manipulation,
     * but it’s also the hook where we know that all child directives have been compiled and linked.
     */
    function $postLink() {
      log.debug( '$postLink', self );
      $scope.$applyAsync( attachScrollListener );
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
