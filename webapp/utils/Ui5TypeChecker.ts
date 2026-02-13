import Metadata from "sap/ui/base/Metadata"
import BaseObject from "sap/ui/base/Object"

/**
 * ## Problem
 * UI5 classes extend `sap.ui.base.Object`, but many subclasses have **non‑public constructors**.
 * This prevents us from using `InstanceType<T>` directly for type narrowing.
 *
 * ## Attempted Solution (not possible)
 * Ideally, we would write:
 *
 * ```ts
 * function assertUi5Instance<T extends typeof BaseObject>(
 *   ui5Instance: CheckableType,
 *   ui5Class: T
 * ): asserts ui5Instance is InstanceType<T> {
 *   // check the type
 * }
 *
 * // Example: ODataListBinding (V4)
 * const listBinding = table.getBinding("items");
 * assertUi5Instance(listBinding, ODataListBinding); // private constructor doesn't work
 * ```
 *
 * This fails because `InstanceType<T>` requires a public constructor.
 *
 * ## Workaround
 * Instead, we define `AllowedClass<T>` with:
 * - `prototype: T` — a type hack to represent the instance type without requiring a public constructor.
 * - `getMetadata(): Metadata` — ensures we can query the class name at runtime.
 *
 * Not all subclasses of `BaseObject` expose `getMetadata` as a static method,
 * but this approach works for the majority of common UI5 classes.
 * 
 * ```TS
 * const listBinding = table.getBinding("items");
 * assertUi5Instance(listBinding, ODataListBinding) // works now
 *
 * ## Example Usage
 * ```ts
 * const table = this.byId("Table");
 * assertUi5Instance(table, Table); // table is now typed as Table
 *
 * const model = this.getOwnerComponent()?.getModel();
 * assertUi5Instance(model, ODataModel); // model is now typed as ODataModel V4
 * ```
 */
type AllowedClass<T extends BaseObject> = {
    prototype: T,
    getMetadata(): Metadata
}

/**
 * Types that can be checked with `isUi5Instance` / `assertUi5Instance`.
 *
 * Conditions:
 * - Must be a subclass of `sap.ui.base.Object`.
 * - Must expose a static `getMetadata()` method so the class name is accessible.
 *
 * Example:
 * ```ts
 * console.log(Button.getMetadata().getName()); // "sap.m.Button"
 * ```
 */
type CheckableType = BaseObject | undefined | null

/**
 * Type guard to check whether a given object is an instance of a specific UI5 class.
 *
 * @param ui5Instance - The object to check (may be null/undefined).
 * @param ui5Class - The UI5 class definition with metadata.
 * @returns true if the instance matches the class, false otherwise.
 *
 * Example:
 * ```ts
 * if (isUi5Instance(control, Button)) {
 *   control.setText("Click me"); // TS knows control is a Button instance due to predicate
 * }
 * ```
 */
export function isUi5Instance<T extends BaseObject>(
    ui5Instance: CheckableType,
    ui5Class: AllowedClass<T>
): ui5Instance is T {
    return !!ui5Instance && ui5Instance.isA(ui5Class.getMetadata().getName())
}

/**
 * Assertion function that enforces a given object is an instance of a specific UI5 class.
 * Throws an error if the check fails.
 *
 * @param ui5Instance - The object to assert.
 * @param ui5Class - The UI5 class definition with metadata.
 *
 * Example:
 * ```ts
 * const table = this.byId("Table");
 * assertUi5Instance(table, Table); // table is now typed as Table
 * ```
 */
export function assertUi5Instance<T extends BaseObject>(
    ui5Instance: CheckableType,
    ui5Class: AllowedClass<T>
): asserts ui5Instance is T {
    const isOk = isUi5Instance(ui5Instance, ui5Class);
    const expectedClass = ui5Class.getMetadata().getName();
    const actualClass = ui5Instance?.getMetadata().getName() ?? "undefined/null"

    if (!isOk) {
        throw new Error(`Expected type - "${expectedClass}" received - "${actualClass}" instead`);
    }
}
