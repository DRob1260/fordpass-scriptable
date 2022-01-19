// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: car;
// This script was downloaded using FordWidgetTool.
// hash: 898792870;

/**************
 * Permission to use, copy, modify, and/or distribute this software for any purpose without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
 *
 *
 * This is a widget for the iOS/iPad/MacOS app named Scriptable https://scriptable.app/ created by tonesto7 (https://github.com/tonesto7)
 *
 * Fuel pump Icon made by Kiranshastry from www.flaticon.com
 *
 * Based off the work of others:
 *  - The original Fordpass Scriptable script by Damian Schablowsky  <dschablowsky.dev@gmail.com> (https://github.com/dschablowsky/FordPassWidget)
 *  - Api Logic based on ffpass from https://github.com/d4v3y0rk - thanks a lot for the work!
 *  - WidgetMarkup.js by @rafaelgandi (https://github.com/rafaelgandi/WidgetMarkup-Scriptable)
 *
 *
 * IMPORTANT NOTE: This widget will only work with vehicles that show up in the FordPassFordPass app!
 */

/**************
Changelog:
    v2.0.0:
        - Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%;
        - Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section)
        - Modified the margins of the widget to be more consistent and be better on small screens and small widgets.
        - Renamed debug menu to advanced info menu.
        - Added new option to advanced info menu to allow emailing your anonymous vehicle data to me 
            (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything)
        
// Todo: This Release (v2.0.0)) 
    - use OTA info to show when an update is available or pending.
    - move OTA info to table view.
    - Show notifications for specific events or errors (like low battery, low oil, ota updates)
    - add actionable notifications for items like doors still unlocked after a certain time or low battery offer remote star... etc
    - Create widgets with less details and larger image.

// Todo: Next Release (Post 2.0.x)
- setup up daily schedule that makes sure the doors are locked at certain time of day (maybe).
    - add support for other languages
    - add charge scheduling to dashboard menu
    - add support for right hand drive (driver side windows, and doors etc.)
    - add option to define dark or light mode (this might not work because the UI is driven based on OS theme)
    - add voice interface using siri shortcut
        * generate list of actionable commands based on capability
        * generate list of request command info available (are the doors locked, is the vehicle on, current fuel level, etc)
        * handle context and tense of command
    
**************/

const changelog = {
    '2.0.0': {
        added: [
            'All new menu that functions like an app interface',
            'Added new option to advanced info menu to allow emailing your anonymous vehicle data to me (Because this is email I will see your address, but you can choose to setup a private email using icloud hide email feature)(Either way i will never share or use your email for anything).',
            'Script changes are show in a window when new versions are released.',
        ],
        fixed: ['Modified the margins of the widget to be more consistent and be better on small screens and small widgets.', 'Vehicle images should now load correctly.'],
        removed: ['Removed vehicle odometer from the widget UI to save space (moved it to the dashboard menu section).'],
        updated: ['Modified the fuel/battery bar to show the icon and percentage in the bar. The bar is now green when vehicle is EV, and red when below 10% and yellow below 20%.', 'Renamed debug menu to advanced info menu.'],
    },
};

const SCRIPT_VERSION = '2.0.0';
const SCRIPT_TS = '2022/01/19, 6:00 pm';
const SCRIPT_ID = 0; // Edit this is you want to use more than one instance of the widget. Any value will work as long as it is a number and  unique.

//******************************************************************
//* Customize Widget Options
//******************************************************************
const widgetConfig = {
    debugMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    debugAuthMode: false, // ENABLES MORE LOGGING... ONLY Use it if you have problems with the widget!
    logVehicleData: false, // Logs the vehicle data to the console (Used to help end users easily debug their vehicle data and share with develop)
    screenShotMode: true, // Places a dummy address in the widget for anonymous screenshots.
    refreshInterval: 5, // allow data to refresh every (xx) minutes
    alwaysFetch: true, // always fetch data from FordPass, even if it is not needed
    tirePressureThresholds: {
        // Tire Pressure Thresholds in PSI
        low: 27,
        critical: 20,
    },
    /**
     * Only use the options below if you are experiencing problems. Set them back to false once everything is working.
     * Otherwise the token and the pictures are newly fetched everytime the script is executed.
     */
    clearKeychainOnNextRun: false, // false or true
    clearFileManagerOnNextRun: false, // false or true
    showTestUIStuff: false,
};

const FPClass = importModule('/FPWModules/FPW_Class.js');
const fpClass = new FPClass(SCRIPT_ID, SCRIPT_VERSION, SCRIPT_TS, widgetConfig);

const LATEST_VERSION = await fpClass.utils.getLatestScriptVersion();
const updateAvailable = fpClass.utils.isNewerVersion(SCRIPT_VERSION, LATEST_VERSION);
console.log(`Script Version: ${SCRIPT_VERSION} | Update Available: ${updateAvailable} | Latest Version: ${LATEST_VERSION}`);

//************************************************************************* */
//*                  Device Detail Functions
//************************************************************************* */
const screenSize = Device.screenResolution();
const isSmallDisplay = screenSize.width < 1200 === true;
const darkMode = Device.isUsingDarkAppearance();
const runningWidgetSize = config.widgetFamily;
const isPhone = Device.isPhone();
const isPad = Device.isPad();
// console.log('---------------DEVICE INFO ----------------');
// console.log(`OSDarkMode: ${darkMode}`);
// console.log(`IsSmallDisplay: ${isSmallDisplay}`);
// console.log(`ScreenSize: Width: ${screenSize.width} | Height: ${screenSize.height}`);
// console.log(`Device Info | Model: ${Device.model()} | OSVersion: ${Device.systemVersion()}`);

//******************************************************************************
//* Main Widget Code - ONLY make changes if you know what you are doing!!
//******************************************************************************

// console.log(`ScriptURL: ${URLScheme.forRunningScript()}`);
// console.log(`Script QueryParams: ${args.queryParameter}`);
// console.log(`Script WidgetParams: ${args.widgetParameter}`);

async function prepWidget() {
    if (widgetConfig.clearKeychainOnNextRun) {
        await fpClass.kc.clearKeychain();
    }
    if (widgetConfig.clearFileManagerOnNextRun) {
        await fpClass.files.clearFileManager();
    }
    await fpClass.kc.vinFix();
    let reqOk = await fpClass.kc.requiredPrefsOk(fpClass.kc.prefKeys().core);
    // console.log(`reqOk: ${reqOk}`);
    if (!reqOk) {
        let prompt = await requiredPrefsMenu();
        console.log(`Prefs Menu Prompt Result: ${prompt}`);
        if (!prompt) {
            console.log('Login, VIN, or Prefs not set... User cancelled!!!');
            return null;
        }
    }
    await fpClass.fordRequests.queryFordPassPrefs(false);

    let vehicleData = await fpClass.fordRequests.fetchVehicleData();
    // console.log(`vehicleData: ${JSON.stringify(vehicleData)}`);
    return vehicleData;
}

async function generateWidget(size, data) {
    const wStyle = await fpClass.kc.getWidgetStyle();
    console.log(`wStyle: ${wStyle}`);
    let w = null;
    switch (size) {
        case 'small':
            w = wStyle === 'simple' ? await createSmallSimpleWidget(data) : await createSmallWidget(data);
            break;
        case 'large':
            w = await createLargeWidget(data);
            break;
        case 'extraLarge':
            w = await createExtraLargeWidget(data);
            break;
        default:
            w = wStyle === 'simple' ? await createMediumSimpleWidget(data) : await createMediumWidget(data);
            break;
    }
    if (w === null) {
        return;
    }
    Script.setWidget(w);
    w.setPadding(0, 5, 0, 1);

    w.refreshAfterDate = new Date(Date.now() + 1000 * 300); // Update the widget every 5 minutes from last run (this is not always accurate and there can be a swing of 1-5 minutes)
    return w;
}

let fordData = await prepWidget();
if (fordData === null) return;

// Table Map Object - Used to map the data to the table
let tableMap = {};
let timerMap = {};

if (config.runsInWidget) {
    await generateWidget(runningWidgetSize, fordData);
} else if (config.runsInApp || config.runsFromHomeScreen) {
    // Show alert with current data (if running script in app)
    if (args.shortcutParameter) {
        // await fpClass.alertNotify.showAlert('shortcutParameter: ', JSON.stringify(args.shortcutParameter));
        // Create a parser function...
        await Speech.speak(await parseIncomingSiriCommand(args.shortcutParameter));
    } else {
        await (await generateWidget('medium', fordData)).presentMedium();
        generateMainInfoTable();
    }
} else if (config.runsWithSiri || config.runsInActionExtension) {
    // console.log('runsWithSiri: ' + config.runsWithSiri);
    // console.log('runsInActionExtension: ' + config.runsInActionExtension);
} else {
    await generateWidget(runningWidgetSize, fordData);
}
Script.complete();

//*****************************************************************************************************************************
//*                                              START WIDGET UI ELEMENT FUNCTIONS
//*****************************************************************************************************************************

async function createSmallWidget(vData) {
    let vehicleData = vData;
    const wSize = 'small';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = fpClass.statics.getBgGradient();

    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Vehicle Logo
        await createVehicleImageElement(mainCol1, vehicleData, fpClass.statics.sizeMap[wSize].logoSize.w, fpClass.statics.sizeMap[wSize].logoSize.h);

        // Creates the Vehicle Logo, Odometer, Fuel/Battery and Distance Info Elements
        await createFuelRangeElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, true, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol2, vehicleData, true, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************
        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createSmallWidget Error ${e}`);
    }
    return widget;
}

async function createRangeElements(srcField, vehicleData, wSize = 'medium') {
    try {
        const isEV = vehicleData.evVehicle === true;
        let lvlValue = !isEV ? (vehicleData.fuelLevel ? vehicleData.fuelLevel : 0) : vehicleData.evBatteryLevel ? vehicleData.evBatteryLevel : 0;
        let dteValue = !isEV ? (vehicleData.distanceToEmpty ? vehicleData.distanceToEmpty : null) : vehicleData.evDistanceToEmpty ? vehicleData.evDistanceToEmpty : null;
        let dtePostfix = isEV ? 'Range' : 'to E';
        let distanceMultiplier = (await fpClass.kc.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
        let distanceUnit = (await fpClass.kc.useMetricUnits()) ? 'km' : 'mi'; // unit of length

        // Fuel/Battery Section
        let elemCol = await createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

        // Fuel/Battery Level BAR
        let barRow = await createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createImage(barRow, await createProgressBar(lvlValue ? lvlValue : 50, vehicleData, wSize), { '*centerAlignImage': null, imageSize: new Size(fpClass.statics.sizeMap[wSize].barGauge.w, fpClass.statics.sizeMap[wSize].barGauge.h + 3) });

        // Distance/Range to Empty
        let dteRow = await createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
        let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : fpClass.statics.textMap().errorMessages.noData;
        await createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 });
        srcField.addSpacer(3);
    } catch (e) {
        console.error(`createFuelRangeElements error ${e}`);
    }
}

async function createMediumSimpleWidget(vData) {
    let vehicleData = vData;
    const wSize = 'medium';

    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = fpClass.statics.getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);
        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* Column 1
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

        let col1Row = await createRow(mainCol1, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        // Vehicle Logo
        await createVehicleImageElement(col1Row, vehicleData, 145, 105);

        // Creates Low-Voltage Battery Voltage Elements
        // await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        // if (!vehicleData.evVehicle) {
        //     await createOilElement(mainCol1, vehicleData, wSize);
        // } else {
        //     // Creates EV Plug Elements
        //     await createEvChargeElement(mainCol1, vehicleData, wSize);
        // }

        contentStack.addSpacer();

        //************************
        //* Column 2
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createFuelRangeElements(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, true, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol2, vehicleData, true, wSize);

        // Create Tire Pressure Elements
        // await createTireElement(mainCol2, vehicleData, wSize);

        mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //************************
        //* Column 3
        //************************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol3, vehicleData, wSize);

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createMediumWidget Error ${e}`);
    }
    return widget;
}

