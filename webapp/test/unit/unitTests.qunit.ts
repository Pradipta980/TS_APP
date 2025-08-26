/* @sapUiRequire */
QUnit.config.autostart = false;

// import all your QUnit tests here
void Promise.all([
	import("sap/ui/core/Core"), // Required to wait until Core has booted to start the QUnit tests
import("tsapp/test/unit/controller/CategoriesPage.controller")
]).then(([{default: Core}]) => Core.ready()).then(() => {
	QUnit.start();
});