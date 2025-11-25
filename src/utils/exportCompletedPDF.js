import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const exportCompletedPDF = async (resolvedList = []) => {
  try {
    // Create table rows
    const rows = resolvedList
      .map(
        (item) => `
        <tr>
          <td>${item.modemId}</td>
          <td>${item.status}</td>
          <td>${item.resolvedAt}</td>
          <td>${item.location}</td>
        </tr>`
      )
      .join("");

    // Build HTML
    const html = `
      <html>
        <body style="font-family: 'Manrope-Regular'; padding: 20px;">
          <h2 style="text-align: center;">Completed Field Activities Report</h2>

          <table style="width:100%; border-collapse: collapse;" border="1">
            <thead>
              <tr style="background:#f0f0f0;">
                <th>Modem ID</th>
                <th>Status</th>
                <th>Resolved At</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Share PDF via native share dialog
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return { success: false, error: "Sharing not available on this device" };
    }

    await Sharing.shareAsync(uri);

    return { success: true, path: uri };
  } catch (error) {
    console.log("PDF Error:", error);
    return { success: false, error };
  }
};