async function createMediumWidget(vData) {
    let vehicleData = vData;
    const wSize = 'medium';

    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = fpClass.statics.getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);
        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Vehicle Logo
        await createVehicleImageElement(mainCol1, vehicleData, fpClass.statics.sizeMap[wSize].logoSize.w, fpClass.statics.sizeMap[wSize].logoSize.h);

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createFuelRangeElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, false, wSize);

        // Create Tire Pressure Elements
        await createTireElement(mainCol2, vehicleData, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //****************
        //* Third column
        //****************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol3, vehicleData, false, wSize);

        // Creates the Vehicle Location Element
        await createPositionElement(mainCol3, vehicleData, wSize);

        // mainCol3.addSpacer();

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createMediumWidget Error ${e}`);
    }
    return widget;
}

async function createLargeWidget(vData) {
    let vehicleData = vData;
    const wSize = 'large';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = fpClass.statics.getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Vehicle Logo
        await createVehicleImageElement(mainCol1, vehicleData, fpClass.statics.sizeMap[wSize].logoSize.w, fpClass.statics.sizeMap[wSize].logoSize.h);

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createFuelRangeElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, false, wSize);

        // Create Tire Pressure Elements
        await createTireElement(mainCol2, vehicleData, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //****************
        //* Third column
        //****************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol3, vehicleData, false, wSize);

        // Creates the Vehicle Location Element
        await createPositionElement(mainCol3, vehicleData, wSize);

        // mainCol3.addSpacer();

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createLargeWidget Error ${e}`);
    }
    return widget;
}

async function createExtraLargeWidget(vData) {
    let vehicleData = vData;
    const wSize = 'extraLarge';
    // Defines the Widget Object
    const widget = new ListWidget();
    widget.backgroundGradient = fpClass.statics.getBgGradient();
    try {
        let mainStack = widget.addStack();
        mainStack.layoutVertically();
        mainStack.setPadding(0, 0, 0, 0);

        let contentStack = mainStack.addStack();
        contentStack.layoutHorizontally();

        //*****************
        //* First column
        //*****************
        let mainCol1 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Vehicle Logo
        await createVehicleImageElement(mainCol1, vehicleData, fpClass.statics.sizeMap[wSize].logoSize.w, fpClass.statics.sizeMap[wSize].logoSize.h);

        // Creates the Odometer, Fuel/Battery and Distance Info Elements
        await createFuelRangeElements(mainCol1, vehicleData, wSize);

        // Creates Low-Voltage Battery Voltage Elements
        await createBatteryElement(mainCol1, vehicleData, wSize);

        // Creates Oil Life Elements
        if (!vehicleData.evVehicle) {
            await createOilElement(mainCol1, vehicleData, wSize);
        } else {
            // Creates EV Plug Elements
            await createEvChargeElement(mainCol1, vehicleData, wSize);
        }

        contentStack.addSpacer();

        //************************
        //* Second column
        //************************
        let mainCol2 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Lock Status Elements
        await createLockStatusElement(mainCol2, vehicleData, wSize);

        // Creates the Door Status Elements
        await createDoorElement(mainCol2, vehicleData, false, wSize);

        // Create Tire Pressure Elements
        await createTireElement(mainCol2, vehicleData, wSize);

        // mainCol2.addSpacer(0);

        contentStack.addSpacer();

        //****************
        //* Third column
        //****************
        let mainCol3 = await createColumn(contentStack, { '*setPadding': [0, 0, 0, 0] });

        // Creates the Ignition Status Elements
        await createIgnitionStatusElement(mainCol3, vehicleData, wSize);

        // Creates the Door Status Elements
        await createWindowElement(mainCol3, vehicleData, false, wSize);

        // Creates the Vehicle Location Element
        await createPositionElement(mainCol3, vehicleData, wSize);

        // mainCol3.addSpacer();

        contentStack.addSpacer();

        //**********************
        //* Refresh and error
        //*********************

        let statusRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0] });
        await createStatusElement(statusRow, vehicleData, wSize);

        // This is the row displaying the time elapsed since last vehicle checkin.
        let timestampRow = await createRow(mainStack, { '*layoutHorizontally': null, '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createTimeStampElement(timestampRow, vehicleData, wSize);
    } catch (e) {
        console.error(`createExtraLargeWidget Error ${e}`);
    }
    return widget;
}

async function createColumn(srcField, styles = {}) {
    let col = srcField.addStack();
    col.layoutVertically();
    if (styles && Object.keys(styles).length > 0) {
        fpClass.utils._mapMethodsAndCall(col, styles);
    }

    return col;
}

async function createRow(srcField, styles = {}) {
    let row = srcField.addStack();
    row.layoutHorizontally();
    if (styles && Object.keys(styles).length > 0) {
        fpClass.utils._mapMethodsAndCall(row, styles);
    }

    return row;
}

async function createText(srcField, text, styles = {}) {
    let txt = srcField.addText(text);
    if (styles && Object.keys(styles).length > 0) {
        fpClass.utils._mapMethodsAndCall(txt, styles);
    }
    return txt;
}

async function createImage(srcField, image, styles = {}) {
    let _img = srcField.addImage(image);
    if (styles && Object.keys(styles).length > 0) {
        fpClass.utils._mapMethodsAndCall(_img, styles);
    }
    return _img;
}

async function createTitle(headerField, titleText, wSize = 'medium', hideTitleForSmall = false) {
    let titleParams = titleText.split('||');
    let icon = fpClass.statics.iconMap[titleParams[0]];
    let titleStack = await headerField.addStack({ '*centerAlignContent': null });
    if (icon !== undefined) {
        titleStack.layoutHorizontally();
        let imgFile = await fpClass.files.getImage(icon.toString());
        await createImage(titleStack, imgFile, { imageSize: new Size(fpClass.statics.sizeMap[wSize].iconSize.w, fpClass.statics.sizeMap[wSize].iconSize.h) });
    }
    // console.log(`titleParams(${titleText}): ${titleParams}`);
    if (titleText && titleText.length && !hideTitleForSmall) {
        titleStack.addSpacer(2);
        let title = titleParams.length > 1 ? fpClass.statics.textMap(titleParams[1]).elemHeaders[titleParams[0]] : fpClass.statics.textMap().elemHeaders[titleParams[0]];
        await createText(titleStack, title + ':', { font: Font.boldSystemFont(fpClass.statics.sizeMap[wSize].titleFontSize), textColor: new Color(fpClass.statics.colorMap.textColor1), lineLimit: 1 });
    }
}

async function createProgressBar(percent, vData, wSize = 'medium') {
    // percent = 12;
    const isEV = vData.evVehicle === true;
    let fillLevel = percent > 100 ? 100 : percent;
    const barWidth = fpClass.statics.sizeMap[wSize].barGauge.w;
    const context = new DrawContext();
    context.size = new Size(barWidth, fpClass.statics.sizeMap[wSize].barGauge.h + 3);
    context.opaque = false;
    context.respectScreenScale = true;

    // Bar Background Gradient
    const lvlBgPath = new Path();
    lvlBgPath.addRoundedRect(new Rect(0, 0, barWidth, fpClass.statics.sizeMap[wSize].barGauge.h), 3, 2);
    context.addPath(lvlBgPath);
    context.setFillColor(Color.lightGray());
    context.fillPath();

    // Bar Level Background
    const lvlBarPath = new Path();
    lvlBarPath.addRoundedRect(new Rect(0, 0, (barWidth * fillLevel) / 100, fpClass.statics.sizeMap[wSize].barGauge.h), 3, 2);
    context.addPath(lvlBarPath);
    let barColor = isEV ? '#94ef4a' : '#619ded';
    if (percent >= 0 && percent <= 10) {
        barColor = '#FF6700';
    } else if (percent > 10 && percent <= 20) {
        barColor = '#FFCD00';
    }
    context.setFillColor(new Color(barColor));
    context.fillPath();

    let xPos = barWidth / 2 - 20;
    context.setFont(Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].barGauge.fs));
    context.setTextColor(Color.black());

    // if (fillLevel > 75) {
    //     context.setTextColor(Color.white());
    // }
    const icon = isEV ? String.fromCodePoint('0x1F50B') : '\u26FD';
    const lvlStr = fillLevel < 0 || fillLevel > 100 ? '--' : `${fillLevel}%`;
    context.drawTextInRect(`${icon} ${lvlStr}`, new Rect(xPos, fpClass.statics.sizeMap[wSize].barGauge.h / fpClass.statics.sizeMap[wSize].barGauge.fs, fpClass.statics.sizeMap[wSize].barGauge.w, fpClass.statics.sizeMap[wSize].barGauge.h));
    context.setTextAlignedCenter();
    return await context.getImage();
}

