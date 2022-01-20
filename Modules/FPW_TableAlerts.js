module.exports = class FPW_TableAlerts {
    constructor(FPW) {
        this.FPW = FPW;
        this.SCRIPT_ID = FPW.SCRIPT_ID;
        this.widgetConfig = FPW.widgetConfig;
        this.Kc = FPW.Kc;
        this.FordRequests = FPW.FordRequests;
        this.Alerts = FPW.Alerts;
        this.Utils = FPW.Utils;
        this.Timers = FPW.Timers;
        this.Tables = FPW.Tables;
    }

    async generateAlertsTable(vData) {
        let vhaAlerts = vData.alerts && vData.alerts.vha && vData.alerts.vha.length ? vData.alerts.vha : [];
        let otaAlerts = vData.alerts && vData.alerts.mmota && vData.alerts.mmota.length ? vData.alerts.mmota : [];

        let tableRows = [];
        if (vhaAlerts.length > 0) {
            tableRows.push(await this.Tables.createTableRow([await this.Tables.createTextCell(`Vehicle Health Alert(s)`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], { height: 20, isHeader: true, dismissOnSelect: false }));
            for (const [i, alert] of vhaAlerts.entries()) {
                let dtTS = alert.eventTimeStamp ? this.Utils.convertFordDtToLocal(alert.eventTimeStamp) : undefined;
                tableRows.push(
                    await this.Tables.createTableRow(
                        [
                            await this.Tables.createImageCell(await this.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                            await this.Tables.createTextCell(alert.activeAlertBody.headline || this.FPW.textMap().errorMessages.noData, dtTS ? this.Utils.timeDifference(dtTS) : '', {
                                align: 'left',
                                widthWeight: 93,
                                titleColor: new Color(this.Tables.getAlertColorByCode(alert.colorCode)),
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
            tableRows.push(await this.Tables.createTableRow([await this.Tables.createTextCell('', undefined, { align: 'center', widthWeight: 100 })], { height: 20, dismissOnSelect: false }));
            tableRows.push(await this.Tables.createTableRow([await this.Tables.createTextCell(`OTA Update Alerts`, undefined, { align: 'center', widthWeight: 1, dismissOnTap: false, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.title2() })], { height: 20, isHeader: true, dismissOnSelect: false }));
            for (const [i, alert] of otaAlerts.entries()) {
                let dtTS = alert.vehicleDate && alert.vehicleTime ? this.Utils.convertFordDtToLocal(`${alert.vehicleDate} ${alert.vehicleTime}`) : undefined;
                let timeDiff = dtTS ? this.Utils.timeDifference(dtTS) : '';
                let title = alert.alertIdentifier ? alert.alertIdentifier.replace('MMOTA_', '').split('_').join(' ') : undefined;

                let releaseNotes;
                if (alert.releaseNotesUrl) {
                    let locale = (await this.Kc.getSettingVal('fpLanguage')) || Device.locale().replace('_', '-');
                    releaseNotes = await this.Utils.getReleaseNotes(alert.releaseNotesUrl, locale);
                }
                tableRows.push(
                    await this.Tables.createTableRow(
                        [
                            await this.Tables.createImageCell(await this.Files.getFPImage(`${alert.iconName}_${darkMode ? 'dark' : 'light'}.png`), { align: 'left', widthWeight: 7 }),
                            await this.Tables.createTextCell(title, timeDiff, { align: 'left', widthWeight: 93, titleColor: new Color(this.Tables.getAlertColorByCode(alert.colorCode)), titleFont: Font.headline(), subtitleColor: Color.darkGray(), subtitleFont: Font.regularSystemFont(9) }),
                        ], { height: 44, dismissOnSelect: false },
                    ),
                );

                tableRows.push(await this.Tables.createTableRow([await this.Tables.createTextCell(releaseNotes, undefined, { align: 'left', widthWeight: 100, titleColor: new Color(this.FPW.colorMap.textColor1), titleFont: Font.regularSystemFont(12) })], { height: this.Tables.getRowHeightByTxtLength(releaseNotes), dismissOnSelect: false }));
            }
        }

        await this.Tables.generateTableMenu('alerts', tableRows, false, false);
    }
};