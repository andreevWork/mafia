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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var RoomStatus_1 = __webpack_require__(11);
	describe('RoomStatus', function () {
	    it('isWaitingPlayers', function () {
	        expect(RoomStatus_1["default"].isWaitingPlayers(RoomStatus_1["default"].WAITING_PLAYERS)).toBeTruthy();
	        expect(RoomStatus_1["default"].isWaitingPlayers(RoomStatus_1["default"].PLAYING)).toBeFalsy();
	    });
	});

/***/ },

/***/ 11:
/***/ function(module, exports) {

	"use strict";

	var RoomStatus;
	(function (RoomStatus) {
	    RoomStatus[RoomStatus["WAITING_PLAYERS"] = 0] = "WAITING_PLAYERS";
	    RoomStatus[RoomStatus["PLAYING"] = 1] = "PLAYING";
	})(RoomStatus || (RoomStatus = {}));
	var RoomStatus;
	(function (RoomStatus) {
	    function isWaitingPlayers(room_state) {
	        return room_state === RoomStatus.WAITING_PLAYERS;
	    }
	    RoomStatus.isWaitingPlayers = isWaitingPlayers;
	})(RoomStatus || (RoomStatus = {}));
	exports.__esModule = true;
	exports["default"] = RoomStatus;

/***/ }

/******/ });