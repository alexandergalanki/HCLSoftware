function openModal() {
  document.getElementById("customerModal").style.display = "block";
}

function openMonthModal() {
  document.getElementById("monthModal").style.display = "block";
}

window.onclick = function(event) {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
};

function updateTotal(input) {
  const row = input.closest("tr");
  let total = 0;
  row.querySelectorAll("input.cell-input:not([readonly])").forEach(cell => {
    const val = parseInt(cell.value);
    if (!isNaN(val) && val >= 0) total += val;
  });
  const totalCell = row.querySelector("input.cell-input[readonly]");
  totalCell.value = total;
}

function addCustomerToLastTable() {
  const name = document.getElementById("customerName").value.trim();
  const type = document.getElementById("projectType").value;
  if (!name) return alert("Please enter a customer name.");

  const tables = document.querySelectorAll(".month-table");
  if (tables.length === 0) return alert("Please add a month first.");

  const lastTable = tables[tables.length - 1].querySelector("table");
  const newRow = lastTable.insertRow(-1);

  const cell1 = newRow.insertCell(0);
  cell1.innerText = `${name} (${type})`;

  for (let i = 0; i < 12; i++) {
    const cell = newRow.insertCell(i + 1);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input";
    input.pattern = "\\d*";
    input.inputMode = "numeric";
    input.oninput = () => updateTotal(input);
    cell.appendChild(input);
  }

  const totalCell = newRow.insertCell(13);
  const totalInput = document.createElement("input");
  totalInput.type = "text";
  totalInput.className = "cell-input";
  totalInput.value = "0";
  totalInput.readOnly = true;
  totalCell.appendChild(totalInput);

  document.getElementById("customerModal").style.display = "none";
  document.getElementById("customerName").value = "";
}

function addNewMonth() {
  const month = document.getElementById("monthName").value.trim();
  if (!month) return alert("Please enter a month name.");

  const container = document.getElementById("tablesContainer");
  const wrapper = document.createElement("div");
  wrapper.className = "month-table";

  const heading = document.createElement("h3");
  heading.textContent = `Weekly Ticket Data - ${month}`;

  const table = document.createElement("table");
  table.innerHTML = `
    <tr class="header-section">
      <th rowspan="2">Customer Name</th>
      <th colspan="3">W1</th>
      <th colspan="3">W2</th>
      <th colspan="3">W3</th>
      <th colspan="3">W4</th>
      <th rowspan="2">Total Count</th>
    </tr>
    <tr>
      <th>In-Progress</th><th>Open</th><th>Closed</th>
      <th>In-Progress</th><th>Open</th><th>Closed</th>
      <th>In-Progress</th><th>Open</th><th>Closed</th>
      <th>In-Progress</th><th>Open</th><th>Closed</th>
    </tr>
  `;

  wrapper.appendChild(heading);
  wrapper.appendChild(table);
  container.appendChild(wrapper);

  document.getElementById("monthModal").style.display = "none";
  document.getElementById("monthName").value = "";
}

// Auto-load one initial month
window.onload = function () {
  document.getElementById("monthName").value = "July 24";
  addNewMonth();
};

// Export to PDF
async function exportToPDF() {
  const tablesContainer = document.getElementById("tablesContainer");
  if (!tablesContainer) return;

  const { jsPDF } = window.jspdf;

  const canvas = await html2canvas(tablesContainer, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  if (pdfHeight <= pdf.internal.pageSize.getHeight()) {
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
  } else {
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalPages = Math.ceil(pdfHeight / pageHeight);

    for (let i = 0; i < totalPages; i++) {
      const sourceY = i * canvas.height / totalPages;
      const pageCanvas = document.createElement("canvas");
      const pageHeightPx = canvas.height / totalPages;

      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      const context = pageCanvas.getContext("2d");
      context.drawImage(canvas, 0, sourceY, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx);

      const pageData = pageCanvas.toDataURL("image/png");

      if (i > 0) pdf.addPage();
      pdf.addImage(pageData, "PNG", 0, 10, pdfWidth, (pageHeightPx * pdfWidth) / canvas.width);
    }
  }

  pdf.save("Ticket_Data.pdf");
}