let allFilters = document.querySelectorAll(".filter");
let openModal = document.querySelector(".open-modal");
let closeModal = document.querySelector(".close-modal");
let allFilterClasses = ["yellow", "red", "green", "blue", "black"];
let ticketsContainer = document.querySelector(".ticket-container");
let myDB = window.localStorage ;

let ticketModalOpen = false;
let isTextTyped = false;

openModal.addEventListener("click", openTicketModal);
closeModal.addEventListener("click", closeTicketModal);

for(let i = 0; i<allFilters.length; i++){
    allFilters[i].addEventListener("click", selectFilter);
}

function selectFilter(e){
    if(e.target.classList.contains("active-filter")){
        e.target.classList.remove("active-filter");
        ticketsContainer.innerHTML ="";
        loadTickets();
    }else{
        if(document.querySelector(".active-filter")){
            document.querySelector(".active-filter").classList.remove("active-filter");
        }
        e.target.classList.add("active-filter");
        ticketsContainer.innerHTML = "";
        let filterClicked = e.target.classList[1];
        loadSelectedTickets(filterClicked);
    }
}

function loadSelectedTickets(filter){
    let allTickets = myDB.getItem("allTickets");
    if(allTickets){
        allTickets = JSON.parse(allTickets);
        for(let i = 0; i<allTickets.length; i++){
            let ticketobj = allTickets[i];
            if(ticketobj.ticketFilter==filter){
                appendTicket(ticketobj);
            }
        }
    }
}

function loadTickets(){
    let allTickets = localStorage.getItem("allTickets");
    if(allTickets){
        allTickets = JSON.parse(allTickets);
        for(let i = 0; i<allTickets.length; i++){
            let ticketobj = allTickets[i];
                appendTicket(ticketobj);
        }
    }
}

loadTickets();

function openTicketModal(e){
   if(ticketModalOpen){
       return;
   }
//   div created
   let ticketModal = document.createElement("div");
//    <div class="ticket-modal"></div>
   ticketModal.classList.add("ticket-modal");
   //to get the inner html content
   ticketModal.innerHTML=`
   <div class="ticket-text" contenteditable="true">
        Enter your text
     </div>
     <div class="ticket-filters" >
        <div class="ticket-filter2 red selected-filter"></div>
        <div class="ticket-filter2 yellow"></div>
        <div class="ticket-filter2 green"></div>
        <div class="ticket-filter2 blue"></div>
        <div class="ticket-filter2 black"></div>
    </div>

   `;
   //to visualize the html over body
   document.querySelector("body").append(ticketModal);
   ticketModalOpen = true;
   isTextTyped = true;

   let ticketTextDiv = ticketModal.querySelector(".ticket-text");

   ticketTextDiv.addEventListener("keypress", handleKeyPress);

   let ticketFilters = ticketModal.querySelectorAll(".ticket-filter2");
   
   for(let i = 0; i<ticketFilters.length; i++){
    ticketFilters[i].addEventListener("click", function(e){
        if(e.target.classList.contains("selected-filter")){
            return;
        }
        document.querySelector(".selected-filter").classList.remove("selected-filter");
        e.target.classList.add("selected-filter");
    });
   }

}

function closeTicketModal(e){
    if(ticketModalOpen){
        document.querySelector(".ticket-modal").remove();
        ticketModalOpen = false;
    }
}

function handleKeyPress(e){
   if(e.key == "Enter" && isTextTyped && e.target.textContent){
     
    let filterSelected = document.querySelector(".selected-filter").classList[1];
    let ticketId = uid();
    let ticketInfoObject = {
        ticketFilter: filterSelected,
        ticketValue: e.target.textContent,
        ticketId: ticketId
    };
    appendTicket(ticketInfoObject);//to show in body
    closeModal.click();
    saveTicketToDb(ticketInfoObject);
   }
   if(!isTextTyped){
    isTextTyped = true;
    e.target.textContent = "";
   }
}

function saveTicketToDb(ticketInfoObject){
    let allTickets = myDB.getItem("allTickets");
    
    if(allTickets){
        allTickets = JSON.parse(allTickets);
        allTickets.push(ticketInfoObject);
        myDB.setItem("allTickets", JSON.stringify(allTickets));

    }else{
        //creating new array
        let allTickets = [ticketInfoObject];
        myDB.setItem("allTickets", JSON.stringify(allTickets));
    }
}