async function createVehicleImageElement(srcField, vData, width, height) {
    let logoRow = await createRow(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
    if (vData.info !== undefined && vData.info.vehicle !== undefined) {
        await createImage(logoRow, await fpClass.files.getVehicleImage(vData.info.vehicle.modelYear), { imageSize: new Size(width, height), '*centerAlignImage': null });
        srcField.addSpacer(3);
    }
    // return srcField;
}

async function createFuelRangeElements(srcField, vehicleData, wSize = 'medium') {
    try {
        const isEV = vehicleData.evVehicle === true;
        let lvlValue = !isEV ? (vehicleData.fuelLevel ? vehicleData.fuelLevel : 0) : vehicleData.evBatteryLevel ? vehicleData.evBatteryLevel : 0;
        let dteValue = !isEV ? (vehicleData.distanceToEmpty ? vehicleData.distanceToEmpty : null) : vehicleData.evDistanceToEmpty ? vehicleData.evDistanceToEmpty : null;
        let dtePostfix = isEV ? 'Range' : 'to E';
        let distanceMultiplier = (await fpClass.kc.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
        let distanceUnit = (await fpClass.kc.useMetricUnits()) ? 'km' : 'mi'; // unit of length
        // console.log('isEV: ' + isEV);
        // console.log(`fuelLevel: ${vehicleData.fuelLevel}`);
        // console.log(`distanceToEmpty: ${vehicleData.distanceToEmpty}`);
        // console.log(`evBatteryLevel: ${vehicleData.evBatteryLevel}`);
        // console.log('evDistanceToEmpty: ' + vehicleData.evDistanceToEmpty);
        // console.log(`lvlValue: ${lvlValue}`);
        // console.log(`dteValue: ${dteValue}`);

        // Fuel/Battery Section
        let elemCol = await createColumn(srcField, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });

        // // Vehicle Logo
        // await createVehicleImageElement(elemCol, vehicleData, fpClass.statics.sizeMap[wSize].logoSize.w, fpClass.statics.sizeMap[wSize].logoSize.h);

        // Fuel/Battery Level BAR
        let barRow = await createRow(elemCol, { '*setPadding': [0, 0, 0, 0], '*centerAlignContent': null });
        await createImage(barRow, await createProgressBar(lvlValue ? lvlValue : 50, vehicleData, wSize), { '*centerAlignImage': null, imageSize: new Size(fpClass.statics.sizeMap[wSize].barGauge.w, fpClass.statics.sizeMap[wSize].barGauge.h + 3) });

        // Distance to Empty
        let dteRow = await createRow(elemCol, { '*centerAlignContent': null, '*topAlignContent': null });
        let dteInfo = dteValue ? `    ${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : fpClass.statics.textMap().errorMessages.noData;
        await createText(dteRow, dteInfo, { '*centerAlignText': null, font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 });
        srcField.addSpacer(3);
    } catch (e) {
        console.error(`createFuelRangeElements error ${e}`);
    }
}

async function createBatteryElement(srcField, vehicleData, wSize = 'medium') {
    try {
        let elem = await createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
        await createTitle(elem, 'batteryStatus', wSize, isSmallDisplay || wSize === 'small');
        elem.addSpacer(2);
        let value = vehicleData.batteryLevel ? `${vehicleData.batteryLevel}V` : 'N/A';
        // console.log(`batteryLevel: ${value}`);
        let lowBattery = vehicleData.batteryStatus === 'STATUS_LOW' ? true : false;
        await createText(elem, value, { font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: lowBattery ? Color.red() : new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 });
        srcField.addSpacer(3);
    } catch (e) {
        console.error(`createBatteryElement error ${e}`);
    }
}

async function createOilElement(srcField, vData, wSize = 'medium') {
    const styles = {
        normal: { font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 },
        warning: { font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color('#FF6700'), lineLimit: 1 },
        critical: { font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color('#DE1738'), lineLimit: 1 },
    };
    let elem = await createRow(srcField, { '*layoutHorizontally': null, '*bottomAlignContent': null });
    await createTitle(elem, 'oil', wSize, isSmallDisplay || wSize === 'small');
    elem.addSpacer(2);
    let txtStyle = styles.normal;
    if (vData.oilLife && vData.oilLife >= 0 && vData.oilLife <= 25) {
        txtStyle = styles.warning;
    }
    // console.log(`oilLife: ${vData.oilLife}`);
    let text = vData.oilLife ? `${vData.oilLife}%` : fpClass.statics.textMap().errorMessages.noData;
    await createText(elem, text, txtStyle);
    srcField.addSpacer(3);
}

async function createEvChargeElement(srcField, vehicleData, wSize = 'medium') {
    let elem = await createRow(srcField, { '*layoutHorizontally': null });
    await createTitle(elem, 'evChargeStatus', wSize, isSmallDisplay || wSize === 'small');
    elem.addSpacer(2);
    let value = vehicleData.evChargeStatus ? `${vehicleData.evChargeStatus}` : fpClass.statics.textMap().errorMessages.noData;
    // console.log(`battery charge: ${value}`);
    await createText(elem, value, { font: Font.regularSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 });
    srcField.addSpacer(3);
}

async function createDoorElement(srcField, vData, countOnly = false, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 },
        statOpen: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
        statClosed: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
        offset: 5,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'doors', wSize);

    // Creates the first row of status elements for LF and RF
    let dataRow1Fld = await createRow(srcField);

    if (countOnly) {
        let value = fpClass.statics.textMap().errorMessages.noData;
        // let allDoorsCnt = Object.values(vData.statusDoors).filter((door) => door !== null).length;
        let countOpen;
        if (vData.statusDoors) {
            countOpen = Object.values(vData.statusDoors).filter((door) => door === true).length;
            value = countOpen == 0 ? fpClass.statics.textMap().UIValues.closed : `${countOpen} ${fpClass.statics.textMap().UIValues.open}`;
        }
        await createText(dataRow1Fld, value, countOpen > 0 ? styles.statOpen : styles.statClosed);
    } else {
        let col1 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col1row1 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
        await createText(col1row1, 'LF (', styles.normTxt);
        await createText(col1row1, vData.statusDoors.driverFront ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusDoors.driverFront ? styles.statOpen : styles.statClosed);
        await createText(col1row1, ')', styles.normTxt);

        let col2 = await createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await createText(col2row1, '|', styles.normTxt);

        let col3 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await createText(col3row1, 'RF (', styles.normTxt);
        await createText(col3row1, vData.statusDoors.passFront ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusDoors.passFront ? styles.statOpen : styles.statClosed);
        await createText(col3row1, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        if (vData.statusDoors.leftRear !== null && vData.statusDoors.rightRear !== null) {
            let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await createText(col1row2, `LR (`, styles.normTxt);
            await createText(col1row2, vData.statusDoors.leftRear ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusDoors.leftRear ? styles.statOpen : styles.statClosed);
            await createText(col1row2, ')', styles.normTxt);

            let col2row2 = await createRow(col2, {});
            await createText(col2row2, '|', styles.normTxt);

            let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await createText(col3row2, `RR (`, styles.normTxt);
            await createText(col3row2, vData.statusDoors.rightRear ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusDoors.rightRear ? styles.statOpen : styles.statClosed);
            await createText(col3row2, ')', styles.normTxt);
        }

        async function getHoodStatusElem(stkElem, data, center = false) {
            await createText(stkElem, `${center ? '       ' : ''}HD (`, styles.normTxt);
            await createText(stkElem, data.statusDoors.hood ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusDoors.hood ? styles.statOpen : styles.statClosed);
            await createText(stkElem, ')', styles.normTxt);
        }
        async function getTailgateStatusElem(stkElem, data, center = false) {
            await createText(stkElem, `${center ? '       ' : ''}TG (`, styles.normTxt);
            await createText(stkElem, data.statusDoors.tailgate ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusDoors.tailgate ? styles.statOpen : styles.statClosed);
            await createText(stkElem, ')', styles.normTxt);
        }

        // Creates the third row of status elements for the tailgate and/or hood (if equipped)
        let hasHood = vData.statusDoors.hood !== null;
        let hasTailgate = vData.statusDoors.tailgate !== null;
        if (hasHood || hasTailgate) {
            if (hasHood && hasTailgate) {
                let col1row3 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
                await getHoodStatusElem(col1row3, vData);

                let col2row3 = await createRow(col2, {});
                await createText(col2row3, '|', styles.normTxt);

                let col3row3 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
                await getTailgateStatusElem(col3row3, vData);
            } else {
                if (hasHood && !hasTailgate) {
                    let dataRow3Fld = await createRow(srcField);
                    await getHoodStatusElem(dataRow3Fld, vData, true);
                } else if (hasTailgate && !hasHood) {
                    let dataRow3Fld = await createRow(srcField, {});
                    await getTailgateStatusElem(dataRow3Fld, vData, true);
                }
            }
        }
    }
    srcField.addSpacer(offset);
}

function getOpenItems(items) {
    let openItems = [];
    if (items && items.length) {
        Object.entries(doors)
            .filter(([_, v]) => v)
            .map(([k, _]) => k)
            .forEach((k) => {
                switch (k) {
                    case 'driverFront':
                        openItems.push('DF');
                        break;
                    case 'passFront':
                        openItems.push('PF');
                        break;
                    case 'leftRear':
                        openItems.push('LR');
                        break;
                    case 'rightRear':
                        openItems.push('RR');
                        break;
                    case 'hood':
                        openItems.push('HD');
                        break;
                    case 'tailgate':
                        openItems.push('TG');
                        break;
                    case 'innerTailgate':
                        openItems.push('ITG');
                        break;
                }
            });
    }
    return openItems;
}

async function createWindowElement(srcField, vData, countOnly = false, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color(fpClass.statics.colorMap.textColor2) },
        statOpen: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733') },
        statClosed: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0') },
        offset: 10,
    };

    let offset = styles.offset;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'windows', wSize);

    // Creates the first row of status elements for LF and RF
    let dataRow1Fld = await createRow(srcField);
    if (countOnly) {
        let value = fpClass.statics.textMap().errorMessages.noData;
        let countOpen;
        if (vData.statusWindows) {
            countOpen = Object.values(vData.statusWindows).filter((window) => window === true).length;
            value = countOpen == 0 ? fpClass.statics.textMap().UIValues.closed : `${countOpenWindows} ${fpClass.statics.textMap().UIValues.open}`;
        }
        await createText(dataRow1Fld, value, countOpen > 0 ? styles.statOpen : styles.statClosed);
    } else {
        let col1 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col1row1 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
        await createText(col1row1, 'LF (', styles.normTxt);
        await createText(col1row1, vData.statusWindows.driverFront ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusWindows['driverFront'] ? styles.statOpen : styles.statClosed);
        await createText(col1row1, ')', styles.normTxt);

        let col2 = await createColumn(dataRow1Fld, { '*setPadding': [0, 3, 0, 3] });
        let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
        await createText(col2row1, '|', styles.normTxt);

        let col3 = await createColumn(dataRow1Fld, { '*setPadding': [0, 0, 0, 0] });
        let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
        await createText(col3row1, 'RF (', styles.normTxt);
        await createText(col3row1, vData.statusWindows['passFront'] ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusWindows['passFront'] ? styles.statOpen : styles.statClosed);
        await createText(col3row1, ')', styles.normTxt);

        // Creates the second row of status elements for LR and RR
        if (vData.statusWindows.driverRear !== null && vData.statusWindows.passRear !== null) {
            let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
            await createText(col1row2, `LR (`, styles.normTxt);
            await createText(col1row2, vData.statusWindows.driverRear ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusWindows.driverRear ? styles.statOpen : styles.statClosed);
            await createText(col1row2, ')', styles.normTxt);

            let col2row2 = await createRow(col2, {});
            await createText(col2row2, '|', styles.normTxt);

            let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
            await createText(col3row2, `RR (`, styles.normTxt);
            await createText(col3row2, vData.statusWindows.passRear ? fpClass.statics.textMap().symbols.open : fpClass.statics.textMap().symbols.closed, vData.statusWindows.passRear ? styles.statOpen : styles.statClosed);
            await createText(col3row2, ')', styles.normTxt);
        }

        if (vData.statusDoors['tailgate'] !== undefined || vData.statusDoors['hood'] !== undefined) {
            offset = offset + 10;
        }
    }
    srcField.addSpacer(offset);
}

async function createTireElement(srcField, vData, wSize = 'medium') {
    const styles = {
        normTxt: { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color(fpClass.statics.colorMap.textColor2) },
    };
    let offset = 0;
    let titleFld = await createRow(srcField);
    let pressureUnits = await fpClass.kc.getKeychainValue('fpPressureUnits');
    let unitTxt = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
    await createTitle(titleFld, `tirePressure||${unitTxt}`, wSize);

    let dataFld = await createRow(srcField);
    // Row 1 - Tire Pressure Left Front amd Right Front
    let col1 = await createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
    let col1row1 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    await createText(col1row1, vData.tirePressure.leftFront, fpClass.utils.getTirePressureStyle(vData.tirePressure.leftFront, unitTxt));
    let col2 = await createColumn(dataFld, { '*setPadding': [0, 3, 0, 3] });
    let col2row1 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    await createText(col2row1, '|', styles.normTxt);
    let col3 = await createColumn(dataFld, { '*setPadding': [0, 0, 0, 0] });
    let col3row1 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    await createText(col3row1, vData.tirePressure.rightFront, fpClass.utils.getTirePressureStyle(vData.tirePressure.rightFront, unitTxt));

    // Row 2 - Tire Pressure Left Rear amd Right Rear
    let col1row2 = await createRow(col1, { '*setPadding': [0, 0, 0, 0] });
    await createText(col1row2, vData.tirePressure.leftRear, fpClass.utils.getTirePressureStyle(vData.tirePressure.leftRear, unitTxt));
    let col2row2 = await createRow(col2, { '*setPadding': [0, 0, 0, 0] });
    await createText(col2row2, '|', styles.normTxt);
    let col3row2 = await createRow(col3, { '*setPadding': [0, 0, 0, 0] });
    await createText(col3row2, vData.tirePressure.rightRear, fpClass.utils.getTirePressureStyle(vData.tirePressure.rightRear, unitTxt));

    srcField.addSpacer(offset);
}

async function createPositionElement(srcField, vehicleData, wSize = 'medium') {
    let offset = 0;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'position', wSize);

    let dataFld = await createRow(srcField);
    let url = (await fpClass.kc.getMapProvider()) == 'google' ? `https://www.google.com/maps/search/?api=1&query=${vehicleData.latitude},${vehicleData.longitude}` : `http://maps.apple.com/?q=${encodeURI(vehicleData.info.vehicle.nickName)}&ll=${vehicleData.latitude},${vehicleData.longitude}`;
    let value = vehicleData.position ? (widgetConfig.screenShotMode ? '1234 Someplace Drive, Somewhere' : `${vehicleData.position}`) : fpClass.statics.textMap().errorMessages.noData;
    await createText(dataFld, value, { url: url, font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 2, minimumScaleFactor: 0.7 });
    srcField.addSpacer(offset);
}

async function createLockStatusElement(srcField, vehicleData, wSize = 'medium') {
    const styles = {
        unlocked: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733'), lineLimit: 1 },
        locked: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0'), lineLimit: 1 },
    };
    let offset = 2;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'lockStatus', wSize);
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    let value = vehicleData.lockStatus ? vehicleData.lockStatus.toLowerCase().charAt(0).toUpperCase() + vehicleData.lockStatus.toLowerCase().slice(1) : fpClass.statics.textMap().errorMessages.noData;
    await createText(dataFld, value, vehicleData.lockStatus !== undefined && vehicleData.lockStatus === 'LOCKED' ? styles.locked : styles.unlocked);
    srcField.addSpacer(offset);
}

async function createIgnitionStatusElement(srcField, vehicleData, wSize = 'medium') {
    const styles = {
        on: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#FF5733') },
        off: { font: Font.heavySystemFont(fpClass.statics.sizeMap[wSize].fontSizeMedium), textColor: new Color('#5A65C0') },
    };
    let remStartOn = vehicleData.remoteStartStatus && vehicleData.remoteStartStatus.running ? true : false;
    let status = '';
    if (remStartOn) {
        status = `Remote Start (ON)`;
    } else if (vehicleData.ignitionStatus !== undefined) {
        status = vehicleData.ignitionStatus.charAt(0).toUpperCase() + vehicleData.ignitionStatus.slice(1); //vehicleData.ignitionStatus.toUpperCase();
    } else {
        fpClass.statics.textMap().errorMessages.noData;
    }
    let offset = 2;
    let titleFld = await createRow(srcField);
    await createTitle(titleFld, 'ignitionStatus', wSize);
    titleFld.addSpacer(2);
    let dataFld = await createRow(srcField);
    await createText(dataFld, status, vehicleData.ignitionStatus !== undefined && (vehicleData.ignitionStatus === 'On' || vehicleData.ignitionStatus === 'Run' || remStartOn) ? styles.on : styles.off);
    srcField.addSpacer(offset);
}

async function createTimeStampElement(stk, vehicleData, wSize = 'medium') {
    // stk.setPadding(topOffset, leftOffset, bottomOffset, rightOffset);
    // Creates the Refresh Label to show when the data was last updated from Ford
    let refreshTime = vehicleData.lastRefreshElapsed ? vehicleData.lastRefreshElapsed : fpClass.statics.textMap().UIValues.unknown;
    await createText(stk, 'Updated: ' + refreshTime, { font: Font.mediumSystemFont(8), textColor: Color.lightGray(), lineLimit: 1 });
    return stk;
}

async function hasStatusMsg(vData) {
    return vData.error || (!vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') || vData.deepSleepMode || vData.firmwareUpdating || updateAvailable; //|| (!vData.evVehicle && vData.oilLow)
}

async function createStatusElement(stk, vData, maxMsgs = 2, wSize = 'medium') {
    let cnt = 0;
    // Creates Elements to display any errors in red at the bottom of the widget
    if (vData.error) {
        // stk.addSpacer(5);
        await createText(stk, vData.error ? 'Error: ' + vData.error : '', { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: Color.red() });
    } else {
        if (cnt < maxMsgs && !vData.evVehicle && vData.batteryStatus === 'STATUS_LOW') {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 12V Battery Low`, { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: Color.red(), lineLimit: 1 });
            cnt++;
        }
        // if (cnt < maxMsgs && !vData.evVehicle && vData.oilLow) {
        //     stk.addSpacer(cnt > 0 ? 5 : 0);
        //     await createText(stk, `\u2022 Oil Reporting Low`, { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: Color.red(), lineLimit: 1 });
        //     cnt++;
        // }
        if (cnt < maxMsgs && vData.deepSleepMode) {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 Deep Sleep Mode`, { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: Color.orange(), lineLimit: 1 });
            cnt++;
        }
        if (cnt < maxMsgs && vData.firmwareUpdating) {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 Firmware Updating`, { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: Color.green(), lineLimit: 1 });
            cnt++;
        }
        if (cnt < maxMsgs && updateAvailable) {
            stk.addSpacer(cnt > 0 ? 5 : 0);
            await createText(stk, `\u2022 Script Update: v${LATEST_VERSION}`, { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: Color.orange(), lineLimit: 1 });
            cnt++;
        }
    }
    if (!hasStatusMsg()) {
        await createText(stk, `     `, { font: Font.mediumSystemFont(fpClass.statics.sizeMap[wSize].fontSizeSmall), textColor: new Color(fpClass.statics.colorMap.textColor2), lineLimit: 1 });
    }
    return stk;
}

//***************************************************END WIDGET ELEMENT FUNCTIONS********************************************************
//***************************************************************************************************************************************

async function collectAllData(scrub = false) {
    let data = await fpClass.fordRequests.fetchVehicleData(true);
    data.otaInfo = await fpClass.fordRequests.getVehicleOtaInfo();
    data.userPrefs = {
        country: await fpClass.kc.getKeychainValue('fpCountry'),
        timeZone: await fpClass.kc.getKeychainValue('fpTz'),
        language: await fpClass.kc.getKeychainValue('fpLanguage'),
        unitOfDistance: await fpClass.kc.getKeychainValue('fpDistanceUnits'),
        unitOfPressure: await fpClass.kc.getKeychainValue('fpPressureUnits'),
    };
    // data.userDetails = await fpClass.fordRequests.getAllUserData();
    return scrub ? fpClass.utils.scrubPersonalData(data) : data;
}

async function menuBuilderByType(type) {
    const vehicleData = await fpClass.fordRequests.fetchVehicleData(true);
    // const caps = vehicleData.capabilities && vehicleData.capabilities.length ? vehicleData.capabilities : undefined;
    const typeDesc = fpClass.utils.capitalizeStr(type);
    let title = undefined;
    let message = undefined;
    let items = [];

    switch (type) {
        case 'main':
            title = `Widget Menu`;
            message = `Widget Version: (${SCRIPT_VERSION})`.trim();
            items = [{
                    title: 'View Widget',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) View Widget was pressed`);
                        menuBuilderByType('widgetView');
                        // const w = await generateWidget('medium', fordData);
                        // await w.presentMedium();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Request Refresh',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Refresh was pressed`);
                        if (await fpClass.alertNotify.showYesNoPrompt('Vehicle Data Refresh', "Are you sure you want to send a wake request to the vehicle to refresh it's data?\n\nThis is not an instant thing and sometimes takes minutes to wake the vehicle...")) {
                            await fpClass.fordCommands.sendVehicleCmd('status');
                        }
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Settings',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Settings was pressed`);
                        menuBuilderByType('settings');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Help & Info',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Help & Info was pressed`);
                        await menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Close',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Close was pressed`);
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;

        case 'helpInfo':
            title = `Help & About`;
            items = [{
                    title: 'Recent Changes',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) About was pressed`);
                        await generateRecentChangesTable();
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'View Documentation',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Small Widget was pressed`);
                        await Safari.openInApp(fpClass.statics.textMap().about.documentationUrl);
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Report Issues',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Report Issues was pressed`);
                        await Safari.openInApp(fpClass.statics.textMap().about.issuesUrl);
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Donate',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Donate was pressed`);
                        await Safari.open(fpClass.statics.textMap().about.donationUrl);
                        menuBuilderByType('helpInfo');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Diagnostics',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Diagnostics was pressed`);
                        await menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];

            break;
        case 'widgetView':
            title = 'View Widget';
            items = [{
                    title: 'Small',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Small Widget was pressed`);
                        const w = await generateWidget('small', fordData);
                        await w.presentSmall();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Medium',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Medium Widget was pressed`);
                        const w = await generateWidget('medium', fordData);
                        await w.presentMedium();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Large',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Large Widget was pressed`);
                        const w = await generateWidget('large', fordData);
                        await w.presentLarge();
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Extra-Large',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Extra-Large Widget was pressed`);
                        const w = await generateWidget('extraLarge', fordData);
                        await w.presentExtraLarge();
                    },
                    destructive: false,
                    show: Device.isPad(),
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;

        case 'diagnostics':
            title = 'Diagnostics Menu';
            items = [{
                    title: 'View OTA API Info',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) View OTA Info was pressed`);
                        let data = await fpClass.fordRequests.getVehicleOtaInfo();
                        await fpClass.tables.showDataWebView('OTA Info Page', 'OTA Raw Data', data, 'OTA');
                        menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'View All Data',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) View All Data was pressed`);
                        let data = await collectAllData(false);
                        await fpClass.tables.showDataWebView('Vehicle Data Output', 'All Vehicle Data Collected', data);
                        menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Copy All Data to Clipboard',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Copy Data was pressed`);
                        let data = await collectAllData(true);
                        await Pasteboard.copyString(JSON.stringify(data, null, 4));
                        await fpClass.alertNotify.showAlert('Debug Menu', 'Vehicle Data Copied to Clipboard');
                        menuBuilderByType('diagnostics');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Send Data to Developer',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Email Vehicle Data was pressed`);
                        let data = await collectAllData(true);
                        await fpClass.utils.createEmailObject(data, true);
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'reset':
            title = 'Reset Data Menu';
            items = [{
                    title: 'Clear Cached Files/Images',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Clear Files/Images was pressed`);
                        await fpClass.files.clearFileManager();
                        await fpClass.alertNotify.showAlert('Widget Reset Menu', 'Saved Files and Images Cleared\n\nPlease run the script again to reload them all.');
                        // menuBuilderByType('reset');
                        this.close();
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Clear Login Info',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Clear Login Info was pressed`);
                        if (await fpClass.alertNotify.showYesNoPrompt('Clear Login & Settings', 'Are you sure you want to reset your login details and settings?\n\nThis will require you to enter your login info again?')) {
                            await fpClass.kc.clearKeychain();
                            await fpClass.alertNotify.showAlert('Widget Reset Menu', 'Saved Settings Cleared\n\nPlease run the script again to re-initialize the widget.');
                            this.close();
                        } else {
                            menuBuilderByType('reset');
                        }
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Reset Everything',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Reset Everything was pressed`);
                        if (await fpClass.alertNotify.showYesNoPrompt('Reset Everything', "Are you sure you want to reset the widget?\n\nThis will reset the widget back to it's default state?")) {
                            await fpClass.kc.clearKeychain();
                            await fpClass.files.clearFileManager();
                            await fpClass.alertNotify.showAlert('Widget Reset Menu', 'All Files, Settings, and Login Info Cleared\n\nPlease run the script again to re-initialize the app.');
                            this.close();
                        } else {
                            menuBuilderByType('reset');
                        }
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'Back',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
        case 'settings':
            let mapProvider = await fpClass.kc.getMapProvider();
            let widgetStyle = await fpClass.kc.getWidgetStyle();
            title = 'Widget Settings';
            items = [{
                    title: `Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`,
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Map Provider pressed`);
                        await fpClass.kc.toggleMapProvider();
                        menuBuilderByType('settings');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: `Widget Style: ${fpClass.utils.capitalizeStr(widgetStyle)}`,
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Widget Style pressed`);
                        await widgetStyleSelector('medium');
                        menuBuilderByType('settings');
                    },
                    destructive: false,
                    show: true,
                },
                {
                    title: 'Reset Login/File Options',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Clear All Data was pressed`);
                        menuBuilderByType('reset');
                        // menuBuilderByType('settings');
                    },
                    destructive: true,
                    show: true,
                },
                {
                    title: 'View Scriptable Settings',
                    action: async() => {
                        console.log(`(${typeDesc} Menu) View Scriptable Settings was pressed`);
                        await Safari.open(URLScheme.forOpeningScriptSettings());
                    },
                    destructive: false,
                    show: true,
                },

                {
                    title: `Back`,
                    action: async() => {
                        console.log(`(${typeDesc} Menu) Back was pressed`);
                        menuBuilderByType('main');
                    },
                    destructive: false,
                    show: true,
                },
            ];
            break;
    }
    if (title.length > 0 && items.length > 0) {
        let menuItems = items.filter((item) => item.show === true);
        // console.log(`subcontrol menuItems(${menuItems.length}): ${JSON.stringify(menuItems)}`);
        const subMenu = new Alert();
        subMenu.title = title;
        subMenu.message = message;
        menuItems.forEach((item, ind) => {
            if (item.destructive) {
                subMenu.addDestructiveAction(item.title);
            } else {
                subMenu.addAction(item.title);
            }
        });
        const respInd = await subMenu.presentSheet();
        if (respInd !== null) {
            const menuItem = menuItems[respInd];
            // console.log(`(Sub Control Menu) Selected: ${JSON.stringify(menuItem)}`);
            menuItem.action();
        }
    }
}

async function requiredPrefsMenu() {
    try {
        let user = await fpClass.kc.getKeychainValue('fpUser');
        let pass = await fpClass.kc.getKeychainValue('fpPass');
        let vin = await fpClass.kc.getKeychainValue('fpVin');
        let mapProvider = await fpClass.kc.getMapProvider();

        let prefsMenu = new Alert();
        prefsMenu.title = 'Required Settings Missing';
        prefsMenu.message = 'Please enter you FordPass Credentials and Vehicle VIN.\n\nTap a setting to toggle change\nPress Done to Save.';

        prefsMenu.addTextField('FordPass Email', user || '');
        prefsMenu.addSecureTextField('FordPass Password', pass || '');
        prefsMenu.addTextField('Vehicle VIN', vin || '');

        prefsMenu.addAction(`Map Provider: ${mapProvider === 'apple' ? 'Apple' : 'Google'}`); //0
        prefsMenu.addAction('View Documentation'); //1
        prefsMenu.addAction('Watch Setup Video'); //2

        prefsMenu.addAction('Save'); //3
        prefsMenu.addCancelAction('Cancel'); //4

        let respInd = await prefsMenu.presentAlert();
        switch (respInd) {
            case 0:
                console.log('(Required Prefs Menu) Map Provider pressed');
                await fpClass.kc.toggleMapProvider();
                requiredPrefsMenu();
                break;
            case 1:
                console.log('(Required Prefs Menu) View Documentation pressed');
                await Safari.openInApp(fpClass.statics.textMap().about.documentationUrl);
                requiredPrefsMenu();
                break;
            case 2:
                console.log('(Required Prefs Menu) Map Provider pressed');
                await Safari.openInApp(fpClass.statics.textMap().about.helpVideos.setup.url);
                requiredPrefsMenu();
                break;
            case 3:
                console.log('(Required Prefs Menu) Done was pressed');
                user = prefsMenu.textFieldValue(0);
                pass = prefsMenu.textFieldValue(1);
                vin = prefsMenu.textFieldValue(2);
                // console.log(`${user} ${pass} ${vin}`);

                if (fpClass.utils.inputTest(user) && fpClass.utils.inputTest(pass) && fpClass.utils.inputTest(vin)) {
                    await fpClass.kc.setKeychainValue('fpUser', user);
                    await fpClass.kc.setKeychainValue('fpPass', pass);
                    await fpClass.kc.setKeychainValue('fpMapProvider', mapProvider);
                    let vinChk = await fpClass.kc.vinCheck(vin, true);
                    console.log(`VIN Number Ok: ${vinChk}`);
                    if (vinChk) {
                        await fpClass.kc.setKeychainValue('fpVin', vin.toUpperCase());
                        await fpClass.fordRequests.queryFordPassPrefs(true);
                        return true;
                    } else {
                        // await requiredPrefsMenu();
                        await prepWidget();
                    }
                } else {
                    await prepWidget();
                }
                break;
            case 4:
                return false;
        }
    } catch (err) {
        console.log(`(Required Prefs Menu) Error: ${err}`);
        throw err;
    }
}

async function scheduleMainTableRefresh(interval) {
    await fpClass.timers.createTimer(
        'mainTableRefresh',
        interval,
        false,
        async() => {
            console.log('(Main Table) Refresh Timer Fired');
            await fpClass.fordRequests.fetchVehicleData(false);
            await generateMainInfoTable(true);
        },
        false,
    );
}

async function createRemoteStartStatusTimer() {
    console.log('createRemoteStartStatusTimer');
    await fpClass.timers.createTimer(
        'remoteStartStatus',
        60000,
        false,
        async() => {
            console.log('(Remote Start Status) Timer fired');
            await fpClass.fordRequests.fetchVehicleData(false);
            await generateMainInfoTable(true);
        },
        true,
    );
}

async function generateMainInfoTable(update = false) {
    const vData = await fpClass.fordRequests.fetchVehicleData(true);
    const caps = vData.capabilities && vData.capabilities.length ? vData.capabilities : undefined;
    const isEV = vData.evVehicle === true;
    const pressureUnits = await fpClass.kc.getKeychainValue('fpPressureUnits');
    const distanceMultiplier = (await fpClass.kc.useMetricUnits()) ? 1 : 0.621371; // distance multiplier
    const distanceUnit = (await fpClass.kc.useMetricUnits()) ? 'km' : 'mi'; // unit of length
    const tireUnit = pressureUnits.toLowerCase() === 'kpa' ? 'kPa' : pressureUnits.toLowerCase();
    const dtePostfix = isEV ? 'Range' : 'to E';

    let lvlValue = !isEV ? (vData.fuelLevel ? vData.fuelLevel : 0) : vData.evBatteryLevel ? vData.evBatteryLevel : 0;
    let dteValue = !isEV ? (vData.distanceToEmpty ? vData.distanceToEmpty : null) : vData.evDistanceToEmpty ? vData.evDistanceToEmpty : null;
    let dteString = dteValue ? `${Math.round(dteValue * distanceMultiplier)}${distanceUnit} ${dtePostfix}` : fpClass.statics.textMap().errorMessages.noData;

    let ignStatus = '';
    if (vData.remoteStartStatus && vData.remoteStartStatus.running ? true : false) {
        ignStatus = `Remote Start (ON)` + (vData.remoteStartStatus.runtimeLeft && vData.remoteStartStatus.runtime ? `\n(${vData.remoteStartStatus.runtimeLeft} of ${vData.remoteStartStatus.runtime} minutes remain)` : '');
        createRemoteStartStatusTimer();
    } else {
        fpClass.timers.stopTimer('remoteStartStatus');
        ignStatus = vData.ignitionStatus !== undefined ? vData.ignitionStatus.charAt(0).toUpperCase() + vData.ignitionStatus.slice(1) : fpClass.statics.textMap().errorMessages.noData;
    }
    let refreshTime = vData.lastRefreshElapsed ? vData.lastRefreshElapsed : fpClass.statics.textMap().UIValues.unknown;
    const odometerVal = vData.odometer ? `${Math.round(vData.odometer * distanceMultiplier)} ${distanceUnit}` : fpClass.statics.textMap().errorMessages.noData;
    const msgs = vData.messages && vData.messages.length ? vData.messages : [];
    const recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
    const msgsUnread = msgs && msgs.length ? msgs.filter((msg) => msg.isRead === false) : [];
    const headerColor = '#13233F';
    const titleBgColor = darkMode ? '#444141' : '#F5F5F5';

    let tableRows = [];

    try {
        // Header Section - Row 1: vehicle messages, vehicle type, vehicle alerts
        tableRows.push(
            await fpClass.tables.createTableRow(
                [
                    await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_message_center_notification_dark.png`), { align: 'left', widthWeight: 3 }),
                    await fpClass.tables.createButtonCell(msgs.length ? `${msgs.length}` : '', {
                        align: 'left',
                        widthWeight: 27,
                        onTap: async() => {
                            console.log('(Dashboard) View Messages was pressed');
                            await generateMessagesTable(vData, false);
                        },
                    }),

                    await fpClass.tables.createTextCell(vData.info.vehicle.vehicleType, odometerVal, { align: 'center', widthWeight: 40, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textWhite), subtitleColor: Color.lightGray(), titleFont: Font.title3(), subtitleFont: Font.footnote() }),
                    await fpClass.tables.createButtonCell('Menu', {
                        align: 'right',
                        widthWeight: 30,
                        dismissOnTap: false,
                        onTap: async() => {
                            console.log(`(Dashboard) Menu Button was pressed`);
                            menuBuilderByType('main');
                        },
                    }),
                ], {
                    backgroundColor: new Color(headerColor),
                    height: 40,
                    isHeader: true,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 2: Shows tire pressure label and unit
        tableRows.push(
            await fpClass.tables.createTableRow(
                [
                    await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 30 }),
                    await fpClass.tables.createTextCell(undefined, `Tires: (${tireUnit})`, { align: 'center', widthWeight: 40, subtitleColor: new Color(fpClass.statics.colorMap.textWhite), subtitleFont: Font.subheadline() }),
                    await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 30 }),
                ], {
                    backgroundColor: new Color(headerColor),
                    height: 20,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 3: Displays the Vehicle Image in center and doors on the left and windows on the right
        const openDoors = getOpenItems(vData.statusDoors); //['LF', 'RR', 'HD'];
        const openWindows = getOpenItems(vData.statusWindows); //['LF', 'RR', 'HD'];
        // console.log(`openDoors: ${JSON.stringify(openDoors)}`);
        // console.log(`openWindows: ${JSON.stringify(openWindows)}`);
        tableRows.push(
            await fpClass.tables.createTableRow(
                [
                    // Door Status Cells
                    await fpClass.tables.createImageCell(await fpClass.files.getImage(`door_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                    await fpClass.tables.createTextCell('Doors', openDoors.length ? openDoors.join(', ') : 'Closed', {
                        align: 'left',
                        widthWeight: 25,
                        dismissOnTap: false,
                        titleColor: new Color(fpClass.statics.colorMap.textWhite),
                        titleFont: Font.headline(),
                        subtitleColor: new Color(openDoors.length ? '#FF5733' : '#5A65C0'),
                        subtitleFont: Font.subheadline(),
                    }),
                    await fpClass.tables.createTextCell(`LF: ${vData.tirePressure.leftFront}\n\n\n\nRF: ${vData.tirePressure.leftRear}`, undefined, { align: 'right', widthWeight: 10, titleColor: new Color(fpClass.statics.colorMap.textWhite), titleFont: Font.mediumSystemFont(9) }),
                    await fpClass.tables.createImageCell(await fpClass.files.getVehicleImage(vData.info.vehicle.modelYear, false, 1), { align: 'center', widthWeight: 20 }),
                    await fpClass.tables.createTextCell(`LR: ${vData.tirePressure.rightFront}\n\n\n\nRR: ${vData.tirePressure.rightRear}`, undefined, { align: 'left', widthWeight: 10, titleColor: new Color(fpClass.statics.colorMap.textWhite), titleFont: Font.mediumSystemFont(9) }),
                    // Window Status Cells
                    await fpClass.tables.createTextCell('Windows', openWindows.length ? openWindows.join(', ') : 'Closed', {
                        align: 'right',
                        widthWeight: 25,
                        dismissOnTap: false,
                        titleColor: new Color(fpClass.statics.colorMap.textWhite),
                        titleFont: Font.headline(),
                        subtitleColor: new Color(openWindows.length ? '#FF5733' : '#5A65C0'),
                        subtitleFont: Font.subheadline(),
                    }),
                    await fpClass.tables.createImageCell(await fpClass.files.getImage(`window_dark_menu.png`), { align: 'center', widthWeight: 5 }),
                ], {
                    backgroundColor: new Color(headerColor),
                    height: 100,
                    cellSpacing: 0,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 4: Shows fuel/EV battery level and range
        tableRows.push(
            await fpClass.tables.createTableRow(
                [
                    await fpClass.tables.createImageCell(isEV ? await fpClass.files.getImage(`ev_battery_dark_menu.png`) : await fpClass.files.getFPImage(`ic_gauge_fuel_dark.png`), { align: 'center', widthWeight: 5 }),
                    await fpClass.tables.createTextCell(`${isEV ? 'Charge' : 'Fuel'}: ${lvlValue < 0 || lvlValue > 100 ? '--' : lvlValue + '%'}`, dteString, { align: 'left', widthWeight: 45, titleColor: new Color(fpClass.statics.colorMap.textWhite), titleFont: Font.headline(), subtitleColor: Color.lightGray(), subtitleFont: Font.subheadline() }),
                    await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 50 }),
                ], {
                    backgroundColor: new Color(headerColor),
                    height: 40,
                    dismissOnSelect: false,
                },
            ),
        );

        // Header Section - Row 5: Shows vehicle checkin timestamp
        tableRows.push(
            await fpClass.tables.createTableRow(
                [
                    // await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                    await fpClass.tables.createTextCell('Last Checkin: ' + refreshTime, undefined, { align: 'center', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textWhite), titleFont: Font.regularSystemFont(9) }),
                    // await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 20 }),
                ], {
                    backgroundColor: new Color(headerColor),
                    height: 20,
                    dismissOnSelect: false,
                },
            ),
        );

        let update = false;
        if (widgetConfig.showTestUIStuff) {
            vData.alerts = {
                vha: [{
                    alertIdentifier: 'E19-374-43',
                    activityId: '91760a25-5e8a-48f8-9f10-41392781e0d7',
                    eventTimeStamp: '1/6/2022 12:3:4 AM',
                    colorCode: 'A',
                    iconName: 'ic_washer_fluid',
                    activeAlertBody: {
                        headline: 'Low Washer Fluid',
                        formattedBody: "<div class='accordion' id='SymptomHeader'><h2 class='toggle'><b>What Is Happening?</b></h2><div class='content' id='SymptomHeaderDesc'><p>Low windshield washer fluid.</p></div><h2 class='toggle' id='CustomerActionHeader'><b>What Should I Do?</b></h2><div class='content' id='CustomerActionHeaderDesc'><p>Check the windshield washer reservoir. Add washer fluid as needed.</p></div></div>",
                        wilcode: '600E19',
                        dtccode: '',
                    },
                    hmiAlertBody: null,
                }, ],
                mmota: [{
                    alertIdentifier: 'MMOTA_UPDATE_SUCCESSFUL',
                    inhibitRequired: false,
                    dateTimeStamp: '1641426296850',
                    releaseNotesUrl: 'http://vehicleupdates.files.ford.com/release-notes/custom-release-note-1634252934280-a3b8e883-d3aa-44fc-8419-4f0d6c78e185',
                    colorCode: 'G',
                    iconName: 'ic_mmota_alert_update_successful',
                    scheduleRequired: false,
                    wifiRequired: false,
                    consentRequired: false,
                    vehicleTime: '23:44',
                    vehicleDate: '2022-01-05',
                    updateDisplayTime: null,
                }, ],
                summary: [
                    { alertType: 'VHA', alertDescription: 'Low Washer Fluid', alertIdentifier: 'E19-374-43', urgency: 'L', colorCode: 'A', iconName: 'ic_washer_fluid', alertPriority: 1 },
                    { alertType: 'MMOTA', alertDescription: 'UPDATE SUCCESSFUL', alertIdentifier: 'MMOTA_UPDATE_SUCCESSFUL', urgency: null, colorCode: 'G', iconName: 'ic_mmota_alert_update_successful', alertPriority: 2 },
                ],
            };

            vData.firmwareUpdating = true;
            vData.deepSleepMode = true;
            update = true;
        }

        // Script Update Available Row
        if (update || updateAvailable) {
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [await fpClass.tables.createTextCell(`New Widget Update Available (v${LATEST_VERSION})`, 'Tap here to update', { align: 'center', widthWeight: 100, titleColor: new Color('#b605fc'), titleFont: Font.subheadline(), subtitleColor: new Color(fpClass.statics.colorMap.textColor1), subtitleFont: Font.regularSystemFont(9) })], {
                        height: 40,
                        dismissOnSelect: false,
                        onSelect: async() => {
                            console.log('(Main Menu) Update Widget was pressed');
                            let callback = new CallbackURL('scriptable:///run');
                            callback.addParameter('scriptName', 'FordWidgetTool');
                            callback.open();
                        },
                    },
                ),
            );
        }

        // Vehicle Recalls Section - Creates rows for each summary recall
        if (recalls && recalls.length) {
            // Creates the Vehicle Recalls Title Row
            tableRows.push(
                await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], {
                    height: 30,
                    isHeader: true,
                    dismissOnSelect: false,
                    backgroundColor: new Color(titleBgColor),
                }),
            );
            // Creates a single row for each recall in the top 10 of recalls array
            for (const [i, recall] of recalls.entries()) {
                if (i >= 10) {
                    break;
                }
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell(recall.title, recall.type + '\n' + recall.id, { align: 'left', widthWeight: 93, titleColor: new Color('#E96C00'), titleFont: Font.body(), subtitleColor: new Color(fpClass.statics.colorMap.textColor1), subtitleFont: Font.regularSystemFont(9) }),
                        ], {
                            height: 44,
                            dismissOnSelect: false,
                            cellSpacing: 5,
                            onSelect: async() => {
                                console.log('(Dashboard) Recall Item row was pressed');
                                await generateRecallsTable(vData);
                            },
                        },
                    ),
                );
            }
        }

        // Vehicle Alerts Section - Creates rows for each summary alert
        if ((vData.alerts && vData.alerts.summary && vData.alerts.summary.length) || vData.firmwareUpdating || vData.deepSleepMode) {
            let alertsSummary = vData.alerts && vData.alerts.summary && vData.alerts.summary.length ? vData.alerts.summary : [];

            if (vData.deepSleepMode) {
                alertsSummary.push({ alertType: 'VHA', alertDescription: 'Deep Sleep Active - Low Battery', urgency: 'L', colorCode: 'R', iconName: 'battery_12v', alertPriority: 1, noButton: true });
            }
            if (vData.firmwareUpdating) {
                alertsSummary.push({ alertType: 'MMOTA', alertDescription: 'Firmware Update in Progress', urgency: 'L', colorCode: 'G', iconName: 'ic_software_updates', alertPriority: 1, noButton: true });
            }

            // Creates the Vehicle Alerts Title Row
            tableRows.push(
                await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`Vehicle Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], {
                    height: 30,
                    isHeader: true,
                    dismissOnSelect: false,
                    backgroundColor: new Color(titleBgColor),
                }),
            );
            // Creates a single row for each alert in the top 10 of alerts.summary array
            for (const [i, alert] of alertsSummary.entries()) {
                if (i >= 10) {
                    break;
                }
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell(alert.alertDescription, fpClass.tables.getAlertDescByType(alert.alertType), {
                                align: 'left',
                                widthWeight: 93,
                                titleColor: new Color(fpClass.tables.getAlertColorByCode(alert.colorCode)),
                                titleFont: Font.body(),
                                subtitleColor: new Color(fpClass.statics.colorMap.textColor1),
                                subtitleFont: Font.regularSystemFont(9),
                            }),
                        ], {
                            height: 44,
                            dismissOnSelect: false,
                            cellSpacing: 5,
                            onSelect: alert.noButton === undefined || alert.noButton === false ?
                                async() => {
                                    console.log('(Dashboard) Alert Item row was pressed');
                                    // await fpClass.alertNotify.showAlert('Alert Item', `Alert Type: ${alert.alertType}`);
                                    await generateAlertsTable(vData);
                                } :
                                undefined,
                        },
                    ),
                );
            }
        }

        // Unread Messages Section - Displays a count of unread messages and a button to view all messages
        if (msgsUnread.length) {
            tableRows.push(
                await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('Unread Messages', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], {
                    height: 30,
                    isHeader: true,
                    dismissOnSelect: false,
                    backgroundColor: new Color(titleBgColor),
                }),
            );

            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                        await fpClass.tables.createTextCell(`Unread Message${msgsUnread.length > 1 ? 's' : ''}: (${msgsUnread.length})`, undefined, {
                            align: 'left',
                            widthWeight: 76,
                            titleColor: new Color(fpClass.statics.colorMap.textColor1),
                            titleFont: Font.body(),
                            subtitleColor: new Color(fpClass.statics.colorMap.textColor1),
                            subtitleFont: Font.regularSystemFont(9),
                        }),
                        await fpClass.tables.createButtonCell('View', {
                            align: 'center',
                            widthWeight: 17,
                            onTap: async() => {
                                console.log('(Dashboard) View Unread Messages was pressed');
                                await generateMessagesTable(vData, true);
                            },
                        }),
                    ], {
                        height: 44,
                        dismissOnSelect: false,
                        cellSpacing: 5,
                        onSelect: async() => {
                            console.log('(Dashboard) View Unread Messages was pressed');
                            await generateMessagesTable(vData, true);
                        },
                    },
                ),
            );
        }

        // Vehicle Controls Section - Remote Start, Door Locks, and Horn/Lights
        if (caps && caps.length && (caps.includes('DOOR_LOCK_UNLOCK') || caps.includes('REMOTE_START') || caps.includes('REMOTE_PANIC_ALARM'))) {
            // Creates the Status & Remote Controls Header Row
            tableRows.push(
                await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('Remote Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], {
                    height: 30,
                    isHeader: true,
                    dismissOnSelect: false,
                    backgroundColor: new Color(titleBgColor),
                }),
            );

            // Generates the Lock Control Row
            if (caps.includes('DOOR_LOCK_UNLOCK')) {
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`${vData.lockStatus === 'LOCKED' ? 'lock_icon' : 'unlock_icon'}_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell('Locks', vData.lockStatus === 'LOCKED' ? 'Locked' : 'Unlocked', {
                                align: 'left',
                                widthWeight: 59,
                                titleColor: new Color(fpClass.statics.colorMap.textColor1),
                                subtitleColor: new Color(vData.lockStatus === 'LOCKED' ? '#5A65C0' : '#FF5733'),
                                titleFont: Font.headline(),
                                subtitleFont: Font.subheadline(),
                            }),
                            await fpClass.tables.createButtonCell('Unlock', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Lock was pressed');
                                    if (await fpClass.alertNotify.showYesNoPrompt('Locks', 'Are you sure you want to unlock the vehicle?')) {
                                        await fpClass.fordCommands.sendVehicleCmd('unlock');
                                    }
                                },
                            }),
                            await fpClass.tables.createButtonCell('Lock', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Lock was pressed');
                                    await fpClass.fordCommands.sendVehicleCmd('lock');
                                },
                            }),
                        ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Remote Start Control Row
            if (caps.includes('REMOTE_START')) {
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_paak_key_settings_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell('Ignition', ignStatus, { align: 'left', widthWeight: 59, titleColor: new Color(fpClass.statics.colorMap.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await fpClass.tables.createButtonCell('Stop', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Stop was pressed');
                                    await fpClass.fordCommands.sendVehicleCmd('stop');
                                },
                            }),
                            await fpClass.tables.createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Start was pressed');
                                    if (await fpClass.alertNotify.showYesNoPrompt('Remote Start', 'Are you sure you want to start the vehicle?')) {
                                        await fpClass.fordCommands.sendVehicleCmd('start');
                                    }
                                },
                            }),
                        ], { height: ignStatus.length > 17 ? 64 : 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Horn/Lights Control Row
            if (caps.includes('REMOTE_PANIC_ALARM')) {
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`res_0x7f080088_ic_control_lights_and_horn_active__0_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell('Sound Horn/Lights', undefined, { align: 'left', widthWeight: 76, titleColor: new Color(fpClass.statics.colorMap.textColor1), subtitleColor: new Color(ignStatus === 'Off' ? '#5A65C0' : '#FF5733'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),

                            await fpClass.tables.createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Horn/Lights was pressed');
                                    if (await fpClass.alertNotify.showYesNoPrompt('Horn/Lights', 'Are you sure you want to sound horn and light ?')) {
                                        await fpClass.fordCommands.sendVehicleCmd('horn_and_lights');
                                    }
                                },
                            }),
                        ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }
        }

        // Advanced Controls Section - Zone Lighting, SecuriAlert, Trailer Lights (if available)
        if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES' || caps.includes('GUARD_MODE') || caps.includes('TRAILER_LIGHT'))) {
            // Creates the Advanced Controls Header Text
            tableRows.push(
                await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('Advanced Controls', undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], {
                    height: 30,
                    isHeader: true,
                    dismissOnSelect: false,
                    backgroundColor: new Color(titleBgColor),
                }),
            );

            // Generates the SecuriAlert Control Row
            if (caps.includes('GUARD_MODE')) {
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_guard_mode_vd_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell('SecuriAlert', vData.alarmStatus, { align: 'left', widthWeight: 59, titleColor: new Color(fpClass.statics.colorMap.textColor1), subtitleColor: new Color(vData.alarmStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await fpClass.tables.createButtonCell('Enable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) SecuriAlert Enable was pressed');
                                    await fpClass.fordCommands.sendVehicleCmd('guard_mode_on');
                                },
                            }),
                            await fpClass.tables.createButtonCell('Disable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) SecuriAlert Disable was pressed');
                                    if (await fpClass.alertNotify.showYesNoPrompt('SecuriAlert', 'Are you sure you want to disable SecuriAlert?')) {
                                        await fpClass.fordCommands.sendVehicleCmd('guard_mode_off');
                                    }
                                },
                            }),
                        ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Zone Lighting Control Row
            if (caps.includes('ZONE_LIGHTING_FOUR_ZONES') || caps.includes('ZONE_LIGHTING_TWO_ZONES')) {
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_zone_lighting_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell('Zone Lighting', vData.zoneLightingStatus, { align: 'left', widthWeight: 59, titleColor: new Color(fpClass.statics.colorMap.textColor1), subtitleColor: new Color(vData.zoneLightingStatus === 'On' ? '#FF5733' : '#5A65C0'), titleFont: Font.headline(), subtitleFont: Font.subheadline() }),
                            await fpClass.tables.createButtonCell('Enable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Zone Lighting On Button was pressed');
                                    fpClass.alertNotify.showActionPrompt(
                                        'Zone Lighting On Menu',
                                        undefined, [{
                                                title: 'Front Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Front On was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_front_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Rear Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Rear On was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_rear_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Left Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Left On was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_left_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Right Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Right On was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_right_on');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'All Zones',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone All On was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_all_on');
                                                },
                                                destructive: false,
                                                show: true,
                                            },
                                        ],
                                        true,
                                    );
                                },
                            }),
                            await fpClass.tables.createButtonCell('Disable', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Zone Lighting Off Button was pressed');
                                    fpClass.alertNotify.showActionPrompt(
                                        'Zone Lighting Off',
                                        undefined, [{
                                                title: 'Front Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Front Off was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_front_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Rear Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Rear Off was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_rear_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Left Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Left Off was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_left_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'Right Zone',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone Right Off was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_right_off');
                                                },
                                                destructive: false,
                                                show: caps.includes('ZONE_LIGHTING_FOUR_ZONES'),
                                            },
                                            {
                                                title: 'All Zones',
                                                action: async() => {
                                                    console.log(`(Dashboard) Zone All Off was pressed`);
                                                    await fpClass.fordCommands.sendVehicleCmd('zone_lights_all_off');
                                                },
                                                destructive: false,
                                                show: true,
                                            },
                                        ],
                                        true,
                                    );
                                },
                            }),
                        ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }

            // Generates the Trailer Light Check Control Row
            if (caps.includes('TRAILER_LIGHT')) {
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_trailer_light_check_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 7 }),
                            await fpClass.tables.createTextCell('Trailer Light Check', vData.trailerLightCheckStatus, {
                                align: 'left',
                                widthWeight: 59,
                                titleColor: new Color(fpClass.statics.colorMap.textColor1),
                                subtitleColor: new Color(vData.trailerLightCheckStatus === 'On' ? '#FF5733' : '#5A65C0'),
                                titleFont: Font.headline(),
                                subtitleFont: Font.subheadline(),
                            }),
                            await fpClass.tables.createButtonCell('Start', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Trailer Light Check Start was pressed');
                                    if (await fpClass.alertNotify.showYesNoPrompt('Trailer Light Check', 'Are you sure want to start the trailer light check process?')) {
                                        await fpClass.fordCommands.sendVehicleCmd('trailer_light_check_on');
                                    }
                                },
                            }),
                            await fpClass.tables.createButtonCell('Stop', {
                                align: 'center',
                                widthWeight: 17,
                                onTap: async() => {
                                    console.log('(Dashboard) Trailer Light Check Stop was pressed');
                                    await fpClass.fordCommands.sendVehicleCmd('trailer_light_check_off');
                                },
                            }),
                        ], { height: 44, cellSpacing: 5, dismissOnSelect: false },
                    ),
                );
            }
        }
    } catch (err) {
        console.error(`Error in generateMainInfoTable: ${err}`);
    }

    await fpClass.tables.generateTableMenu('main', tableRows, false, isPhone, update);
    if (!update) {
        let lastVersion = await fpClass.kc.getKeychainValue('fpScriptVersion');
        if (lastVersion !== SCRIPT_VERSION) {
            await generateRecentChangesTable();
            await fpClass.kc.setKeychainValue('fpScriptVersion', SCRIPT_VERSION);
        }
    }
}

