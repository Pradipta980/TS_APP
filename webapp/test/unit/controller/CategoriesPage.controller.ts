/*global QUnit*/
import Controller from "tsapp/controller/Categories.controller";

QUnit.module("Categories Controller");

QUnit.test("I should test the Categories controller", function (assert: Assert) {
	const oAppController = new Controller("Categories");
	oAppController.onInit();
	assert.ok(oAppController);
});