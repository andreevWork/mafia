/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Roles_1 = __webpack_require__(1);
	describe('Roles', function () {
	    it('isMafia', function () {
	        expect(Roles_1.default.isMafia(Roles_1.default.MAFIA)).toBeTruthy();
	        expect(Roles_1.default.isMafia(Roles_1.default.DOCTOR)).toBeFalsy();
	    });
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var Roles;
	(function (Roles) {
	    Roles[Roles["INHABITANT"] = 0] = "INHABITANT";
	    Roles[Roles["MAFIA"] = 1] = "MAFIA";
	    Roles[Roles["DOCTOR"] = 2] = "DOCTOR";
	    Roles[Roles["COMMISSAR"] = 3] = "COMMISSAR";
	    Roles[Roles["WHORE"] = 4] = "WHORE";
	})(Roles || (Roles = {}));
	var Roles;
	(function (Roles) {
	    function isMafia(role) {
	        return role === Roles.MAFIA;
	    }
	    Roles.isMafia = isMafia;
	    function isDoctor(role) {
	        return role === Roles.DOCTOR;
	    }
	    Roles.isDoctor = isDoctor;
	    function isWhore(role) {
	        return role === Roles.WHORE;
	    }
	    Roles.isWhore = isWhore;
	    function isInhabitant(role) {
	        return role === Roles.INHABITANT;
	    }
	    Roles.isInhabitant = isInhabitant;
	    function isCommissar(role) {
	        return role === Roles.COMMISSAR;
	    }
	    Roles.isCommissar = isCommissar;
	})(Roles || (Roles = {}));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Roles;


/***/ }
/******/ ]);