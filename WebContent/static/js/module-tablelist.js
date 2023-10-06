class DynamicTable {
  constructor(containerId, columns, data) {
    this.containerId = containerId;
    this.columns = columns; 
    this.data = data; 
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  handleDragStart(e) {
    let row = e.target.parentNode.parentNode; // the row (tr)
    e.dataTransfer.setData('text/plain', row.dataset.index);
    row.style.backgroundColor = '#ccc';

    // Create drag image
    let dragImage = document.createElement('table');
    let clone = row.cloneNode(true);
    clone.style.backgroundColor = '';  // Reset the background color
    dragImage.appendChild(clone);
    dragImage.style.position = 'relative';
    dragImage.style.top = '-9999px'; // Position it out of the screen
    document.body.appendChild(dragImage);

    // Set the drag image to the new table
    e.dataTransfer.setDragImage(dragImage, e.clientX, e.clientY);
}
handleDragEnd(e) {
  let row = e.target.parentNode.parentNode; // the row (tr)
  if (row.parentNode) {
    row.style.backgroundColor = '';
  }
}


  handleDragOver(e) {
    e.preventDefault();
  }

 

  handleDrop(e) {
    e.preventDefault();
    const initialIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const finalIndex = parseInt(e.currentTarget.parentNode.dataset.index, 10);

    const draggedData = this.data[initialIndex];
    this.data.splice(initialIndex, 1);
    this.data.splice(finalIndex, 0, draggedData);

    this.recalculateOrder();
    this.updateTable();
  }

  createRow(type, data, index) {
    let row = document.createElement("tr");
    row.dataset.index = index;
    row.classList.add("draggable");

    if (data.deleted) {
      row.style.backgroundColor = 'gray';
    }

    this.columns.forEach(column => {
    let cell = document.createElement("td");
    let input;

    switch(column.type) {
      case "text":
        if (column.field === "order") {  
          cell.innerText = data[column.field];

          // Create logo and set attributes
          let logo = document.createElement("img");
          logo.src = "/static/img/draggable-dots.png";
          
          // Add drag event listeners to logo
          logo.addEventListener('dragstart', () => {
            // Set a property on the cell to denote that the logo is being dragged
            cell.dataset.draggingLogo = 'true';
          }, false);

          logo.addEventListener('dragend', () => {
            // Unset the property when dragging is done
            cell.dataset.draggingLogo = 'false';
          }, false);
          
          cell.appendChild(logo);

          // Add hover event listeners to cell
          //cell.onmouseover = () => { logo.style.visibility = 'visible'; };
          //cell.onmouseout = () => { logo.style.visibility = 'hidden'; };

          // Add drag event listeners to cell
          cell.draggable = true;
          cell.addEventListener('dragstart', (e) => {
            // Prevent cell dragging unless the logo is being dragged
            if (cell.dataset.draggingLogo !== 'true') {
              e.preventDefault();
            } else {
              this.handleDragStart(e);
            }
          }, false);
          cell.addEventListener('dragend', this.handleDragEnd, false);
          cell.addEventListener('dragover', this.handleDragOver, false);
          cell.addEventListener('drop', this.handleDrop, false);
          } else {
            input = document.createElement("input");
            input.value = data[column.field];
            input.disabled = data.deleted ? true : false; 
            input.onchange = () => {
			  this.data[index][column.field] = input.value;
			  this.updateTable();
			};
            cell.appendChild(input);
          }
          break;
        case "select":
          input = document.createElement("select");
          column.values.forEach(value => {
            let optElement = document.createElement("option");
            optElement.value = value;
            optElement.text = value;
            input.add(optElement);
          });
          input.value = data[column.field];
          input.disabled = data.deleted ? true : false; 
          input.onchange = () => {
			  this.data[index][column.field] = input.value;
			  this.updateTable();
			};
          cell.appendChild(input);
          break;
      }
      row.appendChild(cell);
    });

    var actionCell = document.createElement("td");

    var insertButton = document.createElement("button");
    var insertImg = document.createElement("img");
    insertImg.src = "/static/img/add.gif";
    insertImg.style.height = '15px';
    insertImg.style.width = '15px';

    insertButton.appendChild(insertImg);
    insertButton.onclick = () => {
      this.insertRow(index);
    };
    insertButton.disabled = data.deleted ? true : false; 

    var deleteButton = document.createElement("button");
    var deleteImg = document.createElement("img"); 
    deleteImg.src = data.deleted ? "/static/img/undo.png" : "/static/img/cross_icon.png";
    deleteImg.style.height = '15px';
    deleteImg.style.width = '15px';

    deleteButton.appendChild(deleteImg);
    deleteButton.onclick = () => {
      this.deleteRow(index);
    };

    actionCell.appendChild(insertButton);
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    return row;
  }

  updateTable() {
    let tableContainer = document.getElementById(this.containerId);
    tableContainer.innerHTML = "";

    let table = document.createElement("table");

    let header = table.createTHead();
    let row = header.insertRow(0);

    this.columns.forEach(column => {
      let th = document.createElement("th");
      th.innerText = column.label;
      row.appendChild(th);
    });

    let body = table.createTBody();

    this.data.forEach((rowData, index) => {
      let row = this.createRow('default', rowData, index);
      body.appendChild(row);
    });

    tableContainer.appendChild(table);
  }

  recalculateOrder() {
    let order = 1;
    this.data.forEach((row) => {
      if (!row.deleted) {
        row.order = order++;
      } else {
        row.order = ""; // for deleted rows, set order to empty
      }
    });
  }

  insertRow(index) {
    const emptyData = this.columns.reduce((obj, column) => ({ ...obj, [column.field]: '' }), {});
    this.data.splice(index + 1, 0, emptyData);
    this.recalculateOrder(); 
    this.updateTable();
  }

	deleteRow(index) {
	
	 
	  // Check if 'type' and 'name' fields are empty or undefined.
	  let rowIsEmpty = (this.data[index].dbType === '') 
	                    && (this.data[index].name === '');
	
	  if (rowIsEmpty) {
	    // If the fields are empty or undefined, remove the row from the data array.
	    this.data.splice(index, 1);
	  } else {
	    // If the fields are not empty, mark it as deleted.
	    if (this.data[index].deleted) {
	      delete this.data[index].deleted;
	    } else {
	      this.data[index].deleted = true;
	    }
	  }
	
	  this.recalculateOrder(); 
	  this.updateTable();
}


}

let columns = [
  {label: "Order", type: "text", field: "order"},
  {label: "Type", type: "select", field: "dbType", values: ["postgres", "mysql"]},
  {label: "Name", type: "text", field: "name"}
];

let data = [
  {order: 1, dbType: "postgres", name: "first"},
  {order: 2, dbType: "mysql", name: "second"}
];

let table = new DynamicTable("table-container", columns, data);
table.updateTable();

