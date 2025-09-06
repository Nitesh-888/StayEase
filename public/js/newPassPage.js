document.getElementById('form').addEventListener('submit', (event)=>{
    let newPass = document.getElementById('newPass');
    let comfirmPass = document.getElementById('confirmPass');
    const errorMsg = document.getElementById('error-msg');
    if(newPass.value != comfirmPass.value){
        event.preventDefault();
        errorMsg.style.display='block';
        errorMsg.textContent = "⚠️ Passwords do not match";
        setTimeout(()=>{
            errorMsg.style.display='none';
        }, 2000)
    }
})