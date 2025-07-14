function saveAllTables() {
  const tables = document.querySelectorAll(".month-table");
  const allData = [];

  tables.forEach(tableWrapper => {
    const month = tableWrapper.querySelector("h3").innerText.replace("Weekly Ticket Data - ", "");
    const rows = tableWrapper.querySelectorAll("table tr:not(.header-section):not(:nth-child(2))");
    const entries = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      const customerInfo = cells[0].innerText;
      const [customer, typeWithParens] = customerInfo.split(" (");
      const type = typeWithParens.replace(")", "");

      const weeks = {};
      let total = 0;

      for (let i = 1; i < cells.length - 1; i++) {
        const weekIndex = Math.floor((i - 1) / 3);
        const weekName = "W" + (weekIndex + 1);
        const fieldType = ["In-Progress", "Open", "Closed"][(i - 1) % 3];
        const input = cells[i].querySelector("input");
        const value = parseInt(input.value) || 0;

        if (!weeks[weekName]) weeks[weekName] = {};
        weeks[weekName][fieldType] = value;
        total += value;
      }

      entries.push({ customer: customer.trim(), type: type.trim(), weeks, total });
    });

    allData.push({ month, entries });
  });

  fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: allData })
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to save data");
      alert("Data saved successfully!");
    })
    .catch(err => alert("Error saving data: " + err.message));
}
