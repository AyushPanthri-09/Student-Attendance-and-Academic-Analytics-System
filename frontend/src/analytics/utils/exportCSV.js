export const exportCSV = (data, filename = "analytics.csv") => {

  let csv = "";

  const headers = Object.keys(data[0]);
  csv += headers.join(",") + "\n";

  data.forEach(row => {
    csv += Object.values(row).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  link.click();
};