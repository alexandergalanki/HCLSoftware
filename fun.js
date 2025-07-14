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


window.addEventListener('DOMContentLoaded', () => {
  fetch('/api/tickets')
    .then(res => res.json())
    .then(data => {
      window.exportData = data;

      
      if (!data.length) {
        console.warn("No data found.");
        return;
      }

      const tablesContainer = document.getElementById('tablesContainer');
      if (!tablesContainer) {
        console.error("tablesContainer not found in HTML.");
        return;
      }

      const allMonths = data;

      allMonths.forEach(monthData => {
        console.log("Rendering month:", monthData.month);
        const monthTableWrapper = document.createElement('div');
        monthTableWrapper.className = 'month-table';

        const header = document.createElement('h3');
        header.innerText = 'Weekly Ticket Data - ' + monthData.month;
        monthTableWrapper.appendChild(header);

        const table = document.createElement('table');

        
        const headerRow1 = table.insertRow();
        headerRow1.className = 'header-section';
        const customerHeader = document.createElement('th');
        customerHeader.rowSpan = 2;
        customerHeader.innerText = 'Customer Name';
        headerRow1.appendChild(customerHeader);

        ['W1', 'W2', 'W3', 'W4'].forEach((week) => {
          const weekHeader = document.createElement('th');
          weekHeader.colSpan = 3;
          weekHeader.innerText = week;
          headerRow1.appendChild(weekHeader);
        });

        const totalHeader = document.createElement('th');
        totalHeader.rowSpan = 2;
        totalHeader.innerText = 'Total Count';
        headerRow1.appendChild(totalHeader);

        const headerRow2 = table.insertRow();
        for (let i = 0; i < 4; i++) {
          ['In-Progress', 'Open', 'Closed'].forEach(type => {
            const subHeader = document.createElement('th');
            subHeader.innerText = type;
            headerRow2.appendChild(subHeader);
          });
        }

       
        monthData.entries.forEach(entry => {
          console.log("Rendering entry:", entry);
          const row = table.insertRow();
          const customerCell = row.insertCell();
          customerCell.innerText = `${entry.customer} (${entry.type})`;

          ['W1', 'W2', 'W3', 'W4'].forEach(week => {
            ['In-Progress', 'Open', 'Closed'].forEach(type => {
              const cell = row.insertCell();
              const input = document.createElement('input');
              input.type = 'text';
              input.className = 'cell-input';
              input.pattern = '\\d*';
              input.inputMode = 'numeric';
              input.value = entry.weeks?.[week]?.[type] || 0;
              input.oninput = () => updateTotal(input);
              cell.appendChild(input);
            });
          });

          const totalCell = row.insertCell();
          const totalInput = document.createElement('input');
          totalInput.type = 'text';
          totalInput.className = 'cell-input';
          totalInput.readOnly = true;
          totalInput.value = entry.total || 0;
          totalCell.appendChild(totalInput);
        });

        monthTableWrapper.appendChild(table);
        tablesContainer.appendChild(monthTableWrapper);
        console.log("Appended table for:", monthData.month);
      });
    })
    .catch(err => console.error('Failed to load saved ticket data:', err));
});