function appendTicket(ticketInfoObject){
    let {ticketFilter, ticketValue, ticketId} = ticketInfoObject;
    let ticketDiv = document.createElement("div");
    ticketDiv.classList.add("ticket");
    ticketDiv.innerHTML = `
    <div class="ticket-header ${ticketFilter}">
       
    </div>
    <div class="ticket-content">
        <div class="ticket-info">
            <div class="ticket-id">${ticketId}</div>
            <div class="ticket-edit"><i class="fa-solid fa-pen-to-square"></i></div>
            <div class="ticket-delete"><i class="fa-solid fa-trash"></i></div>
        </div>
        <div class="ticket-value">
            ${ticketValue}
        </div>
    </div>
    ` 
;

let ticketHeader = ticketDiv.querySelector(".ticket-header");

ticketHeader.addEventListener("click", function(e){
    let currentFilter = e.target.classList[1];
    let indexCurrFilter = allFilterClasses.indexOf(currentFilter);
    let newIndex = (indexCurrFilter + 1) % allFilterClasses.length;
    let newFilter =  allFilterClasses[newIndex];
    ticketHeader.style.backgroundColor = newFilter;
    ticketHeader.classList.remove(currentFilter);
    ticketHeader.classList.add(newFilter);
//all the data saved in the form of string, so converted top parse
    let allTickets = JSON.parse(myDB.getItem("allTickets"));

    for(let i = 0; i<allTickets.length; i++){
        if(allTickets[i].ticketId == ticketId){
            allTickets[i].ticketFilter = newFilter;
        }
    }
//all the data must be saved in the form of string again
    myDB.setItem("allTickets", JSON.stringify(allTickets));
});

let deleteTicketBtn = ticketDiv.querySelector(".ticket-delete");

deleteTicketBtn.addEventListener("click", function(e){
    ticketDiv.remove();
    let allTickets = JSON.parse(myDB.getItem("allTickets"));
    
   let updatedTicket = allTickets.filter(function(ticketObject){
       if(ticketObject.ticketId == ticketId){
        return false;
       }
       return true;
   });

 

//all the data must be saved in the form of string again
    myDB.setItem("allTickets", JSON.stringify(updatedTicket));
});

ticketsContainer.append(ticketDiv);

let editTicketBtn = ticketDiv.querySelector(".ticket-edit");
editTicketBtn.addEventListener("click", function(e){
    function openModal(e) {
        if (ticketModalOpen) return;

        let ticketModal = document.createElement("div");
        ticketModal.classList.add("ticket-modal");

        ticketModal.innerHTML = `
        <div class="ticket-text" contenteditable="true">
        ${ticketValue}
        </div>
      <div class="ticket-filters" >
        <div class="ticket-filter2 red selected-filter"></div>
        <div class="ticket-filter2 yellow"></div>
        <div class="ticket-filter2 green"></div>
        <div class="ticket-filter2 blue"></div>
        <div class="ticket-filter2 black"></div>
    </div>
        `;

        document.querySelector("body").append(ticketModal);
        ticketModalOpen = true;
        isTextTyped = true;
        let ticketTextDiv = document.querySelector(".ticket-text");
        ticketTextDiv.addEventListener("keypress", handleKeyPress);

        let ticketFilters = ticketModal.querySelectorAll(".ticket-filter2");
     
        for(let i = 0; i<ticketFilters.length; i++){
            ticketFilters[i].addEventListener("click", function(e){
                if(e.target.classList.contains("selected-filter")) return;
                document.querySelector(".selected-filter").classList.remove("selected-filter");
                e.target.classList.add("selected-filter");
            });
        }
    }
    openModal();

    function handleKeyPress(e){
        if(e.key == "Enter" && isTextTyped && e.target.textContent){
     
            let filterSelected = document.querySelector(".selected-filter").classList[1];
             ticketId = ticketId;
            let ticketInfoObject = {
                ticketFilter: filterSelected,
                ticketValue: e.target.textContent,
                ticketId: ticketId
            };
            ticketDiv.remove();
            let allTickets = JSON.parse(myDB.getItem("allTickets"));
            let updatedTickets = allTickets.filter(function (ticketObject) {
                if (ticketObject.ticketId == ticketId) {
                  return false;
                }
                return true;
              });
              myDB.setItem("allTickets", JSON.stringify(updatedTickets));

              appendTicket(ticketInfoObject);
              closeModal.click();
              saveTicketToDb(ticketInfoObject);
            }
            if (!isTextTyped) {
              isTextTyped = true;
              e.target.textContent = "";
            }
    }
});
}