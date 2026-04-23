import Papa from 'papaparse';
import CONFIG from './config';
import { FALLBACK_DATA } from './fallbackData';

export async function fetchDashboardData() {
  const url = CONFIG.GOOGLE_SHEET_CSV_URL;
  
  if (!url || url === "YOUR_GOOGLE_SHEET_CSV_URL_HERE") {
    console.log("Using fallback data. Configure your Google Sheet URL in src/config.js");
    return FALLBACK_DATA;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const csvText = await response.text();
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const data = parsed.data
      .filter(function(row) { return row["Status"] && String(row["Status"]).trim() !== ""; })
      .map(function(row) {
        return {
          r: String(row["Release"] || "").trim(),
          p: String(row["POD Name"] || "").trim(),
          g: String(row["Stage Gate"] || "").trim(),
          s: String(row["Status"] || "").trim(),
          sd: formatDate(row["Start Date"]),
          pd: formatDate(row["Planned Completion Date"]),
          ad: formatDate(row["Actual Completion Date"]),
          dur: row["Duration Days"] || null,
          dd: row["Delay Days"] || null,
        };
      });

    console.log("Loaded " + data.length + " rows from Google Sheets");
    return data;
  } catch (err) {
    console.error("Failed to fetch from Google Sheets, using fallback:", err);
    return FALLBACK_DATA;
  }
}

function formatDate(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    var d = new Date((val - 25569) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  if (typeof val === 'string') {
    var trimmed = val.trim();
    if (!trimmed) return null;
    var d2 = new Date(trimmed);
    if (!isNaN(d2.getTime())) {
      return d2.toISOString().slice(0, 10);
    }
  }
  return null;
}
