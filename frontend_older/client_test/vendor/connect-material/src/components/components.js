import angular from 'angular'
import 'angular-animate';
import '../services/services';
import '../utils/utils';

export var materialComponents = angular.module('material.components', ['ngAnimate', 'material.services', 'material.utils']);
