( function() {
  'use strict';

  describe( 'magicbox', function() {

    var suite;
    var html = '<magicbox meta="meta"></magicbox>';

    beforeEach( module( 'magicbox' ) );

    // this loads all the external templates used in directives etc
    // eg, everything in templates/**/*.html
    beforeEach( module( 'isc.templates' ) );

    beforeEach( inject( function( $rootScope, $compile, $httpBackend, $document, $templateCache ) {
      suite = window.createSuite( {
        $rootScope    : $rootScope,
        $scope        : $rootScope.$new(),
        $httpBackend  : $httpBackend,
        $compile      : $compile,
        $document     : $document,
        $templateCache: $templateCache
      } );
    } ) );

    function compile() {
      suite.element = suite.$compile( html )( suite.$scope );
      suite.$scope.$digest();
      suite.componentScope = suite.element.isolateScope();
    }

    // -------------------------
    describe( 'setup tests ', function() {
      it( 'should have compiled correctly', function() {
        compile();
        expect( suite.$scope ).toBeDefined();
        expect( suite.element ).toBeDefined();
        expect( suite.element.html() ).toBe( '' );
        expect( suite.componentScope ).toBeDefined();
      } );
    } );

    describe( 'rendering nested component in 3 different ways', function() {

      it( 'should render from meta.component', function() {
        suite.$scope.meta = { component: "isc-component" };
        compile();
        var expected = suite.element.find( 'isc-component' );
        expect( expected.length ).toBe( 1 );
      } );

      it( 'should render from meta.templateUrl', function() {
        suite.$templateCache.put( 'magicbox-test.html', "<isc-template-url></isc-template-url>" );
        suite.$scope.meta = { templateUrl: "magicbox-test.html" };
        compile();
        var expected = suite.element.find( 'isc-template-url' );
        expect( expected.length ).toBe( 1 );
      } );

      it( 'should render from meta.template', function() {
        suite.$scope.meta = { template: "<isc-template></isc-template>" };
        compile();
        var expected = suite.element.find( 'isc-template' );
        expect( expected.length ).toBe( 1 );
      } );

      it( 'should render meta.component before meta.templateUrl', function() {
        suite.$templateCache.put( 'magicbox-test.html', "<isc-template-url></isc-template-url>" );
        suite.$scope.meta = { component: "isc-component", templateUrl: "magicbox-test.html" };
        compile();
        var expected = suite.element.find( 'isc-component' );
        expect( expected.length ).toBe( 1 );
      } );

      it( 'should render meta.templateUrl before meta.template', function() {
        suite.$templateCache.put( 'magicbox-test.html', "<isc-template-url></isc-template-url>" );
        suite.$scope.meta = { template: "<isc-template></isc-template>", templateUrl: "magicbox-test.html" };
        compile();
        var expected = suite.element.find( 'isc-template-url' );
        expect( expected.length ).toBe( 1 );
      } );
    } );

    describe( 'passing data to the nested', function() {
      it( 'should be scoped to the invoker/parent', function() {
        suite.$scope.meta = { template: "<div id='nested' ng-if='true'>parent name: {{name}}</div>" };
        suite.$scope.name = 'parent';
        compile();
        var expected = suite.element.find( '#nested' ).html();
        expect( expected ).toEqual( 'parent name: parent' );
      } );

      it( 'should pass data to component child', function() {
        suite.$scope.meta = { component: "isc-component-with-attr", attrs: { "username": "name" } };
        suite.$scope.name = 'parent';
        compile();
        var expected = suite.element.find( 'isc-component-with-attr' );
        expect( expected.attr( 'username' ) ).toEqual( 'name' );
      } );

      it( 'should convert camelCased attribute names to kebab-cased attribute names', function() {
        suite.$scope.meta = {
          component: "isc-component-with-attr",
          attrs    : { "camelAttrName": "attrValue" }
        };
        suite.$scope.name = 'parent';
        compile();
        var expected = suite.element.find( 'isc-component-with-attr' );
        expect( expected.attr( 'camel-attr-name' ) ).toEqual( 'attrValue' );
      } );
    } );

    describe( 'meta data updating', function() {
      it( 'should also update the rendered content', function() {
        suite.$scope.meta = { template: "<isc-template></isc-template>" };
        compile();
        var expected = suite.element.find( 'isc-template' );
        expect( expected.length ).toBe( 1 );

        suite.$scope.meta = { component: "isc-component" };
        suite.$scope.$apply();
        expected = suite.element.find( 'isc-component' );
        expect( expected.length ).toBe( 1 );
      } );

      it( 'should clean up the previous content if changed dynamically', function() {
        suite.$scope.meta = { template: "<isc-template></isc-template>" };
        compile();
        var expected = suite.element.find( 'isc-template' );
        expect( expected.length ).toBe( 1 );

        suite.$scope.meta = { component: "isc-component" };
        suite.$scope.$apply();

        // The childScope for the compiled component is held in the controller
        expect( suite.componentScope.vm.childScope ).toBeDefined();

        // Expect $destroy to be called when changes to the magicbox occur which cause an internal recompilation
        spyOn( suite.componentScope.vm.childScope, '$destroy' ).and.callThrough();
        var destroy = suite.componentScope.vm.childScope.$destroy;
        expect( destroy ).toBeDefined();

        suite.$scope.meta = { component: "isc-a-different-component" };
        suite.$scope.$apply();
        expect( destroy ).toHaveBeenCalled();
      } );
    } );
  } );
} )();

