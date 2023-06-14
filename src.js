function getPersons(){
    return document.getElementById('full-table').rows[0].cells.length-2;
}

function getItems(){
    return document.getElementById("full-table").rows.length-2;
}

function setActionListeners(){
    var checkboxes = document.querySelectorAll(".person-involved");
    checkboxes.forEach(element => {
        element.addEventListener("change", recalc)
    });
}
function ready(){
    var checkboxes = document.querySelectorAll(".person-involved");
    checkboxes.forEach(element => {
        element.addEventListener("change", recalc)
    });

    var prices = document.querySelectorAll(".price");
    var totalPrice = 0.0;
    prices.forEach(element => {
        totalPrice = totalPrice+parseFloat(element.innerHTML);
    })
    document.getElementById("totalPrice").innerHTML = totalPrice; 
}
function recalc(){
    n_items=getItems();
    n_persons=getPersons();
    person_totals = new Map();
    for (let p=0;p<=n_persons;p++){
        person_totals[p]=0.0
    }
    
    for (let i=1;i<=n_items;i++){
        let item_class="i"+i.toString();
        //console.log(item_class);
        let item_price = parseFloat(document.getElementsByClassName(item_class)[0].innerHTML);
        //console.log(item_price);
        let n_divisions = 0;
        for (let j=1;j<=n_persons;j++){
            let person_class = "p"+j.toString();
            //console.log("class="+person_class+item_class);
            if (document.getElementsByClassName(person_class+item_class)[0].checked == true){
                n_divisions+=1;
            }
        }
        //console.log("numdiv="+n_divisions);
        if (n_divisions===0){
            person_totals[0]=person_totals[0]+item_price;
        }
        else{
            for (let j=1;j<=n_persons;j++){
                let person_class = "p"+j.toString();
                if (document.getElementsByClassName(person_class+item_class)[0].checked == true){
                    person_totals[j]=person_totals[j]+item_price/n_divisions;
                    //document.getElementById("p"+item_class+"total").innerHTML = document.getElementById("p"+item_class+"total").innerHTML.parseFloat + item_price/n_divisions;
           }
        }
        }
        
        for (let i=1;i<=n_persons;i++){
            //console.log("p"+i.toString()+"total");
            document.getElementById("p"+i.toString()+"total").innerHTML=person_totals[i];
        }
    }
    document.getElementById("rem-total").value = person_totals[0].toString();
}
function addPerson(){
    indexofnewperson = getPersons()+1
    classofnewperson="p"+indexofnewperson.toString();
    rows = document.querySelectorAll(".items-row");
    rows.forEach((element, i) => {
        const input=document.createElement("input");
        input.setAttribute('type','checkbox');
        input.setAttribute('class','person-involved '+classofnewperson+'i'+(i+1).toString());
        const cell= document.createElement("td");
        cell.appendChild(input);
        element.appendChild(cell);
    })

    rows = document.querySelectorAll(".persons-row");
    rows.forEach(element => {
        const cell = document.createElement("th");
        cell.innerHTML = "Person "+indexofnewperson.toString();
        element.appendChild(cell);
    })

    rows = document.querySelectorAll(".totals-row");
    rows.forEach(element => {
        const cell = document.createElement("td");
        cell.setAttribute('id', classofnewperson+"total");
        cell.innerHTML = 0;
        element.appendChild(cell);
    })
    setActionListeners();
    recalc();
}

function loadFile(){
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _ => {
    // you can use this method to get file and perform respective operations
            let files = Array.from(input.files);
            console.log(files);
        };
    input.click();
    $.ajax({
        type: "POST",
        url: "/parse.py",
        data: { param: files },
        success: callbackFunc
    });
}
function callbackFunc(response) {
    importData();
}

function importData(){
    var i = 1;
    fetch("./items.json")
        .then(response => {return response.json();})
        .then(data => {
            for(let key in data){
                if (data.hasOwnProperty(key) && key!="ORDER TOTAL"){
                    //console.log(key+" : "+data[key]);
                    var table = document.getElementById("full-table");
                    var row = table.insertRow(table.rows.length-1);
                    row.setAttribute('class', 'items-row');
                    var itemname = row.insertCell(0);
                    var itemprice = row.insertCell(1);
                    itemprice.setAttribute('class', 'price i'+i.toString());
                    var person = row.insertCell(2);
                    itemname.innerHTML = key;
                    itemprice.innerHTML = data[key];
                    person.innerHTML = "<input type='checkbox' class='person-involved p1i"+i.toString()+"' >";
                    i++;
                }
            }
            setActionListeners();
            document.getElementById("add-bill").disabled=true;
            document.getElementById("add-person").disabled=false;
        });
}