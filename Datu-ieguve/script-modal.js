let menu = document.querySelector('#menu-btn')
let header = document.querySelector('header')




window.onscroll = function(){
    menu.classList.remove('fa-times')
    header.classList.remove('active')  
}


if(window.history.replaceState){

    window.history.replaceState(null,null,window.Location.href);
}

function close(){
    let alert = document.querySelector("#pazinojums")
    alert.style.display = "none"
}



let applyBtns = document.querySelectorAll('.btnApply')
let closeModal = document.querySelector('.close_modal')
let modal = document.querySelector('.modal')
let inputforID = document.querySelector('input[name=kursaID]')


applyBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      
        modal.classList.add('modalActive')
        let btnID = btn.getAttribute('value')
        inputforID.value = btnID
    })
})

closeModal.onclick = function(){
    modal.classList.remove('modalActive')
}