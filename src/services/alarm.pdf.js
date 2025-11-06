import fs from "fs/promises";
import path from "path";

export const generateAlarmProfileHtml = async (alarmData) => {
  if (!alarmData || !alarmData._id) {
    throw new Error("A valid alarm object with an _id must be provided.");
  }

  const val = (field, fallback = "") => (field ? String(field) : fallback);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  const renderVal = (text) => (text.trim() === "" ? "&nbsp;" : text);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Alarm Monitoring Services - Dealer Instructions</title>
    <style>
        body {font-family: Arial, sans-serif; font-size: 10pt; color: #000;}
        .container {max-width: 850px; margin: auto; padding: 15px;}
        .header {text-align: center; margin-bottom: 30px;}
        .header h1 {font-size: 16pt; margin-bottom: 5px; font-weight: bold;}
        .header h2 {font-size: 14pt; margin-top: 0; font-weight: bold;}
        .field-row {display: flex; flex-wrap: nowrap; gap: 25px; margin-bottom: 7px; align-items: baseline;}
        .field {display: flex; align-items: baseline; flex-grow: 1; flex-shrink: 1;}
        .field-label {font-weight: bold; white-space: nowrap; margin-right: 8px;}
        .field-value {width: 100%; border-bottom: 1.2px solid #000; padding-bottom: 2px; font-size: 9.5pt; text-indent: 4px;}
        .alarm-table {width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 9pt;}
        .alarm-table th, .alarm-table td {border: 1px solid #000; padding: 4px; text-align: center;}
        .alarm-table th {background:#f2f2f2; font-weight: bold;}
        .zone-description {text-align: left;}
        .instruction-cell {font-size: 8pt;}
        .col-partition {width: 5%;}
        .col-zone      {width: 9%;}
        .col-code      {width: 9%;}
        .col-desc      {width: 9%;}
        .col-inst      {width: 8%;}
        .partition-num {text-align: center; width: 5%; font-weight: bold;}
        .partition-desc {text-align: left; padding-left: 6px;}
        .signature-container {display: flex; justify-content: space-between; align-items: flex-end; font-size: 7pt; margin: 40px 0;}
        .signature-block {width: 45%;}
        .signature-line {border-bottom: 1px solid #000; margin-top: 40px;}
        .label {margin-bottom: 5px;}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>ALARM MONITORING SERVICES</h1>
        <h2>DEALER INSTRUCTIONS - ZONES & PARTITIONS</h2>
    </div>

    <!-- ==== FORM FIELDS ==== -->
    <div class="field-row">
        <div class="field" style="flex-basis:25%"><span class="field-label">Account #</span><span class="field-value">${renderVal(
          val(alarmData.accountNumber)
        )}</span></div>
        <div class="field" style="flex-basis:40%"><span class="field-label">Dealer Name</span><span class="field-value">${renderVal(
          val(alarmData.dealerName)
        )}</span></div>
        <div class="field" style="flex-basis:10%"><span class="field-label">Dealer Code</span><span class="field-value">${renderVal(
          val(alarmData.dealerCode)
        )}</span></div>
        <div class="field" style="flex-basis:25%"><span class="field-label">Start Date</span><span class="field-value">${renderVal(
          formatDate(alarmData.startDate)
        )}</span></div>
    </div>
    <div class="field-row"><div class="field" style="flex-basis:100%"><span class="field-label">Subscriber Name</span><span class="field-value">${renderVal(
      val(alarmData.subscriberName)
    )}</span></div></div>
    <div class="field-row">
        <div class="field" style="flex-basis:60%"><span class="field-label">Installation Address</span><span class="field-value">${renderVal(
          val(alarmData.installationAddress)
        )}</span></div>
        <div class="field" style="flex-basis:15%"><span class="field-label">City</span><span class="field-value">${renderVal(
          val(alarmData.city)
        )}</span></div>
        <div class="field" style="flex-basis:13%"><span class="field-label">State</span><span class="field-value">${renderVal(
          val(alarmData.state)
        )}</span></div>
        <div class="field" style="flex-basis:12%"><span class="field-label">Zip</span><span class="field-value">${renderVal(
          val(alarmData.zip)
        )}</span></div>
    </div>
    <div class="field-row"><div class="field" style="flex-basis:100%"><span class="field-label">Communicator Format</span><span class="field-value">${renderVal(
      val(alarmData.communicatorFormat)
    )}</span></div></div>

    <table class="alarm-table">
        <colgroup>
            <col class="col-partition"><col class="col-zone">
            <col class="col-code"><col class="col-code">
            <col class="col-desc"><col class="col-desc"><col class="col-desc"><col class="col-desc">
            <col class="col-inst"><col class="col-inst"><col class="col-inst"><col class="col-inst">
        </colgroup>
        <thead>
            <tr>
                <th rowspan="2">Partition/<br/>Area #</th>
                <th rowspan="2">Zone #</th>
                <th rowspan="2" colspan="2">Code<br/>Description</th>
                <th rowspan="2" colspan="4">Zone Description</th>
                <th colspan="4">Instructions (Use Initials Below)</th>
            </tr>
            <tr><th>1st</th><th>2nd</th><th>3rd</th><th>4th</th></tr>
        </thead>
        <tbody>
            ${(() => {
              const minRows = 10;
              let rows = "";
              const areas = alarmData.areas || [];
              for (let i = 0; i < areas.length; i++) {
                const a = areas[i];
                rows += `
                <tr>
                    <td>${renderVal(val(a.areaNumber))}</td>
                    <td>${renderVal(val(a.zoneNumber))}</td>
                    <td colspan="2">${renderVal(val(a.codeDescription))}</td>
                    <td colspan="4" class="zone-description">${renderVal(
                      val(a.zoneDescription)
                    )}</td>
                    <td class="instruction-cell">${renderVal(
                      val(a.instruction1)
                    )}</td>
                    <td class="instruction-cell">${renderVal(
                      val(a.instruction2)
                    )}</td>
                    <td class="instruction-cell">${renderVal(
                      val(a.instruction3)
                    )}</td>
                    <td class="instruction-cell">${renderVal(
                      val(a.instruction4)
                    )}</td>
                </tr>`;
              }
              for (let i = areas.length; i < minRows; i++) {
                rows += `<tr><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td><td colspan="4" class="zone-description">&nbsp;</td>
                         <td class="instruction-cell">&nbsp;</td><td class="instruction-cell">&nbsp;</td>
                         <td class="instruction-cell">&nbsp;</td><td class="instruction-cell">&nbsp;</td></tr>`;
              }
              return rows;
            })()}

            <!-- ==== PARTITION DESCRIPTIONS ==== -->
            ${(() => {
              const unique =
                alarmData.areas && Array.isArray(alarmData.areas)
                  ? [
                      ...new Set(
                        alarmData.areas
                          .map((a) => val(a.partitionAreaDescription))
                          .filter((d) => d.trim())
                      ),
                    ]
                  : [];
              const numDesc = unique.length;
              const dataRows = Math.ceil(numDesc / 2); // rows that hold the descriptions
              const totalRows = dataRows + 1; // +1 for the title row

              let title = `
                <tr style="border-top:2px solid #000;">
                    <td colspan="8" style="text-align:left;font-weight:bold;background:#f2f2f2;padding:6px;">
                        Partition/Area Descriptions (Complete an SIS for Each Partition)
                    </td>
                    <td colspan="4" rowspan="${totalRows}"
                        style="vertical-align:top;text-align:left;padding:8px;font-size:8.5pt;line-height:1.6;">
                        <div><strong>VN</strong>&nbsp;&nbsp;Verification</div>
                        <div><strong>NA</strong>&nbsp;&nbsp;Numbers Notify Authorities</div>
                        <div><strong>NC</strong>&nbsp;&nbsp;Notify Contact</div>
                        <div><strong>ND</strong>&nbsp;&nbsp;Notify Dealer</div>
                        <div><strong>NG</strong>&nbsp;&nbsp;Notify Guard</div>
                    </td>
                </tr>`;

              let body = "";
              let idx = 0;
              for (let r = 0; r < dataRows; r++) {
                body += `<tr>`;

                // ---- LEFT side ----
                if (idx < numDesc) {
                  body += `<td class="partition-num">${idx + 1}.</td>
                           <td colspan="3" class="partition-desc zone-description">${renderVal(
                             unique[idx]
                           )}</td>`;
                  idx++;
                } else {
                  body += `<td colspan="4">&nbsp;</td>`;
                }

                // ---- RIGHT side (only when there is data) ----
                if (idx < numDesc) {
                  body += `<td class="partition-num">${idx + 1}.</td>
                           <td colspan="3" class="partition-desc zone-description">${renderVal(
                             unique[idx]
                           )}</td>`;
                  idx++;
                }
                // no placeholder cells when nothing to show

                body += `</tr>`;
              }
              return title + body;
            })()}
        </tbody>
    </table>

    <div style="margin-top:20px;text-align:center;font-size:8pt;">
        <div class="signature-container">
            <div class="signature-block">
                <div class="label">ALARM MONITORING SERVICES, INC.</div>
                <div>BY:</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature-block">
                <div class="label" style="text-align:left;">DEALER</div>
                <div class="signature-line"></div>
            </div>
        </div>
    </div>
</div>
</body>
</html>`;
  return htmlContent;
};
