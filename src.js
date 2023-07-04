function getPersons(){
    return document.getElementById('full-table').rows[0].cells.length-4;
}
function getItems(){
    return document.getElementById("full-table").rows.length-2;
}
function setActionListeners(){
    var checkboxes = document.querySelectorAll(".person-involved");
    checkboxes.forEach(element => {
        element.addEventListener("change", recalc)
    });
    var names = document.querySelectorAll(".persons-row");
    names.forEach(element => {
        element.addEventListener("onClick", rename)
    });
    var selectalls = document.querySelectorAll(".all");
    selectalls.forEach(element => {
        element.addEventListener("change", selectAll)
    });
    //var qtysplits = document.querySelectorAll(".qty");
    //qtysplits.forEach(element => {
    //    element.addEventListener("change", splitByQty)
    //});
}
function ready(){
    setActionListeners();

    var prices = document.querySelectorAll(".price");
    var totalPrice = 0.0;
    prices.forEach(element => {
        totalPrice = totalPrice+parseFloat(element.innerHTML);
    })
    document.getElementById("totalPrice").innerHTML = totalPrice; 
    importData();
}
function recalc(){
    //console.log("recalc");
    n_items=getItems();
    n_persons=getPersons();
    person_totals = new Map();

    //initialize totals for each person
    for (let p=0;p<=n_persons;p++){
        person_totals[p]=0.0
    }
    
    //loop thru all items
    for (let i=1;i<=n_items;i++){
        let item_class="i"+i.toString();
        let item_price = parseFloat(document.getElementsByClassName("price"+i.toString())[0].innerHTML);
        let n_divisions = 0;

        
        let isQty = document.getElementById("qtysplit"+i.toString()).checked;
        if (isQty===false){
            //if this is a straight split

            //get number of people involved
            for (let j=1;j<=n_persons;j++){
                let person_class = "p"+j.toString();
                if (document.getElementsByClassName(person_class+item_class)[0].checked == true){
                    n_divisions+=1;
                }
            }
            if (n_divisions===0){
                person_totals[0]=person_totals[0]+item_price;
            }
            //if multiple people involved, divide total price by n_divisions and add to person totals
            else{
                
                for (let j=1;j<=n_persons;j++){
                    let person_class = "p"+j.toString();
                    if (document.getElementsByClassName(person_class+item_class)[0].checked == true){
                        person_totals[j]=(Number.parseFloat(person_totals[j]) + Number.parseFloat(item_price/n_divisions)).toFixed(2);
               }
            }
            }
        }
        else{
            //if this is a by-quantity split

            //portion * each person's quantity share is going to be their total amount for that item
            let portion = item_price / document.getElementById("qtysplittotal"+i.toString()).value
            //console.log("portion="+ portion)
            
            for (let j=1;j<=n_persons;j++){
                let person_class = "p"+j.toString();
                let person_share = Number.parseFloat(portion*document.getElementById("qtysplit"+item_class+person_class).value)
                console.log("person share="+person_share)
                console.log("prev total"+j+"="+person_totals[j])
                person_totals[j] = Number.parseFloat((Number.parseFloat(person_totals[j]) + person_share)).toFixed(2);
                console.log("person"+j+"total ="+person_totals[j]);
            }
        }
        
        //populate totals row
        for (let i=1;i<=n_persons;i++){
            document.getElementById("p"+i.toString()+"total").innerHTML=person_totals[i];
        }
    }
    //populate unaccounted amount field
    document.getElementById("rem-total").value = Number.parseFloat(person_totals[0].toFixed(2));
}
function addPerson(){
    indexofnewperson = getPersons()+1
    classofnewperson="p"+indexofnewperson.toString();
    rows = document.querySelectorAll(".items-row");
    rows.forEach((element, i) => {
        const input=document.createElement("input");
        input.setAttribute('type','checkbox');
        input.setAttribute('class','person-involved '+classofnewperson+'i'+(i+1).toString() +" i"+(i+1).toString());
        const cell= document.createElement("td");
        cell.appendChild(input);
        element.appendChild(cell);
    })

    rows = document.querySelectorAll(".persons-row");
    rows.forEach(element => {
        const cell = document.createElement("th");
        cell.setAttribute('id', 'p'+indexofnewperson);
        cell.setAttribute('onClick', 'rename()');
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
function rename(dorename){
    document.getElementById('add-person').disabled=true;
    var npersons = getPersons();
    if (dorename==1){
        //console.log("Renaming...");
        document.getElementById("rename").value = "Done Renaming";
        for (let i=1;i<=npersons;i++){
            let element = document.querySelectorAll("#p"+i.toString())[0];
            const input=document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("id", "p"+i.toString()+"newname");
            element.appendChild(input);
        }
        document.getElementById("rename").setAttribute("onclick", "rename(0)");
    }
    else{
        //console.log("done renaming");
        document.getElementById("rename").value = "Rename";
        for (let i=1;i<=npersons;i++){
            let newnametb = document.querySelectorAll("#p"+i.toString()+"newname")[0];
            let newname = newnametb.value;
            if (newname.split(" ").join("") === ""){
                newname = document.getElementById("p"+i.toString()).innerText;
            }
            document.querySelectorAll("#p"+i.toString())[0].innerHTML = newname;
            newnametb.remove();
        }
        document.getElementById("rename").setAttribute("onclick", "rename(1)");
    }
    document.getElementById('add-person').disabled=false;
}
function importData(){
    var i = 1;
    var total = 0;
    fetch("./items.json")
        .then(response => {return response.json();})
        .then(data => {
            //console.log(data);
            for(let key in data){
                if (data.hasOwnProperty(key) && key!="ORDER TOTAL"){
                    //console.log(key+" : "+data[key]);
                    var table = document.getElementById("full-table");
                    var row = table.insertRow(table.rows.length-1);
                    row.setAttribute('class', 'items-row');
                    var itemname = row.insertCell(0);
                    var itemprice = row.insertCell(1);
                    itemprice.setAttribute('class', 'price'+i.toString());
                    var allin = row.insertCell(2);
                    var qtysplit = row.insertCell(3);
                    var person = row.insertCell(4);
                    itemname.innerHTML = key;
                    itemprice.innerHTML = data[key];
                    qtysplit.innerHTML = "<input type='checkbox' id='qtysplit"+i.toString()+"' class='qty' onclick=splitByQty("+i.toString()+",true)> <input type='number' size=2 id='qtysplittotal"+i.toString()+"' class='qtytotal' disabled=true >";
                    allin.innerHTML = "<input type='checkbox' id='allin"+i.toString()+"' class='all' >";
                    person.innerHTML = "<input type='checkbox' class='person-involved p1i"+i.toString()+" i"+i.toString()+"' >";
                    i++;
                }
                if (data.hasOwnProperty(key) && key=="ORDER TOTAL"){
                    document.getElementById('totalPrice').innerHTML = data[key];
                }
            }
            setActionListeners();
            document.getElementById("add-bill").disabled=true;
            document.getElementById("add-person").disabled=false;
        });
    importQuantities();
}
function importQuantities(){
    let i=1;
    fetch('./quantities.json')
    .then(response =>{return response.json();})
    .then(data => {
        for(let key in data){
            document.getElementById("qtysplittotal"+i.toString()).value = data[key];
            i=i+1;
        }
        setActionListeners();
    })
}
function selectAll(){
    var n_items = getItems();
    for(let i=1;i<=n_items;i++){
        var areallin = document.getElementById("allin"+i.toString()).checked;
        if (areallin === true){
            let allpersonsinitem = document.getElementsByClassName("i"+i.toString());
            for (let j=0;j<allpersonsinitem.length;j++){
                allpersonsinitem[j].checked=true;
            }
        }
    }
    recalc();
}
function splitByQty(item_number, make_qty){
    n_items=getItems();
    n_persons=getPersons();

    //if the splitbyquantity checkbox is checked
    if (make_qty===true){

        //disable everyone involved checkbox
        document.getElementById('allin'+item_number.toString()).checked=false;
        document.getElementById('allin'+item_number.toString()).disabled=true;

        //disabled all checkboxes indicating a person's involvement
        var tobedisabled = document.querySelectorAll('.i'+item_number.toString());
        tobedisabled.forEach(element =>{
            element.checked=false;
            element.disabled=true;
        })

        //enable total quantity text input
        //document.getElementById('qtysplittotal'+item_number.toString()).disabled = false;
        //modify action listener
        document.getElementById('qtysplit'+item_number.toString()).setAttribute('onclick', 'splitByQty('+item_number.toString()+', false)')

        //add textboxes to all persons in that item  
        personitems = document.querySelectorAll('.i'+item_number);
        personitems.forEach((element,i) => {
            const input = document.createElement('input');
            input.setAttribute('type','number');
            input.setAttribute('class','qtysplits'+item_number.toString());
            input.setAttribute('id','qtyspliti'+item_number.toString()+"p"+(i+1).toString());
            input.setAttribute('onchange','recalc()');
            input.setAttribute('min','0');
            input.setAttribute('max',document.getElementById("qtysplittotal"+(i+1).toString()).value);
            element.parentNode.insertBefore(input, element.nextSibling);
        });
           
    }
    //if the splitbyqty checkbox is unchecked
    else{

        //enable all flat involvement checkboxes
        document.getElementById('allin'+item_number.toString()).disabled=false;
        var tobeenabled = document.querySelectorAll('.i'+item_number.toString());
        tobeenabled.forEach(element =>{
            element.disabled=false;
        })
        //delete all individual quantity text inputs
        var tobedeleted = document.querySelectorAll('.qtysplits'+item_number.toString());
        tobedeleted.forEach(element =>{
            element.remove();
        })

        //reset total qty text input
        document.getElementById('qtysplittotal'+item_number.toString()).innerHTML = "";
        document.getElementById('qtysplittotal'+item_number.toString()).disabled = true;

        //modify action listener
        document.getElementById('qtysplit'+item_number.toString()).setAttribute('onclick', 'splitByQty('+item_number.toString()+', true)')
    }
    recalc();
}