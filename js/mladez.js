/**
* @Author: Jan Brejcha <janbrejcha>
* @Date:   2016-05-05T08:16:31+02:00
* @Email:  ibrejcha@fit.vutbr.cz, brejchaja@gmail.com
* @Project: static system IS51
* @Last modified by:   janbrejcha
* @Last modified time: 2016-05-06T20:04:56+02:00
*/


var Mladez = function(){
    addEventListener("load", this.bodyLoadCallback.bind(this))
    window.addEventListener("hashchange", this.hashChangeCallback.bind(this));
};

Mladez.prototype.hashChangeCallback = function(){
    var projectsTableParent = document.getElementById("projects_table");
    if (projectsTableParent.firstChild != null){
        projectsTableParent.removeChild(projectsTableParent.firstChild);
    }
    if (location.hash == "#projects"){
        this.createProjectsTable(projectsTableParent);
    }
}

Mladez.prototype.bodyLoadCallback = function(){
    this._dataProvider = new DataProvider();
    var projectsTableParent = document.getElementById("projects_table");
    this.createProjectsTable(projectsTableParent);
};

Mladez.prototype.createProjectsTable = function(tableParent){
    var projects = this._dataProvider._projectJson.mladez.prj_projekty;
    var tableBuilder = new TableBuilder(tableParent, "projects_tab1");

    tableBuilder.addRow([   document.createTextNode("pdf"),
                            document.createTextNode("evid"),
                            document.createTextNode("ID projektu"),
                            document.createTextNode("název projektu"),
                            document.createTextNode("Podávající NNO"),
                            document.createTextNode("IČ"),
                            document.createTextNode("Dotační program")], true);
    for (i in projects){
        var p = projects[i];
        var pdf = document.createElement("a");
        pdf.setAttribute("href", "projekty/" + p.program_uid + "/" + p.projekt_id + "/priloha.pdf");
        pdf.innerHTML = "projekt.pdf"
        var row_arr = [ pdf,
                        document.createTextNode(p.evid),
                        document.createTextNode(p.projekt_id),
                        document.createTextNode(p.projekt_nazev),
                        document.createTextNode(p.nno_nazev),
                        document.createTextNode(p.ic),
                        document.createTextNode(p.program_nazev)];
        tableBuilder.addRow(row_arr);
    }
    $('#projects_tab1').DataTable();
}

var DataProvider = function(){
    this._projectData = document.getElementById("projects_data").contentDocument.getElementsByTagName("pre")[0].innerHTML;
    this._projectJson = JSON.parse(this._projectData);
};

/**
 * Table builder builds a html table inside given root node.
 * @param  html_node rootNode the root node inside which the table is created.
 * @return TableBuilder instance.
 */
var TableBuilder = function(rootNode, id){
    var class_attr = "table table-striped table-hover";
    this._table = document.createElement("table");
    this._table.setAttribute("class", class_attr);
    this._table.setAttribute("id", id)
    this._thead = document.createElement("thead");
    this._tbody = document.createElement("tbody");
    this._table.appendChild(this._thead);
    this._table.appendChild(this._tbody);
    rootNode.appendChild(this._table);
}


/**
 * Adds row into the table.
 * @param  Array row    array containing the elements of the row.
 * @param  bool  isHeader   indicates, if this row should be header row (<th>).
 * @return void
 */
TableBuilder.prototype.addRow = function(row){
    this.addRow(row, false);
}

TableBuilder.prototype.addRow = function(row, isHeader){
    var tagName = isHeader ? "th" : "td";
    var tr = document.createElement("tr");
    for (i in row){
        var td = document.createElement(tagName);
        td.appendChild(row[i]);
        tr.appendChild(td);
    }
    if (isHeader){
        this._thead.appendChild(tr);
    }
    else{
        this._tbody.appendChild(tr);
    }
}


var mladez = new Mladez();