async function generateAlertsTable(vData) {
    let vhaAlerts = vData.alerts && vData.alerts.vha && vData.alerts.vha.length ? vData.alerts.vha : [];
    let otaAlerts = vData.alerts && vData.alerts.mmota && vData.alerts.mmota.length ? vData.alerts.mmota : [];

    let tableRows = [];
    if (vhaAlerts.length > 0) {
        tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`Vehicle Health Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], { height: 20, isHeader: true, dismissOnSelect: false }));
        for (const [i, alert] of vhaAlerts.entries()) {
            let dtTS = alert.eventTimeStamp ? fpClass.utils.convertFordDtToLocal(alert.eventTimeStamp) : undefined;
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                        await fpClass.tables.createTextCell(alert.activeAlertBody.headline || fpClass.statics.textMap().errorMessages.noData, dtTS ? fpClass.utils.timeDifference(dtTS) : '', {
                            align: 'left',
                            widthWeight: 93,
                            titleColor: new Color(fpClass.tables.getAlertColorByCode(alert.colorCode)),
                            titleFont: Font.headline(),
                            subtitleColor: Color.darkGray(),
                            subtitleFont: Font.regularSystemFont(9),
                        }),
                    ], { height: 40, dismissOnSelect: false },
                ),
            );
        }
    }

    if (otaAlerts.length > 0) {
        tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 100 })], { height: 20, dismissOnSelect: false }));
        tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`OTA Update Alerts`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], { height: 20, isHeader: true, dismissOnSelect: false }));
        for (const [i, alert] of otaAlerts.entries()) {
            let dtTS = alert.vehicleDate && alert.vehicleTime ? fpClass.utils.convertFordDtToLocal(`${alert.vehicleDate} ${alert.vehicleTime}`) : undefined;
            let timeDiff = dtTS ? fpClass.utils.timeDifference(dtTS) : '';
            let title = alert.alertIdentifier ? alert.alertIdentifier.replace('MMOTA_', '').split('_').join(' ') : undefined;

            let releaseNotes;
            if (alert.releaseNotesUrl) {
                let locale = (await fpClass.kc.getKeychainValue('fpLanguage')) || Device.locale().replace('_', '-');
                releaseNotes = await fpClass.utils.getReleaseNotes(alert.releaseNotesUrl, locale);
            }
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                        await fpClass.tables.createTextCell(title, timeDiff, { align: 'left', widthWeight: 93, titleColor: new Color(fpClass.tables.getAlertColorByCode(alert.colorCode)), titleFont: Font.headline(), subtitleColor: Color.darkGray(), subtitleFont: Font.regularSystemFont(9) }),
                    ], { height: 44, dismissOnSelect: false },
                ),
            );

            tableRows.push(
                await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(releaseNotes, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.regularSystemFont(12) })], { height: fpClass.tables.getRowHeightByTxtLength(releaseNotes), dismissOnSelect: false }),
            );
        }
    }

    await fpClass.tables.generateTableMenu('alerts', tableRows, false, false);
}

async function generateRecallsTable(vData) {
    try {
        let recalls = vData.recallInfo && vData.recallInfo.length && vData.recallInfo[0].recalls && vData.recallInfo[0].recalls.length > 0 ? vData.recallInfo[0].recalls : [];
        let tableRows = [];

        if (recalls.length > 0) {
            tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`Vehicle Recall(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() })], { height: 40, isHeader: true, dismissOnSelect: false }));
            for (const [i, recall] of recalls.entries()) {
                let dtTS = recall.nhtsaInfo && recall.nhtsaInfo.recallDate ? new Date(Date.parse(recall.nhtsaInfo.recallDate)) : undefined;
                let dateStr = dtTS ? dtTS.toLocaleDateString() : undefined;
                let timeDiff = dtTS ? fpClass.utils.timeDifference(dtTS) : '';
                let timestamp = `${dateStr ? ' - ' + dateStr : ''}${timeDiff ? ' (' + timeDiff + ')' : ''}`;
                let recallType = recall.type ? `${recall.type}` : '';
                let recallId = recall.id ? `${recallType.length ? '\n' : ''}Recall ID: ${recall.id}` : '';
                let titleSub = `${recallType}${recallId}${timestamp}`;

                // Creates Recall Header Rows
                tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: new Color('#E96C00'), height: 10, dismissOnSelect: false }));
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_recall_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 6 }),

                            await fpClass.tables.createTextCell(recall.title, titleSub, {
                                align: 'left',
                                widthWeight: 94,
                                titleColor: new Color(fpClass.statics.colorMap.textColor1),
                                titleFont: Font.headline(),
                                subtitleColor: new Color(fpClass.statics.colorMap.textColor1),
                                subtitleFont: Font.regularSystemFont(10),
                            }),
                        ], { height: 50, dismissOnSelect: false },
                    ),
                );

                // Creates Recall Safety Description Row
                if (recall.nhtsaInfo && recall.nhtsaInfo.safetyDescription) {
                    tableRows.push(
                        await fpClass.tables.createTableRow(
                            [await fpClass.tables.createTextCell('Safety Description', recall.nhtsaInfo.safetyDescription, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                                height: fpClass.tables.getRowHeightByTxtLength(recall.nhtsaInfo.safetyDescription),
                                dismissOnSelect: false,
                            },
                        ),
                    );
                }
                // Creates Recall Remedy Program Row
                if (recall.nhtsaInfo && recall.nhtsaInfo.remedyProgram) {
                    tableRows.push(
                        await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('Remedy Program', recall.nhtsaInfo.remedyProgram, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                            height: fpClass.tables.getRowHeightByTxtLength(recall.nhtsaInfo.remedyProgram),
                            dismissOnSelect: false,
                        }),
                    );
                }
                // Creates Recall Manufacturer Notes Row
                if (recall.nhtsaInfo && recall.nhtsaInfo.manufacturerNotes) {
                    tableRows.push(
                        await fpClass.tables.createTableRow(
                            [await fpClass.tables.createTextCell('Manufacturer Notes', recall.nhtsaInfo.manufacturerNotes, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title3(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                                height: fpClass.tables.getRowHeightByTxtLength(recall.nhtsaInfo.manufacturerNotes),
                                dismissOnSelect: false,
                            },
                        ),
                    );
                }
                // Creates a blank row
                tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('', undefined, { align: 'left', widthWeight: 30 })]));
            }
        } else {
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await fpClass.tables.createTextCell(`${recalls.length} Recalls(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() }),
                        await fpClass.tables.createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                    ], { height: 44, dismissOnSelect: false },
                ),
            );

            tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(fpClass.statics.textMap().errorMessages.noMessages, undefined, { align: 'left', widthWeight: 1, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.body() })], { height: 44, dismissOnSelect: false }));
        }

        await fpClass.tables.generateTableMenu('recalls', tableRows, false, false);
    } catch (err) {
        console.log(`error in generateRecallsTable: ${err}`);
    }
}

async function generateMessagesTable(vData, unreadOnly = false, update = false) {
    try {
        let msgs = vData.messages && vData.messages && vData.messages && vData.messages.length ? vData.messages : messageTest || [];
        msgs = unreadOnly ? msgs.filter((msg) => msg.isRead === false) : msgs;

        let tableRows = [];

        if (msgs.length > 0) {
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await fpClass.tables.createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() }),
                        await fpClass.tables.createTextCell('All', undefined, { align: 'right', widthWeight: 20, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.title2() }),
                    ], {
                        height: 40,
                        dismissOnSelect: false,
                        onSelect: async() => {
                            console.log(`(Messages Table) All Message Options was pressed`);
                            let msgIds = msgs.map((msg) => msg.messageId);
                            fpClass.alerts.showActionPrompt(
                                'All Message Options',
                                undefined, [{
                                        title: 'Mark All Read',
                                        action: async() => {
                                            console.log(`(Messages Table) Mark All Messages Read was pressed`);
                                            let ok = await fpClass.alerts.showPrompt(`All Message Options`, `Are you sure you want to mark all messages as read?`, `Mark (${msgIds.length}) Read`, true);
                                            if (ok) {
                                                console.log(`(Messages Table) Marking ${msgIds.length} Messages as Read`);
                                                if (await fpClass.fordRequests.markMultipleUserMessagesRead(msgIds)) {
                                                    console.log(`(Messages Table) Marked (${msgIds.length}) Messages as Read Successfully`);
                                                    fpClass.alerts.showAlert('Marked Messages as Read Successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fpClass.fordRequests.fetchVehicleData(false), unreadOnly, true);
                                                    generateMainInfoTable(true);
                                                }
                                            }
                                        },
                                        destructive: false,
                                        show: true,
                                    },
                                    {
                                        title: 'Delete All',
                                        action: async() => {
                                            console.log(`(Messages Table) Delete All Messages was pressed`);
                                            let ok = await fpClass.alerts.showPrompt('Delete All Messages', 'Are you sure you want to delete all messages?', `Delete (${msgIds.length}) Messages`, true);
                                            if (ok) {
                                                console.log(`(Messages Table) Deleting ${msgIds.length} Messages`);
                                                if (await fpClass.fordRequests.deleteUserMessages([msg.messageId])) {
                                                    console.log(`(Messages Table) Deleted (${msgIds.length}) Messages Successfully`);
                                                    fpClass.alerts.showAlert('Deleted Messages Successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fpClass.fordRequests.fetchVehicleData(false), unreadOnly, true);
                                                    generateMainInfoTable(true);
                                                }
                                            }
                                        },
                                        destructive: true,
                                        show: true,
                                    },
                                ],
                                true,
                                async() => {
                                    generateMessagesTable(vData, unreadOnly);
                                },
                            );
                        },
                    },
                ),
            );

            for (const [i, msg] of msgs.entries()) {
                let dtTS = msg.createdDate ? fpClass.utils.convertFordDtToLocal(msg.createdDate) : undefined;
                let timeDiff = dtTS ? fpClass.utils.timeDifference(dtTS) : '';
                let timeSubtitle = `${dtTS ? dtTS.toLocaleString() : ''}${timeDiff ? ` (${timeDiff})` : ''}`;

                // Creates Message Header Row
                tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('', undefined, { align: 'center', widthWeight: 1 })], { backgroundColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), height: 10, dismissOnSelect: false }));
                tableRows.push(
                    await fpClass.tables.createTableRow(
                        [
                            await fpClass.tables.createImageCell(await fpClass.files.getFPImage(`ic_message_center_notification_${darkMode ? 'dark' : 'light'}.png`), { align: 'center', widthWeight: 10 }),
                            await fpClass.tables.createTextCell(fpClass.tables.getMessageDescByType(msg.messageType), undefined, { align: 'left', widthWeight: 55, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.body() }),
                            await fpClass.tables.createTextCell(msg.isRead === false ? 'Unread' : 'Read', undefined, { align: 'right', widthWeight: 25, titleColor: msg.isRead === false ? new Color('#008200') : Color.darkGray(), titleFont: Font.body() }),
                            await fpClass.tables.createTextCell('...', undefined, { align: 'right', widthWeight: 10, dismissOnTap: false, titleColor: Color.purple(), titleFont: Font.title2() }),
                        ],
                        {
                            height: 40,
                            dismissOnSelect: false,
                            onSelect: async () => {
                                console.log(`(Messages Table) Message Options button was pressed for ${msg.messageId}`);
                                fpClass.alerts.showActionPrompt(
                                    'Message Options',
                                    undefined,
                                    [
                                        {
                                            title: 'Mark as Read',
                                            action: async () => {
                                                console.log(`(Messages Table) Marking Message with ID: ${msg.messageId} as Read...`);
                                                if (await fpClass.fordRequests.markMultipleUserMessagesRead([msg.messageId])) {
                                                    console.log(`(Messages Table) Message (${msg.messageId}) marked read successfully`);
                                                    fpClass.alerts.showAlert('Message marked read successfully', 'Message List will reload after data is refeshed');
                                                    await generateMessagesTable(await fpClass.fordRequests.fetchVehicleData(false), unreadOnly, true);
                                                    generateMainInfoTable(true);
                                                }
                                            },
                                            destructive: false,
                                            show: true,
                                        },
                                        {
                                            title: 'Delete Message',
                                            action: async () => {
                                                console.log(`(Messages Table) Delete Message ${msg.messageId} was pressed`);
                                                let ok = await fpClass.alerts.showPrompt('Delete Message', 'Are you sure you want to delete this message?', 'Delete', true);
                                                if (ok) {
                                                    console.log(`(Messages Table) Delete Confirmed for Message ID: ${msg.messageId}`);
                                                    if (await fpClass.fordRequests.deleteUserMessages([msg.messageId])) {
                                                        console.log(`(Messages Table) Message ${msg.messageId} deleted successfully`);
                                                        fpClass.alerts.showAlert('Message deleted successfully', 'Message List will reload after data is refeshed');
                                                        await generateMessagesTable(await fpClass.fordRequests.fetchVehicleData(false), unreadOnly, true);
                                                        generateMainInfoTable(true);
                                                        up;
                                                    } else {
                                                        await generateMessagesTable(vData, unreadOnly);
                                                    }
                                                }
                                            },
                                            destructive: true,
                                            show: true,
                                        },
                                    ],
                                    true,
                                    async () => {
                                        await generateMessagesTable(vData, unreadOnly);
                                    },
                                );
                            },
                        },
                    ),
                );

                // Creates Message Subject Row
                tableRows.push(
                    await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(msg.messageSubject, timeSubtitle, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.headline(), subtitleColor: Color.lightGray(), subtitleFont: Font.mediumSystemFont(11) })], {
                        height: 44,
                        dismissOnSelect: false,
                    }),
                );

                // Creates Message Subject and Body Row
                tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(msg.messageBody, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.body() })], { height: fpClass.tables.getRowHeightByTxtLength(msg.messageBody), dismissOnSelect: false }));
            }
        } else {
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createTextCell('', undefined, { align: 'left', widthWeight: 20 }),
                        await fpClass.tables.createTextCell(`${msgs.length} Messages(s)`, undefined, { align: 'center', widthWeight: 60, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title2() }),
                        await fpClass.tables.createTextCell('', undefined, { align: 'right', widthWeight: 20 }),
                    ],
                    { height: 44, dismissOnSelect: false },
                ),
            );
            tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(fpClass.statics.textMap().errorMessages.noMessages, undefined, { align: 'left', widthWeight: 1, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title3() })], { height: 44, dismissOnSelect: false }));
        }
        await fpClass.tables.generateTableMenu('messages', tableRows, false, isPhone, update);
    } catch (e) {
        console.error(`generateMessagesTable() error: ${e}`);
    }
}

function getChangeLabelColorAndNameByType(type) {
    switch (type) {
        case 'added':
            return { name: 'Added', color: new Color('#008200') };
        case 'updated':
            return { name: 'Updated', color: new Color('#FF6700') };
        case 'removed':
            return { name: 'Removed', color: new Color('#FF0000') };
        case 'fixed':
            return { name: 'Fixed', color: new Color('#b605fc') };
        default:
            return { name: '', color: new Color(fpClass.statics.colorMap.textColor1) };
    }
}

async function generateRecentChangesTable() {
    let changes = changelog[SCRIPT_VERSION];
    let tableRows = [];
    if (changes && (changes.updated.length || changes.added.length || changes.removed.length || changes.fixed.length)) {
        let verTs = new Date(Date.parse(SCRIPT_TS));
        tableRows.push(
            await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`${SCRIPT_VERSION} Changes`, undefined, { align: 'center', widthWeight: 100, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title1() })], {
                height: 50,
                isHeader: true,
                dismissOnSelect: false,
            }),
        );
        for (const [i, type] of ['added', 'fixed', 'updated', 'removed'].entries()) {
            if (changes[type].length) {
                console.log(`(Whats New Table) ${type} changes: ${changes[type].length}`);
                let { name, color } = getChangeLabelColorAndNameByType(type);
                tableRows.push(
                    await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`${name}`, undefined, { align: 'left', widthWeight: 100, titleColor: color, titleFont: Font.title2() })], {
                        height: 30,
                        dismissOnSelect: false,
                    }),
                );
                for (const [index, change] of changes[type].entries()) {
                    console.log(`(Whats New Table) ${type} change: ${change}`);
                    let rowH = Math.ceil(change.length / 70) * (65 / 2);
                    tableRows.push(
                        await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`\u2022 ${change}`, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.body() })], {
                            height: rowH < 40 ? 40 : rowH,
                            dismissOnSelect: false,
                        }),
                    );
                }
            }
        }
    } else {
        tableRows.push(await fpClass.tables.createTableRow([await fpClass.tables.createTextCell('No Change info found for the current version...', undefined, { align: 'left', widthWeight: 1, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title3() })], { height: 44, dismissOnSelect: false }));
    }

    await fpClass.tables.generateTableMenu('recentChanges', tableRows, false, false);
}

async function widgetStyleSelector() {
    let widgetStyle = await fpClass.kc.getWidgetStyle();
    // console.log(`(Widget Style Selector) Current widget style: ${widgetStyle} | Size: ${size}`);
    let tableRows = [];
    tableRows.push(
        await fpClass.tables.createTableRow(
            [
                await fpClass.tables.createTextCell(`Widget Styles`, `This page will show an example of each widget size and type\nTap on type to set it.`, {
                    align: 'center',
                    widthWeight: 1,
                    dismissOnTap: false,
                    titleColor: new Color(fpClass.statics.colorMap.textColor1),
                    titleFont: Font.title1(),
                    subtitleColor: Color.lightGray(),
                    subtitleFont: Font.mediumSystemFont(11),
                }),
            ],
            {
                height: 70,
                dismissOnSelect: false,
            },
        ),
    );
    for (const [i, size] of ['small', 'medium'].entries()) {
        tableRows.push(
            await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(`${fpClass.utils.capitalizeStr(size)}`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.title3() })], {
                height: 30,
                isHeader: true,
                dismissOnSelect: false,
            }),
        );
        for (const [i, style] of ['simple', 'detailed'].entries()) {
            // console.log(`Style: ${style} | Image: ${size}_${style}.png`);
            tableRows.push(
                await fpClass.tables.createTableRow(
                    [
                        await fpClass.tables.createTextCell(`(${fpClass.utils.capitalizeStr(style)})`, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false, titleColor: new Color(fpClass.statics.colorMap.textColor1), titleFont: Font.subheadline() }),
                        await fpClass.tables.createImageCell(await fpClass.files.getImage(`${size}_${style}.png`), { align: 'center', widthWeight: 60 }),
                        await fpClass.tables.createTextCell(``, undefined, { align: 'center', widthWeight: 20, dismissOnTap: false }),
                    ],
                    {
                        height: 150,
                        dismissOnSelect: true,
                        backgroundColor: widgetStyle === style ? Color.lightGray() : undefined,
                        onSelect: async () => {
                            console.log(`Setting WidgetStyle to ${style}`);
                            await fpClass.kc.setWidgetStyle(style);
                            widgetStyleSelector(size);
                        },
                    },
                ),
            );
        }
        tableRows.push(
            await fpClass.tables.createTableRow([await fpClass.tables.createTextCell(``, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false })], {
                height: 30,
                dismissOnSelect: false,
            }),
        );
    }

    await fpClass.tables.generateTableMenu('widgetStyles', tableRows, false, false);
}