(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.dashboard.router', [])
    .config(registerRoute);

  function registerRoute($stateProvider) {

    // Cloud Foundry
    $stateProvider.state('endpoint.clusters.router', {
      url: '',
      template: '<ui-view/>',
      controller: ClustersRouterController,
      controllerAs: 'clustersRouterCtrl',
      ncyBreadcrumb: {
        skip: true
      }
    });
  }

  /**
   * @name ClustersRouterController
   * @description Redirects the user to either the Organizations Detail page or
   * the Cluster tiles page depending on the number of CF instances connected.
   * @param {object} $q - the Angular $q service
   * @param {object} $state - the UI router $state service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {object} appBusyService - the appBusyService service
   * @constructor
   */
  function ClustersRouterController($q, $state, modelManager, appUtilsService, appBusyService) {

    var serviceInstanceModel = modelManager.retrieve('app.model.serviceInstance');
    var userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');

    appUtilsService.chainStateResolve('endpoint.clusters.router', $state, init);

    function init() {
      var appBusyId = appBusyService.set('cf.busy');

      return $q.all([serviceInstanceModel.list(), userServiceInstanceModel.list()])
        .then(function () {

          var connectedInstances = 0;
          var serviceInstanceGuid;
          var cfInstances = _.filter(serviceInstanceModel.serviceInstances, {cnsi_type: 'cf'});
          _.forEach(cfInstances, function (cfInstance) {
            if (_.get(userServiceInstanceModel.serviceInstances[cfInstance.guid], 'valid', false)) {
              serviceInstanceGuid = cfInstance.guid;
              connectedInstances += 1;
            }
          });

          appBusyService.clear(appBusyId);

          if (connectedInstances === 1) {
            $state.go('endpoint.clusters.cluster.detail.organizations', {guid: serviceInstanceGuid});
          } else {
            $state.go('endpoint.clusters.tiles', {instancesListed: true});
          }

        });
    }

  }

})();
