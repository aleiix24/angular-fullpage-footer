;(function() {
  'use strict';

  angular
    .module('fullPage.js', [])
    .directive('fullPage', fullPage);

  fullPage.$inject = ['$timeout', '$rootScope', '$window', '$document'];

  function fullPage($timeout, $rootScope, $window, $document) {
    var directive = {
      restrict: 'A',
      scope: {options: '='},
      link: link
    };

    return directive;

    function link(scope, element) {
      var pageIndex;
      var slideIndex;

      var rebuild = function() {
        destroyFullPage();
        if (angular.element($window).width() > 800) angular.element(element).fullpage(sanatizeOptions(scope.options));
      };

      var destroyFullPage = function() {
        if ($.fn.fullpage.destroy) {
          $.fn.fullpage.destroy('all');
        }
      };
      var destroyFullPageAndUnBind = function() {
        $timeout(function(){
          destroyFullPage();
        }, 200);
      };

      var sanatizeOptions = function(options) {
        options.onLeave = function(page, next){
          pageIndex = next;
          $rootScope.$emit("currentSlide", {data: pageIndex});
        };

        options.onSlideLeave = function(anchorLink, page, slide, direction, next){
          pageIndex   = page;
          slideIndex  = next;
        };

        options.afterRender = function(){
          //We want to remove the HREF targets for navigation because they use hashbang
          //They still work without the hash though, so its all good.
          if (options && options.navigation) {
            $('#fp-nav').find('a').removeAttr('href');
          }

          if (pageIndex) {
            $timeout(function() {
              $.fn.fullpage.silentMoveTo(pageIndex, slideIndex);
            });
          }
        };

        //if we are using a ui-router, we need to be able to handle anchor clicks without 'href="#thing"'
        $(document).on('click', '[data-menuanchor]', function () {
          $.fn.fullpage.moveTo($(this).attr('data-menuanchor'));
        });

        return options;
      };

      var watchNodes = function() {
        return element[0].getElementsByTagName('*').length;
      };
      /*var resizeEvent = windowEl.bind('resize', function(){
        $timeout(function(){
          rebuild();
        }, 10);
      });*/
      scope.$watch(watchNodes, rebuild, true);

      scope.$watch('options', rebuild, true);

      element.on('$destroy', destroyFullPageAndUnBind);

      $rootScope.$on('disableScrollEvent', function(){
        $.fn.fullpage.setAllowScrolling(false);
      });
      $rootScope.$on('enableScrollEvent', function(){
        $.fn.fullpage.setAllowScrolling(true);
      });
    }
  }

})();
